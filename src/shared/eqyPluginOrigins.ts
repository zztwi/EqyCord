/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export const EQYCORD_PLUGINS = new Set(["TranslationPeek", "DuplicateFinder", "SmartPaste", "AttachmentPreview", "VoiceFocus", "QuietMode", "VoicePanelAPI", "AutoTranslate", "VoiceTool", "MessageSearch", "RelatedMessages", "AttachmentSearch", "VoiceReplay", "EqyAutoTranslate", "EqyVoiceTools"]);

export type PluginOrigin = "EqyCord" | "Vencord" | "Community";

export function getPluginOrigin(name: string, isUserPlugin?: boolean): PluginOrigin {
    if (isUserPlugin) return "Community";
    if (EQYCORD_PLUGINS.has(name)) return "EqyCord";
    return "Vencord";
}

export function matchesPluginOrigin(name: string, isUserPlugin: boolean | undefined, origin: PluginOrigin | "All"): boolean {
    return origin === "All" || getPluginOrigin(name, isUserPlugin) === origin;
}
