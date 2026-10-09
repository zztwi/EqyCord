/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export const PLUGIN_RENAMES = { EqyAutoTranslate: "AutoTranslate", EqyVoiceTools: "VoiceTool" } as const;

export function migrateEqyPluginNames(plugins: Record<string, unknown>) {
    for (const [oldName, name] of Object.entries(PLUGIN_RENAMES)) {
        if (!Object.hasOwn(plugins, oldName)) continue;
        if (!Object.hasOwn(plugins, name)) plugins[name] = plugins[oldName];
        delete plugins[oldName];
    }
}
