/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export function cleanPaste(value: string) { return value.replace(/\r\n?/g, "\n").replace(/[\u200b\ufeff]/g, "").split("\n").map(line => line.trimEnd()).join("\n").replace(/\n{4,}/g, "\n\n\n").trim(); }
export function codePaste(value: string, language: string) {
    const fence = "`".repeat([...value.matchAll(/`+/g)].reduce((length, match) => Math.max(length, match[0].length + 1), 3));
    return `${fence}${language.replace(/[^a-zA-Z0-9_+-]/g, "")}\n${value}\n${fence}`;
}
