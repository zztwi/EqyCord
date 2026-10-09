/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings, migratePluginSettings } from "@api/Settings";
import { settings as vencordTranslateSettings } from "@plugins/translate/settings";
import { translate } from "@plugins/translate/utils";
import definePlugin, { OptionType } from "@utils/types";
import { closeModal, ConfirmModal, openModal, showToast } from "@webpack/common";

import { prepareTranslation, providerLanguage } from "./workflow";

const settings = definePluginSettings({
    translateOnSend: {
        type: OptionType.BOOLEAN,
        description: "Translate outgoing text with Vencord Translate. Text is shared with the selected provider; every send requires your approval.",
        default: false
    },
    targetLanguage: {
        type: OptionType.SELECT,
        description: "Destination language. Configure the provider in Translate and keep its Auto Translate off.",
        options: [
            { label: "English", value: "en", default: true },
            { label: "Italian", value: "it" },
            { label: "Spanish", value: "es" },
            { label: "French", value: "fr" },
            { label: "German", value: "de" },
            { label: "Portuguese", value: "pt" },
            { label: "Japanese", value: "ja" }
        ] as const
    }
});

migratePluginSettings("AutoTranslate", "EqyAutoTranslate");

let running = false;
let generation = 0;
const pendingPreviews = new Set<() => void>();

function confirmTranslation(original: string, translated: string, language: string): Promise<boolean> {
    return new Promise(resolve => {
        let settled = false;
        let modalKey: string | undefined;
        const finish = (approved: boolean) => {
            if (settled) return;
            settled = true;
            pendingPreviews.delete(cancel);
            resolve(approved);
        };
        const cancel = () => {
            finish(false);
            if (modalKey) closeModal(modalKey);
        };

        pendingPreviews.add(cancel);
        try {
            modalKey = openModal(modalProps => (
                <ConfirmModal
                    {...modalProps}
                    title="EqyCord — Translation Preview"
                    subtitle={"Target language: " + language}
                    confirmText="Send translated message"
                    cancelText="Cancel sending"
                    onConfirm={() => finish(true)}
                    onCancel={() => finish(false)}
                    onClose={() => {
                        finish(false);
                        modalProps.onClose();
                    }}
                    variant="primary"
                >
                    <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}><strong>Original:</strong> {original}</p>
                    <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}><strong>Translated:</strong> {translated}</p>
                    <p>Approve to send this translation, or cancel to keep your draft.</p>
                </ConfirmModal>
            ), { onCloseCallback: () => finish(false) });
        } catch {
            finish(false);
        }
    });
}

export default definePlugin({
    name: "AutoTranslate",
    description: "EqyCord: choose a language, preview outgoing translations, and approve before sending. Provider by Vencord Translate.",
    tags: ["Chat", "Utility"],
    // Owner-supplied display name; no Discord account ID is inferred. Upstream authors remain on Translate.
    authors: [{ name: "0009cx0", id: 0n }],
    dependencies: ["Translate"],
    settings,

    start() {
        running = true;
        generation++;
    },
    stop() {
        running = false;
        generation++;
        for (const cancel of [...pendingPreviews]) cancel();
    },

    async onBeforeMessageSend(_channelId, message) {
        if (!settings.store.translateOnSend || !message.content?.trim()) return;

        // MessageEvents swallows listener errors. Catch every failure so it
        // cannot accidentally let an unapproved message through.
        try {
            if (vencordTranslateSettings.store.autoTranslate) {
                showToast("EqyCord: turn off Auto Translate in Translate before using AutoTranslate.", "failure");
                return { cancel: true };
            }
            const currentGeneration = generation;
            const language = settings.store.targetLanguage ?? "en";
            const target = providerLanguage(IS_WEB ? "google" : vencordTranslateSettings.store.service ?? "google", language);
            const original = message.content;
            const translated = await prepareTranslation(original, target, {
                translate: (text, target) => translate("sent", text, target).then(result => result.text),
                confirm: (original, translated) => confirmTranslation(original, translated, language),
                isCurrent: () => running && generation === currentGeneration && settings.store.translateOnSend
                    && message.content === original && !vencordTranslateSettings.store.autoTranslate
            });

            if (translated === null) return { cancel: true };
            message.content = translated;
        } catch {
            return { cancel: true };
        }
    }
});
