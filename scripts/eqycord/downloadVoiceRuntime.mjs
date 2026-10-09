/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { unzipSync } from "fflate";

const runtime = resolve("dist/vendor/voice-replay");
mkdirSync(runtime, { recursive: true });
const hash = data => createHash("sha256").update(data).digest("hex");
async function download(url, target, digest) {
    if (existsSync(target) && hash(readFileSync(target)) === digest) return readFileSync(target);
    const response = await fetch(url);
    if (!response.ok) throw new Error("Download failed: " + response.status);
    const data = Buffer.from(await response.arrayBuffer());
    if (digest && hash(data) !== digest) throw new Error("Runtime SHA256 mismatch: " + basename(target));
    writeFileSync(target, data);
    return data;
}
const release = "b5454";
const binarySha = "6ba69e3482d7826214f90a6a9c84ca07782aec1e1d0c6a7c30c994fd5d816ccb";
const modelSha = "be07e048e1e599ad46341c8d2a135645097a538221678b7acdd1b1919c6e1b21";
const [binary] = await Promise.all([
    download(`https://github.com/ggml-org/whisper.cpp/releases/download/${release}/whisper-bin-x64.zip`, join(runtime, "runtime.zip"), binarySha),
    download("https://huggingface.co/ggerganov/whisper.cpp/resolve/80da2d8bfee42b0e836fc3a9890373e5defc00a6/ggml-tiny.bin", join(runtime, "ggml-tiny.bin"), modelSha)
]);
const hashes = {};
for (const [path, data] of Object.entries(unzipSync(binary))) {
    if (!/\.(exe|dll)$/i.test(path)) continue;
    const name = basename(path);
    if (name.endsWith(".exe") && name !== "whisper-cli.exe") continue;
    if (Object.hasOwn(hashes, name) && hashes[name] !== hash(data)) throw new Error("Ambiguous runtime file: " + name);
    writeFileSync(join(runtime, name), data);
    hashes[name] = hash(data);
}
if (!hashes["whisper-cli.exe"]) throw new Error("Whisper CLI missing from archive");
hashes["ggml-tiny.bin"] = modelSha;
for (const [url, name] of [
    [`https://raw.githubusercontent.com/ggml-org/whisper.cpp/${release}/LICENSE`, "WHISPER-LICENSE.txt"],
    ["https://raw.githubusercontent.com/openai/whisper/main/LICENSE", "MODEL-LICENSE.txt"]
]) {
    const response = await fetch(url); if (!response.ok) throw new Error("License unavailable");
    writeFileSync(join(runtime, name), await response.text());
}
writeFileSync(join(runtime, "runtime.json"), JSON.stringify({ release, sourceCommit: "d1be6fde11ac6e0407606b4e42fe72d34add8037", binarySha, hashes }, null, 2));
console.log("Whisper CPU runtime and multilingual tiny model downloaded; SHA256 checked. Audio stays local.");
