/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "@components/messageSearch.css";

import { definePluginSettings } from "@api/Settings";
import { Button } from "@components/Button";
import { registerVoiceButton, unregisterVoiceButton } from "@plugins/_api/voicePanel";
import definePlugin, { OptionType, PluginNative } from "@utils/types";
import { Modal, openModal, React, SelectedChannelStore, useStateFromStores } from "@webpack/common";

import { pcmWav } from "./buffer";

const Native = VencordNative.pluginHelpers.VoiceReplay as PluginNative<typeof import("./native")>;
const durations = [{ label: "30 seconds", value: 30 }, { label: "1 minute", value: 60, default: true }, { label: "2 minutes", value: 120 }, { label: "5 minutes", value: 300 }] as const;
const settings = definePluginSettings({
    retention: { type: OptionType.SELECT, description: "Maximum local audio buffer duration. Change it before starting capture.", options: durations },
    language: { type: OptionType.SELECT, description: "Language for local Whisper transcription (may contain errors).", options: [
        { label: "Detect language", value: "auto", default: true }, { label: "Italian", value: "it" }, { label: "English", value: "en" }, { label: "Spanish", value: "es" }, { label: "French", value: "fr" }, { label: "German", value: "de" }
    ] as const }
});
let running = false;
let voiceChannel: string | undefined;
let generation = 0;
const clearListeners = new Set<() => void>();
async function stop() { generation++; for (const clear of clearListeners) clear(); if (!IS_WEB) await Native.stopCapture().catch(() => {}); }

async function recover(seconds: number) {
    const segments = await Native.audioSnapshot(seconds);
    if (!segments.length) throw new Error("The buffer is empty. Wait a few seconds after starting capture.");
    const context = new AudioContext({ sampleRate: 16000 });
    try {
        const decoded: Float32Array[] = [];
        for (const segment of segments) {
            const bytes = Uint8Array.from(segment.bytes);
            const audio = await context.decodeAudioData(bytes.buffer);
            const mono = new Float32Array(audio.length);
            for (let channel = 0; channel < audio.numberOfChannels; channel++) {
                const data = audio.getChannelData(channel);
                for (let i = 0; i < mono.length; i++) mono[i] += data[i] / audio.numberOfChannels;
            }
            decoded.push(mono);
        }
        const combined = new Float32Array(decoded.reduce((sum, item) => sum + item.length, 0));
        let offset = 0; for (const item of decoded) { combined.set(item, offset); offset += item.length; }
        return pcmWav(combined);
    } finally { await context.close(); }
}

