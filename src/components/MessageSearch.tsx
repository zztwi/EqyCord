/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./messageSearch.css";

import { Button } from "@components/Button";
import ErrorBoundary from "@components/ErrorBoundary";
import { keywords } from "@shared/messageSearch";
import { cachedContext, cachedSearch, canReadChannel, channelLabel, HistoryProgress, loadMessageContext, searchAuthors, searchChannels, searchHistory, SearchMessage, SearchOptions, searchSnapshot, storeAttachmentText, subscribeSearch } from "@utils/messageSearchService";
import { RenderModalProps } from "@vencord/discord-types";
import { ChannelRouter, FluxDispatcher, MessageActions, Modal, openModal, React, SelectedChannelStore, UserStore } from "@webpack/common";

export type Extractor = (url: string, filename: string) => Promise<{ text: string; note: string; }>;
let extractor: Extractor | undefined;
export function setAttachmentExtractor(value?: Extractor) { extractor = value; }
export async function readAttachment(url: string, filename: string) {
    if (!extractor) throw new Error("Enable Attachment Search on Windows to read this file.");
    return extractor(url, filename);
}

function jump(message: SearchMessage, close?: () => void) {
    close?.();
    FluxDispatcher.dispatch({ type: "QUICKSWITCHER_HIDE" });
    ChannelRouter.transitionToChannel(message.channelId);
    MessageActions.jumpToMessage({ channelId: message.channelId, messageId: message.id, flash: true, jumpType: "INSTANT" });
}

function Highlight({ text, query }: { text: string; query: string; }) {
    const words = query.trim().split(/\s+/).filter(Boolean).slice(0, 12);
    if (!words.length) return <>{text}</>;
    const regex = new RegExp("(" + words.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")", "gi");
    return <>{text.split(regex).map((part, i) => i % 2 ? <mark key={i}>{part}</mark> : part)}</>;
}

