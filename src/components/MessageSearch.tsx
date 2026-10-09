/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./messageSearch.css";

import ErrorBoundary from "@components/ErrorBoundary";
import { keywords } from "@shared/messageSearch";
import { cachedSearch, canReadChannel, channelLabel, HistoryProgress, searchHistory, SearchMessage, SearchOptions, searchSnapshot, storeAttachmentText, subscribeSearch } from "@utils/messageSearchService";
import { ChannelRouter, ConfirmModal, FluxDispatcher, MessageActions, openModal, React, SelectedChannelStore, UserStore } from "@webpack/common";

type Extractor = (url: string, filename: string) => Promise<{ text: string; note: string; }>;
let extractor: Extractor | undefined;
export function setAttachmentExtractor(value?: Extractor) { extractor = value; }

function jump(message: SearchMessage, close?: () => void) {
    close?.();
    FluxDispatcher.dispatch({ type: "QUICKSWITCHER_HIDE" });
    ChannelRouter.transitionToChannel(message.channelId);
    MessageActions.jumpToMessage({ channelId: message.channelId, messageId: message.id, flash: true, jumpType: "INSTANT" });
}

function Results({ messages, close }: { messages: SearchMessage[]; close?: () => void; }) {
    const [busy, setBusy] = React.useState<string>();
    const [notice, setNotice] = React.useState("");
    const mounted = React.useRef(true);
    React.useEffect(() => () => { mounted.current = false; }, []);
    return <div className="eqy-search-results">
        {notice && <p role="status">{notice}</p>}
        {messages.map(message => <article key={message.id}>
            <button className="eqy-search-result" onClick={() => jump(message, close)}>
                <strong>{message.author} · {channelLabel(message.channelId)}</strong>
                <small>{new Date(message.timestamp).toLocaleString()}</small>
                <span>{message.content.slice(0, 800) || "Messaggio con allegati"}</span>
                {message.attachments.map(file => <small key={file.id}>📎 {file.filename}{file.text ? " · testo indicizzato" : ""}</small>)}
            </button>
            {extractor && message.attachments.map(file => <button key={file.id} disabled={!!busy} onClick={async () => {
                setBusy(file.id); setNotice("");
                const account = UserStore.getCurrentUser()?.id;
                try {
                    const result = await extractor!(file.url, file.filename);
                    if (mounted.current && account === UserStore.getCurrentUser()?.id && canReadChannel(message.channelId)) { storeAttachmentText(message.id, file.id, result.text); setNotice(result.note); }
                } catch (error) { if (mounted.current) setNotice(String(error)); }
                finally { if (mounted.current) setBusy(undefined); }
            }}>{busy === file.id ? "Lettura…" : "Leggi testo: " + file.filename}</button>)}
        </article>)}
        {!messages.length && <p>Nessun risultato nei messaggi caricati. Puoi cercare nella cronologia qui sotto.</p>}
    </div>;
}

