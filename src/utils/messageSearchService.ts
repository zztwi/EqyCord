/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { MessageIndex, parseSearchResponse, SearchMessage, SearchOptions } from "@shared/messageSearch";
import { ChannelStore, FluxDispatcher, GuildStore, MessageStore, PermissionsBits, PermissionStore, PrivateChannelSortStore, RestAPI, SelectedChannelStore, UserStore } from "@webpack/common";

const index = new MessageIndex();
const listeners = new Set<() => void>();
const users = new Set<string>();
let revision = 0;
let accountId: string | undefined;
let generation = 0;
export const searchSnapshot = () => revision;
export function subscribeSearch(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function emit() { revision++; for (const listener of listeners) listener(); }
export function canReadChannel(channelId: string) {
    const channel = ChannelStore.getChannel(channelId);
    return !!channel && (channel.isPrivate() || PermissionStore.can(PermissionsBits.VIEW_CHANNEL, channel) && PermissionStore.can(PermissionsBits.READ_MESSAGE_HISTORY, channel));
}
function ensureAccount() {
    const current = UserStore.getCurrentUser()?.id;
    if (current !== accountId) { accountId = current; generation++; index.clear(); emit(); }
    return current;
}
export function indexMessage(message: any, channelId = message?.channel_id) {
    if (!ensureAccount() || !channelId || !canReadChannel(channelId) || !message?.id) return;
    const previous = MessageStore.getMessage(channelId, message.id);
    const value = { ...previous, ...message };
    index.upsert({
        id: value.id, channelId, authorId: value.author?.id ?? "", author: value.author?.globalName ?? value.author?.global_name ?? value.author?.username ?? "User",
        content: value.content ?? "", timestamp: Number(new Date(value.timestamp ?? 0)) || 0,
        links: [...(value.content?.match(/https?:\/\/[^\s<>]+/g) ?? []), ...(value.embeds ?? []).map((embed: any) => embed.url).filter(Boolean)],
        linkTitles: (value.embeds ?? []).map((embed: any) => embed.rawTitle ?? embed.title ?? ""),
        attachments: (value.attachments ?? []).map((file: any) => ({ id: file.id, filename: file.filename ?? "Attachment", url: file.url, size: file.size }))
    });
}
function seed() {
    ensureAccount();
    const ids = new Set(Object.keys(ChannelStore.getMutablePrivateChannels()));
    for (const guildId of Object.keys(GuildStore.getGuilds())) for (const channelId of Object.keys(ChannelStore.getMutableGuildChannelsForGuild(guildId))) ids.add(channelId);
    if (SelectedChannelStore.getChannelId()) ids.add(SelectedChannelStore.getChannelId());
    for (const id of ids) if (canReadChannel(id)) for (const message of MessageStore.getMessages(id)?._array ?? []) indexMessage(message, id);
    emit();
}
const events = {
    MESSAGE_CREATE: (event: any) => { indexMessage(event.message); emit(); },
    MESSAGE_UPDATE: (event: any) => { indexMessage(event.message); emit(); },
    LOAD_MESSAGES_SUCCESS: (event: any) => { for (const message of event.messages ?? []) indexMessage(message, event.channelId); emit(); },
    MESSAGE_DELETE: (event: any) => { index.remove(event.id); emit(); },
    MESSAGE_DELETE_BULK: (event: any) => { for (const id of event.ids ?? []) index.remove(id); emit(); },
    CHANNEL_DELETE: (event: any) => { index.removeChannel(event.channel?.id ?? event.channelId); emit(); },
    LOGOUT: () => { accountId = undefined; generation++; index.clear(); emit(); },
    CONNECTION_OPEN: () => seed()
};
export function acquireSearch(name: string) {
    if (users.has(name)) return;
    users.add(name);
    if (users.size === 1) { for (const [type, callback] of Object.entries(events)) FluxDispatcher.subscribe(type as any, callback); seed(); }
}
export function releaseSearch(name: string) {
    users.delete(name);
    if (users.size) return;
    for (const [type, callback] of Object.entries(events)) FluxDispatcher.unsubscribe(type as any, callback);
    generation++; index.clear(); emit();
}
export function cachedSearch(options: SearchOptions) { ensureAccount(); return index.search(options, canReadChannel); }
export function storeAttachmentText(messageId: string, attachmentId: string, text: string) { ensureAccount(); index.setAttachmentText(messageId, attachmentId, text); emit(); }
export function searchChannels() { ensureAccount(); return index.channels(canReadChannel); }
export function searchAuthors() { ensureAccount(); return index.authors(canReadChannel); }
export function cachedContext(id: string) { ensureAccount(); return index.context(id, canReadChannel); }
export async function loadMessageContext(message: SearchMessage, signal: AbortSignal) {
    const account = ensureAccount(), run = generation;
    if (!account || !canReadChannel(message.channelId)) throw new Error("This channel is unavailable.");
    const response = await RestAPI.get({ url: `/channels/${message.channelId}/messages`, query: { around: message.id, limit: 11 }, retries: 0 });
    if (signal.aborted || run !== generation || account !== UserStore.getCurrentUser()?.id) return;
    if (!canReadChannel(message.channelId) || !Array.isArray(response.body)) return;
    for (const value of response.body) indexMessage(value, message.channelId);
    emit();
}
export function dmChannelIds() { return PrivateChannelSortStore.getPrivateChannelIds().filter(canReadChannel); }
export function channelLabel(channelId: string) {
    const channel = ChannelStore.getChannel(channelId);
    if (!channel) return "Unavailable channel";
    if (channel.isDM()) return UserStore.getUser(channel.recipients[0])?.globalName ?? UserStore.getUser(channel.recipients[0])?.username ?? "DM";
    return channel.name || "Group chat";
}
export interface HistoryProgress { checked: number; channels: number; found: number; failed: number; indexing: number; }
export async function searchHistory(options: SearchOptions, onProgress: (progress: HistoryProgress) => void, signal: AbortSignal, offsets = new Map<string, number>()) {
    const account = ensureAccount(), run = generation;
    if (!account) throw new Error("Sign in to Discord first.");
    const channels = options.channelId ? [options.channelId].filter(canReadChannel) : dmChannelIds();
    const progress: HistoryProgress = { checked: 0, channels: channels.length, found: 0, failed: 0, indexing: 0 };
    const current = () => { if (signal.aborted || run !== generation || account !== UserStore.getCurrentUser()?.id) throw new DOMException("Search cancelled", "AbortError"); };
    onProgress({ ...progress });
    for (const channelId of channels) {
        current();
        try {
            const query: Record<string, unknown> = { limit: 25, offset: offsets.get(channelId) ?? 0, sort_by: "timestamp", sort_order: "desc" };
            if (options.mode === "attachments") { query.has = ["file"]; if (options.query.trim()) query.attachment_filename = [options.query.trim()]; }
            else if (options.query.trim()) query.content = options.query.trim();
            else continue;
            if (options.kind && options.kind !== "all") query.has = [options.kind === "links" ? "link" : options.kind === "images" ? "image" : options.kind === "videos" ? "video" : "file"];
            if (options.authorId) query.author_id = [options.authorId];
            const response = await RestAPI.get({ url: `/channels/${channelId}/messages/search`, query, retries: 0 });
            current();
            if (!canReadChannel(channelId)) continue;
            if (response.status === 202) { progress.indexing++; continue; }
            const results = parseSearchResponse(response.body);
            if (results.indexing) progress.indexing++;
            for (const message of results.messages) if (message.channel_id === channelId) indexMessage(message, channelId);
            progress.found += results.messages.length;
            offsets.set(channelId, (offsets.get(channelId) ?? 0) + 25);
            emit();
        } catch (error: any) {
            current();
            if (error.status === 429) throw new Error("Discord rate limit reached. Wait before trying again.");
            progress.failed++;
        } finally { progress.checked++; onProgress({ ...progress }); }
        if (!signal.aborted) await new Promise<void>(resolve => {
            const done = () => { clearTimeout(timer); signal.removeEventListener("abort", done); resolve(); };
            const timer = setTimeout(done, 350); signal.addEventListener("abort", done, { once: true });
        });
    }
    current();
    return progress;
}

export type { SearchMessage, SearchOptions };
