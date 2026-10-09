/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export interface AudioSegment { bytes: Uint8Array; timestamp: number; mime: string; }
export class RollingAudio {
    private segments: AudioSegment[] = [];
    private bytes = 0;
    constructor(public seconds = 60, private maxBytes = 60 * 1024 * 1024) {}
    push(segment: AudioSegment) {
        if (segment.bytes.length > 2 * 1024 * 1024 || !segment.bytes.length || !Number.isFinite(segment.timestamp)) return;
        this.segments.push(segment); this.bytes += segment.bytes.length; this.trim(segment.timestamp);
    }
    private trim(now: number) {
        while (this.segments.length && (this.segments[0].timestamp < now - this.seconds * 1000 || this.bytes > this.maxBytes)) this.bytes -= this.segments.shift()!.bytes.length;
    }
    snapshot(seconds: number, now = Date.now()) { this.trim(now); return this.segments.filter(segment => segment.timestamp >= now - Math.min(this.seconds, Math.max(1, seconds)) * 1000); }
    clear() { this.segments.length = 0; this.bytes = 0; }
    get count() { return this.segments.length; }
}

export function pcmWav(samples: Float32Array, rate = 16000) {
    const buffer = new ArrayBuffer(44 + samples.length * 2), view = new DataView(buffer);
    const text = (offset: number, value: string) => { for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i)); };
    text(0, "RIFF"); view.setUint32(4, buffer.byteLength - 8, true); text(8, "WAVE"); text(12, "fmt ");
    view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true); view.setUint32(24, rate, true);
    view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true); text(36, "data"); view.setUint32(40, samples.length * 2, true);
    for (let i = 0; i < samples.length; i++) { const value = Math.max(-1, Math.min(1, samples[i])); view.setInt16(44 + i * 2, value < 0 ? value * 32768 : value * 32767, true); }
    return new Uint8Array(buffer);
}
