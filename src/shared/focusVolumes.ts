/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export class FocusVolumes {
    private originals = new Map<string, { original: number; applied: number; }>();
    constructor(private get: (id: string) => number, private set: (id: string, volume: number) => void) {}
    apply(ids: string[], focus: string, multiplier: number) {
        for (const id of ids) {
            if (id === focus) continue;
            const entry = this.originals.get(id);
            if (entry) continue;
            const original = this.get(id), applied = original * multiplier;
            this.set(id, applied); this.originals.set(id, { original, applied });
        }
    }
    discard() { this.originals.clear(); }
    restore() {
        const failed: string[] = [];
        for (const [id, value] of this.originals) {
            try {
                if (Math.abs(this.get(id) - value.applied) < 0.01) this.set(id, value.original);
                this.originals.delete(id);
            } catch { failed.push(id); }
        }
        return failed;
    }
}
