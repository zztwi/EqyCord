/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export const EQYCORD_PLUGINS = new Set(["TranslationPeek", "DuplicateFinder", "SmartPaste", "AttachmentPreview", "VoiceFocus", "QuietMode", "AutoTranslate", "VoiceTool", "MessageSearch", "RelatedMessages", "AttachmentSearch", "EqyAutoTranslate", "EqyVoiceTools"]);

export type PluginOrigin = "EqyCord" | "Equicord" | "Vencord" | "Community";

export function getPluginOrigin(name: string, isUserPlugin?: boolean, folderName?: string): PluginOrigin {
    if (isUserPlugin) return "Community";
    if (EQYCORD_PLUGINS.has(name)) return "EqyCord";
    if (folderName?.startsWith("src/equicordplugins/")) return "Equicord";
    return "Vencord";
}

export function matchesPluginOrigin(name: string, isUserPlugin: boolean | undefined, origin: PluginOrigin | "All", folderName?: string): boolean {
    return origin === "All" || getPluginOrigin(name, isUserPlugin, folderName) === origin;
}
