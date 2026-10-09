/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

export function providerLanguage(service: string, language: string): string {
    if (service === "deepl" || service === "deepl-pro") {
        if (language === "en") return "en-us";
        if (language === "pt") return "pt-pt";
    }
    return language;
}

interface TranslationWorkflow {
    translate(text: string, language: string): Promise<string>;
    confirm(original: string, translated: string): Promise<boolean>;
    isCurrent(): boolean;
}

export async function prepareTranslation(original: string, language: string, workflow: TranslationWorkflow, timeoutMs = 20000): Promise<string | null> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
        if (!workflow.isCurrent()) return null;
        const translated = await Promise.race([
            workflow.translate(original, language),
            new Promise<null>(resolve => { timer = setTimeout(() => resolve(null), timeoutMs); })
        ]);
        if (timer) clearTimeout(timer);
        if (typeof translated !== "string" || !translated.trim() || !workflow.isCurrent()) return null;
        // Even identical translations require approval; never bypass the preview.
        if (!await workflow.confirm(original, translated) || !workflow.isCurrent()) return null;
        return translated;
    } catch {
        return null;
    } finally {
        if (timer) clearTimeout(timer);
    }
}
