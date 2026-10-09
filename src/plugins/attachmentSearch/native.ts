/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { IpcMainInvokeEvent } from "electron";

import { fetchAttachment } from "./extract";

let busy = false;
export async function extractAttachment(_event: IpcMainInvokeEvent, url: string, filename: string) {
    if (busy) throw new Error("È già in corso la lettura di un allegato.");
    if (typeof url !== "string" || typeof filename !== "string" || filename.length > 300) throw new Error("Allegato non valido.");
    busy = true;
    try { return await fetchAttachment(url, filename); }
    finally { busy = false; }
}
