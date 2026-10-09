/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export interface SearchAttachment { id: string; filename: string; url: string; size?: number; text?: string; }
export interface SearchMessage {
    id: string;
    channelId: string;
    authorId: string;
    author: string;
    content: string;
    timestamp: number;
    attachments: SearchAttachment[];
}
export type SearchMode = "messages" | "related" | "attachments";
export interface SearchOptions { query: string; mode?: SearchMode; channelId?: string; authorId?: string; excludeId?: string; limit?: number; }

const STOP_WORDS = new Set("a al alla alle anche che chi come con da dal degli dei del della delle di e ed è gli ha hai hanno ho i il in io la le lo ma mi nel nella non o per più poi se si sia sono su sul ti tra tu un una uno questo questa quello quella the a an and are as at be been but by can do for from has have how i in is it me my of on or our that the their there this to was we what when where which who with you your".split(" ").map(word => normalize(word)));
export function normalize(text: string) { return text.normalize("NFKD").replace(/\p{M}/gu, "").toLocaleLowerCase(); }
export function keywords(text: string, limit = 6) {
    const counts = new Map<string, number>();
    for (const word of normalize(text).match(/[\p{L}\p{N}_-]{3,}/gu) ?? []) if (!STOP_WORDS.has(word)) counts.set(word, (counts.get(word) ?? 0) + 1);
    return [...counts].sort((a, b) => b[1] - a[1] || b[0].length - a[0].length).slice(0, limit).map(([word]) => word);
}

/** Bounded, account-scoped, memory-only index. No history is written to disk. */
export class MessageIndex {
    private messages = new Map<string, SearchMessage>();
    private bodies = new Map<string, string>();
    private characters = 0;
    constructor(private capacity = 20000) {}
    get size() { return this.messages.size; }
    upsert(message: SearchMessage) {
        if (!message.id || !message.channelId) return;
        const previous = this.messages.get(message.id);
        message = { ...message, attachments: message.attachments.map(file => ({ ...file, text: file.text ?? previous?.attachments.find(old => old.id === file.id && old.url === file.url)?.text })) };
        this.messages.delete(message.id);
        this.messages.set(message.id, message);
        this.refresh(message);
        while (this.messages.size > this.capacity) this.remove(this.messages.keys().next().value!);
    }
    private refresh(message: SearchMessage) {
        const body = normalize([message.content, ...message.attachments.flatMap(file => [file.filename, file.text ?? ""])].join("\n"));
        this.characters += body.length - (this.bodies.get(message.id)?.length ?? 0);
        this.bodies.set(message.id, body);
        // Text extracted from many PDFs must not turn a bounded message count into unbounded RAM.
        while (this.characters > 16000000 && this.messages.size > 1) this.remove(this.messages.keys().next().value!);
    }
    setAttachmentText(messageId: string, attachmentId: string, text: string) {
        const message = this.messages.get(messageId);
        const file = message?.attachments.find(file => file.id === attachmentId);
        if (!message || !file) return;
        file.text = text.slice(0, 200000);
        this.refresh(message);
    }
    remove(id: string) { this.characters -= this.bodies.get(id)?.length ?? 0; this.messages.delete(id); this.bodies.delete(id); }
    removeChannel(channelId: string) { for (const message of this.messages.values()) if (message.channelId === channelId) this.remove(message.id); }
    clear() { this.messages.clear(); this.bodies.clear(); this.characters = 0; }
    search(options: SearchOptions, canRead: (channelId: string) => boolean = () => true): SearchMessage[] {
        const { mode = "messages", query, limit = 50 } = options;
        const words = mode === "related" ? keywords(query) : normalize(query.trim()).split(/\s+/).filter(Boolean);
        if (!words.length && mode !== "attachments") return [];
        const candidates: { message: SearchMessage; score: number; }[] = [];
        for (const message of this.messages.values()) {
            if (message.id === options.excludeId || !canRead(message.channelId)) continue;
            if (options.channelId && message.channelId !== options.channelId || options.authorId && message.authorId !== options.authorId) continue;
            if (mode === "attachments" && !message.attachments.length) continue;
            const body = mode === "attachments" ? normalize(message.attachments.flatMap(file => [file.filename, file.text ?? ""]).join("\n")) : this.bodies.get(message.id)!;
            const matches = words.filter(word => body.includes(word)).length;
            if (mode === "related" ? !matches : matches !== words.length) continue;
            candidates.push({ message, score: mode === "related" ? matches / Math.sqrt(Math.max(1, keywords(body, 1000).length)) : 1 });
        }
        return candidates.sort((a, b) => b.score - a.score || b.message.timestamp - a.message.timestamp).slice(0, limit).map(item => item.message);
    }
}

export function parseSearchResponse(body: unknown): { messages: any[]; total: number; indexing: boolean; } {
    if (!body || typeof body !== "object" || !Array.isArray((body as any).messages)) throw new Error("Risposta di ricerca Discord non riconosciuta.");
    return {
        messages: (body as any).messages.flat().filter(message => message && typeof message.id === "string" && message.hit !== false),
        total: Number((body as any).total_results) || 0,
        indexing: !!(body as any).doing_deep_historical_index
    };
}
