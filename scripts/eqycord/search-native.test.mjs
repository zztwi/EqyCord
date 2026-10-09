/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import { build } from "esbuild";

async function load(entry) {
    const { outputFiles } = await build({ entryPoints: [entry], bundle: true, write: false, format: "esm", platform: "node", logLevel: "silent" });
    return import("data:text/javascript;base64," + Buffer.from(outputFiles[0].text).toString("base64"));
}

function pdfFixture() {
    const objects = ["<< /Type /Catalog /Pages 2 0 R >>", "", "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"];
    const pages = [];
    for (let page = 1; page <= 6; page++) {
        const number = objects.length + 1; pages.push(number);
        objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 250] /Resources << /Font << /F1 3 0 R >> >> /Contents ${number + 1} 0 R >>`);
        const stream = `BT /F1 32 Tf 30 120 Td (EqyCord PDF page ${page}) Tj ET`;
        objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    }
    objects[1] = `<< /Type /Pages /Kids [${pages.map(n => n + " 0 R").join(" ")}] /Count 6 >>`;
    let output = "%PDF-1.4\n"; const offsets = [0];
    for (const [index, object] of objects.entries()) { offsets.push(Buffer.byteLength(output)); output += `${index + 1} 0 obj\n${object}\nendobj\n`; }
    const start = Buffer.byteLength(output);
    output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map(offset => String(offset).padStart(10, "0") + " 00000 n \n").join("")}trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
    return Buffer.from(output);
}

test("attachment native rejects external/local URLs, oversize and unsupported files; text stays local", async () => {
    const { attachmentUrl, extractBytes } = await load("src/plugins/attachmentSearch/extract.ts");
    assert.equal(attachmentUrl("https://cdn.discordapp.com/attachments/1/2/test.txt?ex=abc").hostname, "cdn.discordapp.com");
    for (const url of ["file:///C:/secret.txt", "https://example.com/attachments/1/2/test.txt", "http://cdn.discordapp.com/attachments/1/2/test.txt", "https://cdn.discordapp.com/other", "https://cdn.discordapp.com:444/attachments/1/2/test.txt"]) assert.throws(() => attachmentUrl(url));
    assert.equal((await extractBytes(Buffer.from("fattura marzo"), "note.txt")).text, "fattura marzo");
    await assert.rejects(extractBytes(new Uint8Array(10 * 1024 * 1024 + 1), "note.txt"), /10 MB/);
    await assert.rejects(extractBytes(Buffer.from("file"), "program.exe"), /Supportati/);
});

test("Whisper rejects invalid WAV and language before executing a child process", async () => {
    const { transcribeWav } = await load("src/plugins/voiceReplay/transcribe.ts");
    await assert.rejects(transcribeWav("unused", new Uint8Array(44), "it"), /Audio non valido/);
    await assert.rejects(transcribeWav("unused", new Uint8Array(44), "it;evil"), /Lingua non supportata/);
});

test("real Windows image/PDF OCR reads text and enforces the five-page limit", { skip: process.env.EQYCORD_NATIVE_SMOKE !== "1" }, async () => {
    assert.equal(process.platform, "win32");
    const { extractBytes } = await load("src/plugins/attachmentSearch/extract.ts");
    const image = await extractBytes(await readFile("work/ocr-fixture.png"), "fixture.png");
    assert.match(image.text, /EqyCord Search test 123/);
    const pdf = await extractBytes(pdfFixture(), "fixture.pdf");
    assert.match(pdf.text, /EqyCord PDF page 1/); assert.match(pdf.text, /EqyCord PDF page 5/);
    assert.doesNotMatch(pdf.text, /page 6/); assert.match(pdf.note, /5\/6/);
});

test("real pinned Whisper CPU runtime transcribes the official speech sample locally", { skip: process.env.EQYCORD_NATIVE_SMOKE !== "1" }, async () => {
    const { transcribeWav } = await load("src/plugins/voiceReplay/transcribe.ts");
    const result = await transcribeWav(resolve("dist/vendor/voice-replay"), await readFile("work/jfk.wav"), "en");
    assert.match(result, /ask not what your country can do for you/i);
});
