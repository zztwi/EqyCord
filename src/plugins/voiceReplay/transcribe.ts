/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
let checkedDirectory: string | undefined;
export async function transcribeWav(runtime: string, bytes: Uint8Array, language: string, signal?: AbortSignal) {
    if (!["auto", "it", "en", "es", "fr", "de", "pt", "ja"].includes(language)) throw new Error("Lingua non supportata.");
    const wav = Buffer.from(bytes);
    if (wav.length < 44 || wav.length > 9600044 || wav.toString("ascii", 0, 4) !== "RIFF" || wav.toString("ascii", 8, 12) !== "WAVE" || wav.readUInt16LE(20) !== 1 || wav.readUInt16LE(22) !== 1 || wav.readUInt32LE(24) !== 16000 || wav.readUInt16LE(34) !== 16) throw new Error("Audio non valido: richiesto WAV PCM mono 16 kHz, massimo 5 minuti.");
    if (checkedDirectory !== runtime) {
        const manifest = JSON.parse(await readFile(join(runtime, "runtime.json"), "utf8"));
        if (manifest.hashes?.["ggml-tiny.bin"] !== "be07e048e1e599ad46341c8d2a135645097a538221678b7acdd1b1919c6e1b21" || manifest.hashes?.["whisper-cli.exe"] !== "331dba46d6427105d2b802cdbc7eae916ea1c5abf9b0d3b5cfe460d8db8e4366") throw new Error("Runtime Whisper non riconosciuto.");
        for (const [name, hash] of Object.entries(manifest.hashes as Record<string, string>)) {
            if (!/^[\w.-]+$/.test(name)) throw new Error("Manifest runtime non valido.");
            if (createHash("sha256").update(await readFile(join(runtime, name))).digest("hex") !== hash) throw new Error("Runtime trascrizione alterato: " + name);
        }
        checkedDirectory = runtime;
    }
    const directory = await mkdtemp(join(tmpdir(), "eqy-voice-text-"));
    try {
        const input = join(directory, "audio.wav"), output = join(directory, "transcript");
        await writeFile(input, wav);
        await exec(join(runtime, "whisper-cli.exe"), ["-m", join(runtime, "ggml-tiny.bin"), "-f", input, "-l", language, "-t", "4", "-ng", "-otxt", "-of", output], { cwd: runtime, windowsHide: true, timeout: 180000, maxBuffer: 4 * 1024 * 1024, signal });
        return (await readFile(output + ".txt", "utf8")).trim();
    } finally { await rm(directory, { recursive: true, force: true }); }
}