function SearchPanel({ initial, close }: { initial: SearchOptions; close: () => void; }) {
    const [query, setQuery] = React.useState(initial.query);
    const [channel, setChannel] = React.useState(initial.channelId ?? "");
    const [mine, setMine] = React.useState(false);
    const [busy, setBusy] = React.useState(false);
    const [progress, setProgress] = React.useState<HistoryProgress>();
    const [error, setError] = React.useState("");
    const active = React.useRef<AbortController | null>(null);
    const offsets = React.useRef(new Map<string, number>());
    const mode = initial.mode ?? "messages";
    React.useSyncExternalStore(subscribeSearch, searchSnapshot);
    React.useEffect(() => { active.current?.abort(); offsets.current.clear(); setProgress(undefined); }, [query, channel, mine]);
    React.useEffect(() => () => { active.current?.abort(); }, []);
    const options: SearchOptions = { ...initial, query, channelId: channel || undefined, authorId: mine ? UserStore.getCurrentUser()?.id : undefined, limit: 100 };
    const search = async () => {
        const controller = new AbortController(); active.current = controller; setBusy(true); setError("");
        try {
            // Related results use separate keyword searches (OR), followed by local ranking.
            const queries = mode === "related" ? keywords(query, 4) : [query];
            for (const word of queries) await searchHistory({ ...options, query: word, mode: mode === "related" ? "messages" : mode }, value => {
                if (!controller.signal.aborted) setProgress(value);
            }, controller.signal, mode === "related" ? new Map() : offsets.current);
        } catch (e) { if (!controller.signal.aborted) setError(String(e)); }
        finally { if (active.current === controller) { active.current = null; setBusy(false); } }
    };
    return <div className="eqy-search-panel">
        <input aria-label="Cerca messaggi o allegati" value={query} onChange={e => setQuery(e.currentTarget.value)} placeholder={mode === "attachments" ? "Nome file o testo già indicizzato" : "Scrivi cosa vuoi trovare"} />
        <label>Ambito <select value={channel} onChange={e => setChannel(e.currentTarget.value)}>
            <option value="">Tutte le chat caricate / cronologia di tutti i DM</option>
            {[...new Set([initial.channelId, SelectedChannelStore.getChannelId()].filter(Boolean))].map(id => <option key={id} value={id}>{channelLabel(id!)}</option>)}
        </select></label>
        <label><input type="checkbox" checked={mine} onChange={e => setMine(e.currentTarget.checked)} /> Solo i miei messaggi</label>
        {mode === "related" && <p>Correlazione per parole e rilevanza; i risultati si aprono nel messaggio originale.</p>}
        {mode === "attachments" && <p>Ricerca nei nomi e nel testo già letto. Per cercare dentro un file, elenca gli allegati e premi «Leggi testo». Nessun invio a servizi AI.</p>}
        <Results messages={cachedSearch(options)} close={close} />
        <button disabled={busy || mode !== "attachments" && !query.trim()} onClick={search}>{progress && mode !== "related" ? "Altri risultati dalla cronologia" : "Cerca nella cronologia"}</button>
        {busy && <button onClick={() => active.current?.abort()}>Annulla</button>}
        {progress && <p role="status">Chat controllate: {progress.checked}/{progress.channels} · messaggi recuperati: {progress.found} · errori: {progress.failed} · in indicizzazione: {progress.indexing}</p>}
        {error && <p role="alert">{error}</p>}
        <p>Massimo 25 risultati per chat a ogni passaggio. La ricerca globale della cronologia copre i DM; per un canale server seleziona quella chat. L’indice locale contiene al massimo 20.000 messaggi e si svuota alla disconnessione.</p>
    </div>;
}

export function openMessageSearch(initial: SearchOptions = { query: "" }) {
    return openModal(props => <ConfirmModal {...props} title={initial.mode === "related" ? "Related Messages" : initial.mode === "attachments" ? "Attachment Search" : "Message Search"} confirmText="Chiudi" cancelText="Chiudi" onConfirm={props.onClose} onCancel={props.onClose}>
        <SearchPanel initial={initial} close={props.onClose} />
    </ConfirmModal>);
}

export const QuickMessageResults = ErrorBoundary.wrap(({ query, limit, mine }: { query: string; limit: number; mine: boolean; }) => {
    React.useSyncExternalStore(subscribeSearch, searchSnapshot);
    if (query.trim().length < 2 || /^[#@!>*]/.test(query.trim())) return null;
    const options = { query, limit, authorId: mine ? UserStore.getCurrentUser()?.id : undefined };
    return <section className="eqy-search-quick" aria-label="Risultati messaggi">
        <strong>Messaggi nelle chat caricate</strong>
        <Results messages={cachedSearch(options)} />
        <button onClick={() => openMessageSearch(options)}>Cerca anche nella cronologia dei DM…</button>
    </section>;
}, { noop: true });
