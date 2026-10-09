/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export interface Translation { text: string; source: string; }
export class TranslationQueue {
    private cache = new Map<string, Translation>();
    private pending = new Map<string, Promise<Translation>>();
    private tail: Promise<unknown> = Promise.resolve();
    private generation = 0;
    private abort = new AbortController();
    constructor(private request: (text: string, target: string, signal: AbortSignal) => Promise<Translation>) {}
    clear() { this.generation++; this.abort.abort(); this.abort = new AbortController(); this.cache.clear(); this.pending.clear(); this.tail = Promise.resolve(); }
    translate(text: string, target: string) {
        const key = target + "\0" + text;
        if (this.cache.has(key)) return Promise.resolve(this.cache.get(key)!);
        if (this.pending.has(key)) return this.pending.get(key)!;
        if (this.pending.size >= 60) return Promise.reject(new Error("Translation queue is full. Try again shortly."));
        const { generation } = this, { signal } = this.abort;
        const task = this.tail.catch(() => {}).then(async () => {
            if (generation !== this.generation) throw new Error("Translation cancelled.");
            const value = await this.request(text, target, signal);
            if (generation !== this.generation) throw new Error("Translation cancelled.");
            this.cache.set(key, value);
            while (this.cache.size > 300) this.cache.delete(this.cache.keys().next().value!);
            return value;
        });
        this.pending.set(key, task);
        this.tail = task.then(() => new Promise<void>(resolve => setTimeout(resolve, 150)), () => {});
        task.finally(() => { if (this.pending.get(key) === task) this.pending.delete(key); }).catch(() => {});
        return task;
    }
}
