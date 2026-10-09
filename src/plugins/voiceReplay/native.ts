/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { randomUUID } from "node:crypto";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { BrowserWindow, desktopCapturer, ipcMain, IpcMainInvokeEvent, session } from "electron";

import { RollingAudio } from "./buffer";
import { transcribeWav } from "./transcribe";

let capture: BrowserWindow | undefined;
let owner = 0;
let directory: string | undefined;
let chunkChannel: string | undefined;
let error = "";
let pending = false;
let transcribing: AbortController | undefined;
let epoch = 0;
let paused = false;
let audio = new RollingAudio();

async function cleanup() {
    epoch++; pending = false; transcribing?.abort(); transcribing = undefined;
    const window = capture; capture = undefined; owner = 0;
    if (chunkChannel) ipcMain.removeAllListeners(chunkChannel);
    chunkChannel = undefined;
    if (window && !window.isDestroyed()) window.destroy();
    audio.clear();
    paused = false;
    const oldDirectory = directory; directory = undefined;
    if (oldDirectory) await rm(oldDirectory, { recursive: true, force: true }).catch(() => {});
}

export async function startCapture(event: IpcMainInvokeEvent, seconds: number, consent: boolean) {
    if (process.platform !== "win32") throw new Error("VoiceReplay richiede Discord desktop su Windows.");
    if (!consent || ![30, 60, 120, 300].includes(seconds)) throw new Error("Conferma il consenso e scegli una durata valida.");
    if (capture || pending) throw new Error("Il buffer audio è già attivo.");
    pending = true; owner = event.sender.id; error = "";
    const run = ++epoch;
    try {
        audio = new RollingAudio(seconds);
        directory = await mkdtemp(join(tmpdir(), "eqy-capture-"));
        if (run !== epoch) throw new Error("Avvio annullato.");
        chunkChannel = "eqy-voice-" + randomUUID();
        const preload = join(directory, "preload.js");
        await writeFile(preload, `const {contextBridge,ipcRenderer}=require('electron');contextBridge.exposeInMainWorld('captureBridge',{chunk:(bytes,mime)=>ipcRenderer.send(${JSON.stringify(chunkChannel)},bytes,mime)});`);
        if (run !== epoch) throw new Error("Avvio annullato.");
        const isolated = session.fromPartition("eqy-voice-" + randomUUID());
        isolated.setPermissionRequestHandler((_webContents, permission, callback) => callback(permission === "media" || permission === "display-capture"));
        isolated.setDisplayMediaRequestHandler(async (_request, callback) => {
            try { const sources = await desktopCapturer.getSources({ types: ["screen"], thumbnailSize: { width: 0, height: 0 } }); callback(sources[0] ? { video: sources[0], audio: "loopback" } : {}); }
            catch { callback({}); }
        });
        // No title: keep this isolated preload outside Discord's patched BrowserWindow path.
        const window = capture = new BrowserWindow({ show: false, width: 1, height: 1, webPreferences: { preload, session: isolated, sandbox: true, contextIsolation: true, nodeIntegration: false, backgroundThrottling: false } });
        window.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
        window.webContents.on("will-navigate", e => e.preventDefault());
        ipcMain.on(chunkChannel, (e, bytes, mime) => {
            if (paused || capture !== window || e.sender.id !== window.webContents.id || !(bytes instanceof Uint8Array) || typeof mime !== "string" || !/^audio\/webm/.test(mime)) return;
            audio.push({ bytes: Uint8Array.from(bytes), mime, timestamp: Date.now() });
        });
        event.sender.once("destroyed", () => { if (owner === event.sender.id) void cleanup(); });
        window.on("closed", () => { if (capture === window) { error = "Cattura audio interrotta."; void cleanup(); } });
        await window.loadURL("data:text/html;charset=utf-8," + encodeURIComponent(`<html><body><script>
let stream, active=false;
async function start(){
 stream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:true});
 if(!stream.getAudioTracks().length){stream.getTracks().forEach(t=>t.stop());throw Error('Audio loopback non disponibile.');}
 active=true;
 stream.getTracks().forEach(t=>t.onended=()=>{active=false;stream.getTracks().forEach(x=>x.stop());window.close();});
 const audio=new MediaStream(stream.getAudioTracks());
 function segment(){if(!active)return;const recorder=new MediaRecorder(audio,{mimeType:'audio/webm;codecs=opus'});const parts=[];
 recorder.ondataavailable=e=>{if(e.data.size)parts.push(e.data)};
 recorder.onstop=async()=>{if(active){const bytes=new Uint8Array(await new Blob(parts,{type:recorder.mimeType}).arrayBuffer());captureBridge.chunk(bytes,recorder.mimeType);segment();}};
 recorder.start();setTimeout(()=>{if(recorder.state!=='inactive')recorder.stop()},1000);}
 segment();return true;
}
</script></body></html>`));
        if (run !== epoch) throw new Error("Avvio annullato.");
        await window.webContents.executeJavaScript("start()", true);
        if (run !== epoch) throw new Error("Avvio annullato.");
        pending = false;
        return { active: true, seconds };
    } catch (e) { error = String(e); await cleanup(); throw e; }
}

export async function stopCapture(event: IpcMainInvokeEvent) {
    if (owner && event.sender.id !== owner) throw new Error("Sessione audio diversa.");
    await cleanup(); return true;
}
export function captureStatus(event: IpcMainInvokeEvent) {
    return { active: !!capture && !pending && owner === event.sender.id, paused, seconds: audio.seconds, chunks: owner === event.sender.id ? audio.count : 0, error };
}
export function pauseCapture(event: IpcMainInvokeEvent, value: boolean) {
    if (owner !== event.sender.id || !capture) return false;
    paused = !!value; return true;
}
export function audioSnapshot(event: IpcMainInvokeEvent, seconds: number) {
    if (owner !== event.sender.id || !capture || pending) throw new Error("Avvia prima il buffer audio.");
    if (![30, 60, 120, 300].includes(seconds)) throw new Error("Durata non valida.");
    return audio.snapshot(seconds);
}
export async function transcribe(event: IpcMainInvokeEvent, wav: Uint8Array, language: string) {
    if (owner !== event.sender.id || !capture) throw new Error("Buffer audio non attivo.");
    if (transcribing) throw new Error("Trascrizione già in corso.");
    const controller = transcribing = new AbortController();
    try { return await transcribeWav(join(__dirname, "vendor", "voice-replay"), wav, language, controller.signal); }
    finally { if (transcribing === controller) transcribing = undefined; }
}
