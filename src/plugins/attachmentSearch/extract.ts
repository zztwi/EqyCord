/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const textTypes = new Set([".txt", ".md", ".csv", ".json", ".log", ".xml", ".yaml", ".yml", ".srt", ".vtt"]);
const imageTypes = new Set([".png", ".jpg", ".jpeg", ".webp", ".bmp", ".pdf"]);
export function attachmentUrl(value: string) {
    const url = new URL(value);
    if (url.protocol !== "https:" || !["cdn.discordapp.com", "media.discordapp.net"].includes(url.hostname) || url.port || url.username || url.password || !/^\/attachments\/\d+\/\d+\//.test(url.pathname)) throw new Error("Only attachments on the Discord CDN are supported.");
    return url;
}

/** Internal helper: callers supply bytes, never an IPC-controlled filesystem path. */
export async function extractBytes(bytes: Uint8Array, filename: string) {
    if (bytes.length > 10 * 1024 * 1024) throw new Error("Maximum attachment size: 10 MB.");
    const extension = extname(filename).toLowerCase();
    if (textTypes.has(extension)) return { text: new TextDecoder().decode(bytes).slice(0, 200000), note: "Text indexed locally (up to 200,000 characters)." };
    if (!imageTypes.has(extension)) throw new Error("Supported: text files, PNG, JPEG, WebP, BMP and PDF (first five pages). Archives and executables are not supported.");
    if (process.platform !== "win32") throw new Error("Image and PDF OCR is available on Windows only.");
    const directory = await mkdtemp(join(tmpdir(), "eqy-ocr-"));
    const path = join(directory, "attachment" + extension), output = join(directory, "result.json");
    await writeFile(path, bytes);
    // Fixed program, with only generated local paths interpolated; filenames never become code.
    const quote = (value: string) => "'" + value.replace(/'/g, "''") + "'";
    const script = `
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null=[Windows.Storage.StorageFile,Windows.Storage,ContentType=WindowsRuntime]
$null=[Windows.Graphics.Imaging.BitmapDecoder,Windows.Graphics.Imaging,ContentType=WindowsRuntime]
$null=[Windows.Media.Ocr.OcrEngine,Windows.Foundation,ContentType=WindowsRuntime]
$null=[Windows.Data.Pdf.PdfDocument,Windows.Data.Pdf,ContentType=WindowsRuntime]
$null=[Windows.Storage.Streams.InMemoryRandomAccessStream,Windows.Storage.Streams,ContentType=WindowsRuntime]
function Await($operation,$type) {
 $method=[System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetGenericArguments().Count -eq 1 -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation\u00601' } | Select-Object -First 1
 $task=$method.MakeGenericMethod($type).Invoke($null,@($operation)); $task.Wait(); return $task.Result
}
function AwaitAction($operation) {
 $method=[System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq 'AsTask' -and -not $_.IsGenericMethod -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction' } | Select-Object -First 1
 $task=$method.Invoke($null,@($operation)); $task.Wait()
}
$engine=[Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if(-not $engine){throw 'Install an OCR language in Windows settings.'}
function ReadImage($stream) {
 $decoder=Await ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)) ([Windows.Graphics.Imaging.BitmapDecoder])
 $bitmap=Await ($decoder.GetSoftwareBitmapAsync([Windows.Graphics.Imaging.BitmapPixelFormat]::Bgra8,[Windows.Graphics.Imaging.BitmapAlphaMode]::Premultiplied)) ([Windows.Graphics.Imaging.SoftwareBitmap])
 try { $result=Await ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult]); return $result.Text } finally {$bitmap.Dispose()}
}
$file=Await ([Windows.Storage.StorageFile]::GetFileFromPathAsync(${quote(path)})) ([Windows.Storage.StorageFile])
$texts=New-Object System.Collections.Generic.List[string]
$pages=1;$processed=1
if(${extension === ".pdf" ? "$true" : "$false"}) {
 $pdf=Await ([Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file)) ([Windows.Data.Pdf.PdfDocument]);$pages=$pdf.PageCount;$processed=[Math]::Min(5,$pages)
 for($i=0;$i -lt $processed;$i++) {
  $page=$pdf.GetPage($i);$stream=New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
  try { $options=New-Object Windows.Data.Pdf.PdfPageRenderOptions;$options.DestinationWidth=1600;AwaitAction ($page.RenderToStreamAsync($stream,$options));$stream.Seek(0);$texts.Add((ReadImage $stream)) } finally {$page.Dispose();$stream.Dispose()}
 }
} else {
 $stream=Await ($file.OpenAsync([Windows.Storage.FileAccessMode]::Read)) ([Windows.Storage.Streams.IRandomAccessStream])
 try {$texts.Add((ReadImage $stream))} finally {$stream.Dispose()}
}
$json=@{text=($texts -join "\n");note=('Local OCR: '+$processed+'/'+$pages+' pages. Recognition may contain errors.')} | ConvertTo-Json -Compress
[System.IO.File]::WriteAllText(${quote(output)},$json,(New-Object System.Text.UTF8Encoding($false)))
`;
    try {
        await exec("powershell.exe", ["-NoProfile", "-NonInteractive", "-EncodedCommand", Buffer.from(script, "utf16le").toString("base64")], { windowsHide: true, timeout: 60000, maxBuffer: 1024 * 1024 });
        const result = JSON.parse(await readFile(output, "utf8"));
        return { text: String(result.text).slice(0, 200000), note: String(result.note) };
    } finally { await rm(directory, { recursive: true, force: true }); }
}

export async function fetchAttachment(value: string, filename: string) {
    const url = attachmentUrl(value);
    const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(20000) });
    if (!response.ok || !response.body) throw new Error("Download failed: " + response.status);
    if (Number(response.headers.get("content-length")) > 10 * 1024 * 1024) throw new Error("Maximum size: 10 MB.");
    const parts: Uint8Array[] = []; let length = 0;
    for await (const chunk of response.body as any) {
        length += chunk.length;
        if (length > 10 * 1024 * 1024) { await response.body.cancel().catch(() => {}); throw new Error("Maximum size: 10 MB."); }
        parts.push(chunk);
    }
    return extractBytes(Buffer.concat(parts), filename);
}