function Controls() {
    const [active, setActive] = React.useState(false);
    const [consent, setConsent] = React.useState(false);
    const [seconds, setSeconds] = React.useState<number>(30);
    const [retention, setRetention] = React.useState<number>(settings.store.retention ?? 60);
    const [chunks, setChunks] = React.useState(0);
    const [busy, setBusy] = React.useState(false);
    const [notice, setNotice] = React.useState("");
    const [text, setText] = React.useState("");
    const [url, setUrl] = React.useState<string>();
    const objectUrl = React.useRef<string | undefined>(undefined);
    const mounted = React.useRef(true);
    const connected = useStateFromStores([SelectedChannelStore], () => !!SelectedChannelStore.getVoiceChannelId());
    const clear = () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); objectUrl.current = undefined; if (mounted.current) { setUrl(undefined); setText(""); setActive(false); } };
    React.useEffect(() => {
        clearListeners.add(clear);
        const refresh = () => { if (!IS_WEB) Native.captureStatus().then(value => { if (mounted.current) { setActive(value.active); setRetention(value.seconds); setChunks(value.chunks); if (value.error) setNotice(value.error); } }).catch(e => { if (mounted.current) setNotice(String(e)); }); };
        refresh(); const timer = setInterval(refresh, 1000);
        return () => { mounted.current = false; clearListeners.delete(clear); clearInterval(timer); if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); if (!IS_WEB) void Native.pauseCapture(false).catch(() => {}); };
    }, []);
    const perform = async (action: () => Promise<void>) => { setBusy(true); setNotice(""); try { await action(); } catch (e) { if (mounted.current) setNotice(String(e)); } finally { if (mounted.current) setBusy(false); } };
    const obtain = async (transcript: boolean) => {
        const run = generation;
        const wav = await recover(seconds);
        if (!running || run !== generation) return;
        if (transcript) {
            const result = await Native.transcribe(wav, settings.store.language ?? "auto");
            if (mounted.current && run === generation) setText(result || "No speech recognized.");
        } else if (mounted.current) {
            if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
            const value = URL.createObjectURL(new Blob([Uint8Array.from(wav).buffer], { type: "audio/wav" }));
            objectUrl.current = value; setUrl(value);
        }
    };
    return <div className="eqy-search-panel">
        <p className="eqy-hint">Voice Replay keeps the last {settings.store.retention} seconds after you start capture. It records PC playback, including other apps, without a separate microphone track.</p>
        <label><input type="checkbox" checked={consent} onChange={e => setConsent(e.currentTarget.checked)} /> Participants have been informed and consent to recording and transcription.</label>
        {IS_WEB ? <p>Audio capture and Whisper require Discord desktop on Windows.</p> : <>
            <div className="eqy-control-actions"><Button variant="primary" disabled={!running || !connected || !consent || active || busy} onClick={() => perform(async () => {
                if (!running) throw new Error("Plugin disabled.");
                const run = generation, channel = SelectedChannelStore.getVoiceChannelId();
                await Native.startCapture(settings.store.retention ?? 60, consent);
                if (run !== generation || channel !== SelectedChannelStore.getVoiceChannelId()) { await Native.stopCapture(); return; }
                voiceChannel = channel; if (mounted.current) { setActive(true); setRetention(settings.store.retention ?? 60); }
            })}>Start capture</Button>
            <Button variant="secondary" disabled={!active && !busy} onClick={() => perform(stop)}>Stop and clear</Button></div>
            <p role="status">{active ? `Recording � ${chunks} segments � up to ${retention} seconds` : "Capture off"}{!connected ? " � Join a voice channel first" : ""}</p>
            <label>Replay duration <select value={seconds} onChange={e => setSeconds(Number(e.currentTarget.value))}>{durations.filter(value => value.value <= retention).map(value => <option key={value.value} value={value.value}>{value.label}</option>)}</select></label>
            <div className="eqy-control-actions"><Button variant="secondary" disabled={!active || busy} onClick={() => perform(() => obtain(false))}>Replay audio</Button>
            <Button variant="secondary" disabled={!active || busy} onClick={() => perform(() => obtain(true))}>{busy ? "Processing�" : "Transcribe locally"}</Button></div>
            {url && <audio controls src={url} onPlay={() => { void Native.pauseCapture(true).catch(() => {}); }} onPause={() => { void Native.pauseCapture(false).catch(() => {}); }} onEnded={() => { void Native.pauseCapture(false).catch(() => {}); }} />}
            {text && <p style={{ whiteSpace: "pre-wrap" }}>{text}</p>}
        </>}
        {notice && <p role="alert">{notice}</p>}
        <details className="eqy-hint"><summary>About capture</summary><p>The buffer clears when you change channels, leave voice, disconnect or disable this plugin. Transcription is on demand; speakers are not identified. Small gaps between segments are possible. Capture pauses while replay audio plays.</p></details>
    </div>;
}

function ReplayIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10a9 9 0 1 1 2 8M3 4v6h6M12 7v5l3 2" /></svg>; }
let captureActive = false;
let statusTimer: ReturnType<typeof setInterval> | undefined;
function openReplay() { openModal(props => <Modal {...props} title="Voice Replay" size="md" actions={[{ text: "Close", variant: "secondary", onClick: props.onClose }]}><Controls /></Modal>); }

export default definePlugin({
    name: "VoiceReplay",
    description: "Recover the last 30 seconds to 5 minutes of PC playback audio and transcribe locally with Whisper. Explicit start and participant consent required.",
    authors: [{ name: "0009cx0", id: 0n }],
    tags: ["Utility"],
    settings,
    dependencies: ["VoicePanelAPI"],
    start() {
        running = true; voiceChannel = SelectedChannelStore.getVoiceChannelId();
        registerVoiceButton("replay", { label: "Voice Replay � record, replay and transcribe", icon: ReplayIcon, action: openReplay, active: () => captureActive });
        if (!IS_WEB) statusTimer = setInterval(() => { Native.captureStatus().then(value => { captureActive = value.active; }).catch(() => { captureActive = false; }); }, 1000);
    },
    stop() { running = false; captureActive = false; clearInterval(statusTimer); unregisterVoiceButton("replay"); void stop(); },
    flux: {
        VOICE_CHANNEL_SELECT({ channelId }: { channelId: string; }) { if (channelId !== voiceChannel) { voiceChannel = channelId; void stop(); } },
        LOGOUT() { void stop(); },
        CONNECTION_CLOSED() { void stop(); }
    },
    settingsAboutComponent: Controls
});