function MessageRow({ message, query = "", close, context = false }: { message: SearchMessage; query?: string; close?: () => void; context?: boolean; }) {
    const [expanded, setExpanded] = React.useState(false);
    const [busy, setBusy] = React.useState(false);
    const [notice, setNotice] = React.useState("");
    const controller = React.useRef<AbortController | undefined>(undefined);
    const mounted = React.useRef(true);
    React.useEffect(() => () => { mounted.current = false; controller.current?.abort(); }, []);
    const user = UserStore.getUser(message.authorId);
    return <article className="eqy-message-row">
        <div className="eqy-message-avatar" aria-hidden="true">{user?.getAvatarURL?.() ? <img src={user.getAvatarURL()} alt="" /> : message.author.slice(0, 1)}</div>
        <div className="eqy-message-body">
            <div className="eqy-message-heading"><strong>{message.author}</strong><time dateTime={new Date(message.timestamp).toISOString()}>{new Date(message.timestamp).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" })}</time></div>
            <button className="eqy-message-location" onClick={() => jump(message, close)}>{channelLabel(message.channelId)} · Jump to message ↗</button>
            <div className="eqy-message-text"><Highlight text={message.content.slice(0, 4000) || "Attachment"} query={query} /></div>
            {!!message.linkTitles?.length && <small>{message.linkTitles.join(" · ")}</small>}
            {message.attachments.map(file => <div className="eqy-file-line" key={file.id}><span>📎 {file.filename}</span>{extractor && <button disabled={busy} onClick={async () => {
                setBusy(true); setNotice("");
                const account = UserStore.getCurrentUser()?.id;
                try {
                    const result = await readAttachment(file.url, file.filename);
                    if (mounted.current && account === UserStore.getCurrentUser()?.id && canReadChannel(message.channelId)) { storeAttachmentText(message.id, file.id, result.text); setNotice(result.note); }
                } catch (error) { if (mounted.current) setNotice(String(error)); }
                finally { if (mounted.current) setBusy(false); }
            }}>{busy ? "Reading…" : "Read text"}</button>}</div>)}
            {!context && <button className="eqy-text-action" disabled={busy} onClick={async () => {
                if (expanded) { setExpanded(false); return; }
                setExpanded(true); setBusy(true); setNotice("");
                const run = controller.current = new AbortController();
                try { await loadMessageContext(message, run.signal); }
                catch { if (mounted.current && !run.signal.aborted) setNotice("Could not load context. Showing available messages."); }
                finally { if (mounted.current) setBusy(false); }
            }}>{expanded ? "Hide context" : "Show context"}</button>}
            {notice && <p className="eqy-hint" role="status">{notice}</p>}
            {expanded && <div className="eqy-message-context">{cachedContext(message.id).filter(item => item.id !== message.id).map(item => <MessageRow key={item.id} message={item} close={close} context />)}</div>}
        </div>
    </article>;
}

export function MessageResults({ messages, query, close }: { messages: SearchMessage[]; query?: string; close?: () => void; }) {
    return <div className="eqy-search-results" role="list" aria-label="Message results">
        {messages.map(message => <MessageRow key={message.id} message={message} query={query} close={close} />)}
        {!messages.length && <div className="eqy-empty"><strong>No matching messages</strong><p>Try a different phrase or broaden your filters.</p></div>}
    </div>;
}

function SearchDialog({ initial, rootProps }: { initial: SearchOptions; rootProps: RenderModalProps; }) {
    const [query, setQuery] = React.useState(initial.query);
    const [channel, setChannel] = React.useState(initial.channelId ?? "");
    const [author, setAuthor] = React.useState(initial.authorId ?? "");
    const [kind, setKind] = React.useState<SearchOptions["kind"]>(initial.kind ?? "all");
    const [after, setAfter] = React.useState("");
    const [before, setBefore] = React.useState("");
    const [filtersOpen, setFiltersOpen] = React.useState(initial.mode !== "duplicates");
    const [searched, setSearched] = React.useState(initial.mode === "duplicates");
    const [busy, setBusy] = React.useState(false);
    const [progress, setProgress] = React.useState<HistoryProgress>();
    const [error, setError] = React.useState("");
    const active = React.useRef<AbortController | null>(null);
    const offsets = React.useRef(new Map<string, number>());
    const mode = initial.mode ?? "messages";
    React.useSyncExternalStore(subscribeSearch, searchSnapshot);
    React.useEffect(() => { active.current?.abort(); offsets.current.clear(); setProgress(undefined); setBusy(false); }, [query, channel, author, kind, after, before]);
    React.useEffect(() => () => { active.current?.abort(); }, []);
    const options: SearchOptions = { ...initial, query, channelId: channel || undefined, authorId: author || undefined, kind, after: after ? new Date(after).getTime() : undefined, before: before ? new Date(before).getTime() + 86400000 - 1 : undefined, limit: 100 };
    const search = async () => {
        setSearched(true); setFiltersOpen(false);
        if (mode === "duplicates") return;
        const controller = new AbortController(); active.current = controller; setBusy(true); setError("");
        try {
            const queries = mode === "related" ? keywords(query, 4) : [query];
            for (const word of queries) await searchHistory({ ...options, query: word, mode: mode === "related" ? "messages" : mode }, value => {
                if (!controller.signal.aborted) setProgress(value);
            }, controller.signal, mode === "related" ? new Map() : offsets.current);
        } catch (e) { if (!controller.signal.aborted) setError(String(e)); }
        finally { if (active.current === controller) { active.current = null; setBusy(false); } }
    };
    const messages = cachedSearch(options);
    const authors = searchAuthors();
    const title = mode === "related" ? "Related Messages" : mode === "attachments" ? "Attachment Search" : mode === "duplicates" ? "Duplicate Finder" : "Message Search";
    return <Modal {...rootProps} size="lg" title={title} actions={[
        { text: "Close", variant: "secondary", onClick: rootProps.onClose },
        ...(busy ? [{ text: "Cancel search", variant: "secondary", onClick: () => active.current?.abort() }] : mode === "duplicates" ? [] : [{ text: searched ? "Search more" : "Search", variant: "primary", onClick: search, disabled: mode !== "attachments" && !query.trim() }])
    ]}>
        <div className="eqy-search-panel">
            {mode !== "duplicates" && <input aria-label="Search messages or attachments" value={query} onChange={e => setQuery(e.currentTarget.value)} onKeyDown={e => { if (e.key === "Enter" && !busy) void search(); }} placeholder={mode === "attachments" ? "Search filenames or extracted text" : "Search messages, links or keywords"} />}
            {filtersOpen && <div className="eqy-filter-row">
                <label>In<select value={channel} onChange={e => setChannel(e.currentTarget.value)}><option value="">All loaded chats · DM history</option>{[...new Set([...searchChannels(), initial.channelId, SelectedChannelStore.getChannelId()].filter(Boolean))].map(id => <option key={id} value={id}>{channelLabel(id!)}</option>)}</select></label>
                <label>From<select value={author} onChange={e => setAuthor(e.currentTarget.value)}><option value="">Anyone</option><option value={UserStore.getCurrentUser()?.id}>Me</option>{authors.filter(([id]) => id !== UserStore.getCurrentUser()?.id).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label>
            </div>}
            {filtersOpen && <div className="eqy-filter-row">
                <label>Has<select value={kind} onChange={e => setKind(e.currentTarget.value as SearchOptions["kind"])}>{["all", "links", "images", "videos", "files"].map(value => <option key={value} value={value}>{value === "all" ? "Anything" : value[0].toUpperCase() + value.slice(1)}</option>)}</select></label>
                <label>After<input type="date" value={after} onChange={e => setAfter(e.currentTarget.value)} /></label>
                <label>Before<input type="date" value={before} onChange={e => setBefore(e.currentTarget.value)} /></label>
            </div>}
            {mode === "duplicates" && <p className="eqy-hint">Matches the same link or uploaded file in loaded chats. Matching URLs do not prove that separately uploaded files have identical contents.</p>}
            {mode === "related" && <p className="eqy-hint">Finds shared keywords and ranks their relevance.</p>}
            {searched ? <><div className="eqy-results-heading"><strong>{messages.length} results</strong><Button variant="secondary" size="small" onClick={() => setFiltersOpen(value => !value)}>{filtersOpen ? "Hide filters" : "Filters"}</Button>{busy && <span role="status">Searching…</span>}</div><MessageResults messages={messages} query={query} close={rootProps.onClose} /></> : <p className="eqy-hint">Search across available messages and request older DM history. Select a server channel to search its history.</p>}
            {progress && <p className="eqy-hint" role="status">{progress.checked}/{progress.channels} chats searched · {progress.found} messages retrieved{progress.failed ? ` · ${progress.failed} unavailable chats` : ""}{progress.indexing ? ` · ${progress.indexing} chats still indexing` : ""}</p>}
            {error && <p className="eqy-error" role="alert">{error}</p>}
            {searched && mode !== "duplicates" && <details className="eqy-hint"><summary>Search coverage</summary><p>Each search retrieves up to 25 results per chat. Dates filter retrieved results. Global history covers DMs; select a server channel for its history. Loaded messages stay in memory until disconnect.</p></details>}
        </div>
    </Modal>;
}

export function openMessageSearch(initial: SearchOptions = { query: "" }) {
    return openModal(props => <SearchDialog initial={initial} rootProps={props} />);
}

export const QuickMessageResults = ErrorBoundary.wrap(({ query, limit, mine }: { query: string; limit: number; mine: boolean; }) => {
    React.useSyncExternalStore(subscribeSearch, searchSnapshot);
    if (query.trim().length < 2 || /^[#@!>*]/.test(query.trim())) return null;
    const options = { query, limit, authorId: mine ? UserStore.getCurrentUser()?.id : undefined };
    return <section className="eqy-search-quick" aria-label="Message results">
        <div className="eqy-results-heading"><strong>Messages</strong><Button size="small" variant="secondary" onClick={() => { FluxDispatcher.dispatch({ type: "QUICKSWITCHER_HIDE" }); openMessageSearch(options); }}>Search</Button></div>
        <MessageResults messages={cachedSearch(options)} query={query} />
    </section>;
}, { noop: true });
