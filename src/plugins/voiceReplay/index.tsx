/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ChatBarButton } from "@api/ChatButtons";
import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType, PluginNative } from "@utils/types";
import { ConfirmModal, openModal, React, SelectedChannelStore, useStateFromStores } from "@webpack/common";

import { pcmWav } from "./buffer";

const Native = VencordNative.pluginHelpers.VoiceReplay as PluginNative<typeof import("./native")>;
const durations = [{ label: "30 secondi", value: 30 }, { label: "1 minuto", value: 60, default: true }, { label: "2 minuti", value: 120 }, { label: "5 minuti", value: 300 }] as const;
const settings = definePluginSettings({
    retention: { type: OptionType.SELECT, description: "Durata massima del buffer audio locale. Modificala prima di avviare la cattura.", options: durations },
    language: { type: OptionType.SELECT, description: "Lingua della trascrizione locale Whisper (può contenere errori).", options: [
        { label: "Rileva lingua", value: "auto", default: true }, { label: "Italiano", value: "it" }, { label: "English", value: "en" }, { label: "Español", value: "es" }, { label: "Français", value: "fr" }, { label: "Deutsch", value: "de" }
    ] as const }
});
let running = false;
let voiceChannel: string | undefined;
let generation = 0;
const clearListeners = new Set<() => void>();
async function stop() { generation++; for (const clear of clearListeners) clear(); if (!IS_WEB) await Native.stopCapture().catch(() => {}); }

async function recover(seconds: number) {
    const segments = await Native.audioSnapshot(seconds);
    if (!segments.length) throw new Error("Il buffer è vuoto. Attendi alcuni secondi dopo l’avvio.");
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
            if (mounted.current && run === generation) setText(result || "Nessun parlato riconosciuto.");
        } else if (mounted.current) {
            if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
            const value = URL.createObjectURL(new Blob([Uint8Array.from(wav).buffer], { type: "audio/wav" }));
            objectUrl.current = value; setUrl(value);
        }
    };
    return <div className="eqy-search-panel">
        <p>Voice Replay conserva gli ultimi {settings.store.retention} secondi solo dopo l’avvio. Cattura l’audio riprodotto dal PC, compresi suoni di altre app. Non cattura il tuo microfono separatamente.</p>
        <label><input type="checkbox" checked={consent} onChange={e => setConsent(e.currentTarget.checked)} /> Ho informato i partecipanti e ho il consenso per registrare e trascrivere.</label>
        {IS_WEB ? <p>Il buffer audio e Whisper richiedono Discord desktop su Windows.</p> : <>
            <button disabled={!connected || !consent || active || busy} onClick={() => perform(async () => {
                if (!running) throw new Error("Plugin disattivato.");
                const run = generation, channel = SelectedChannelStore.getVoiceChannelId();
                await Native.startCapture(settings.store.retention ?? 60, consent);
                if (run !== generation || channel !== SelectedChannelStore.getVoiceChannelId()) { await Native.stopCapture(); return; }
                voiceChannel = channel; if (mounted.current) { setActive(true); setRetention(settings.store.retention ?? 60); }
            })}>Avvia buffer audio</button>
            <button disabled={!active && !busy} onClick={() => perform(stop)}>Ferma e cancella buffer</button>
            <p role="status">{active ? `Cattura attiva · ${chunks} segmenti · massimo ${retention} secondi` : "Cattura spenta"}{!connected ? " · Entra prima in un canale vocale" : ""}</p>
            <label>Recupera <select value={seconds} onChange={e => setSeconds(Number(e.currentTarget.value))}>{durations.filter(value => value.value <= retention).map(value => <option key={value.value} value={value.value}>{value.label}</option>)}</select></label>
            <button disabled={!active || busy} onClick={() => perform(() => obtain(false))}>Riascolta</button>
            <button disabled={!active || busy} onClick={() => perform(() => obtain(true))}>{busy ? "Elaborazione…" : "Trascrivi sul PC"}</button>
            {url && <audio controls src={url} onPlay={() => { void Native.pauseCapture(true).catch(() => {}); }} onPause={() => { void Native.pauseCapture(false).catch(() => {}); }} onEnded={() => { void Native.pauseCapture(false).catch(() => {}); }} />}
            {text && <p style={{ whiteSpace: "pre-wrap" }}>{text}</p>}
        </>}
        {notice && <p role="alert">{notice}</p>}
        <p>Si svuota cambiando canale, uscendo dalla voce, disconnettendoti o disattivando il plugin. Trascrizione su richiesta, senza riconoscimento dei singoli parlanti; possibili piccoli intervalli tra i segmenti. Il buffer si sospende durante il riascolto per non ricatturare l’audio.</p>
    </div>;
}

function ReplayIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10a9 9 0 1 1 2 8M3 4v6h6M12 7v5l3 2" /></svg>; }
function ReplayButton() {
    const [active, setActive] = React.useState(false);
    React.useEffect(() => {
        let mounted = true;
        const update = () => { if (!IS_WEB) Native.captureStatus().then(value => { if (mounted) setActive(value.active); }).catch(() => {}); };
        update(); const timer = setInterval(update, 1000);
        return () => { mounted = false; clearInterval(timer); };
    }, []);
    return <ChatBarButton tooltip={active ? "Voice Replay — cattura audio attiva" : "Voice Replay — buffer e trascrizione"} onClick={openReplay}><span style={{ color: active ? "var(--status-danger, #f04747)" : "inherit" }}><ReplayIcon /></span></ChatBarButton>;
}
function openReplay() { openModal(props => <ConfirmModal {...props} title="Voice Replay" confirmText="Chiudi" cancelText="Chiudi" onConfirm={props.onClose} onCancel={props.onClose}><Controls /></ConfirmModal>); }

export default definePlugin({
    name: "VoiceReplay",
    description: "Recover the last 30 seconds to 5 minutes of PC playback audio and transcribe locally with Whisper. Explicit start and participant consent required.",
    authors: [{ name: "0009cx0", id: 0n }],
    tags: ["Utility"],
    settings,
    start() { running = true; voiceChannel = SelectedChannelStore.getVoiceChannelId(); },
    stop() { running = false; void stop(); },
    flux: {
        VOICE_CHANNEL_SELECT({ channelId }: { channelId: string; }) { if (channelId !== voiceChannel) { voiceChannel = channelId; void stop(); } },
        LOGOUT() { void stop(); },
        CONNECTION_CLOSED() { void stop(); }
    },
    renderChatBarButton: ({ isMainChat }) => isMainChat ? <ReplayButton /> : null,
    chatBarButtonIcon: ReplayIcon,
    settingsAboutComponent: Controls
});
