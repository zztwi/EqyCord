/*
 * EqyCord, based on Vencord.
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Plugin provenance is explicit: community/user plugins must never be
 * incorrectly credited to either EqyCord or upstream Vencord.
 */

export const EQYCORD_PLUGINS = new Set(["EqyAutoTranslate"]);

export type PluginOrigin = "EqyCord" | "Vencord" | "Community";

export function getPluginOrigin(name: string, isUserPlugin?: boolean): PluginOrigin {
    if (EQYCORD_PLUGINS.has(name)) return "EqyCord";
    if (isUserPlugin) return "Community";
    return "Vencord";
}
