/*
 * EqyCord, a Discord client modification based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Uses Vencord's existing Translate plugin as its translation provider.
 * The upstream Vencord authors retain credit for their original code.
 */

import { definePluginSettings } from "@api/Settings";
import { settings as vencordTranslateSettings } from "@plugins/translate/settings";
import { translate } from "@plugins/translate/utils";
import definePlugin, { OptionType } from "@utils/types";
import { ConfirmModal, openModal, React, showToast } from "@webpack/common";

const settings = definePluginSettings({
    translateOnSend: {
        type: OptionType.BOOLEAN,
        description: "Translate outgoing messages using the original Vencord Translate provider. Off until you opt in.",
        default: false
    },
    targetLanguage: {
        type: OptionType.SELECT,
        description: "Language for your outgoing translations. Configure the provider in the Vencord Translate plugin.",
        options: [
            { label: "English", value: "en", default: true },
            { label: "Italiano", value: "it" },
            { label: "Español", value: "es" },
            { label: "Français", value: "fr" },
            { label: "Deutsch", value: "de" },
            { label: "Português", value: "pt" },
            { label: "日本語", value: "ja" }
        ] as const
    },
    previewBeforeSend: {
        type: OptionType.BOOLEAN,
        description: "Show the original and translated message and require approval before sending. Recommended.",
        default: true
    }
});

function confirmTranslation(original: string, translated: string, language: string): Promise<boolean> {
    return new Promise(resolve => {
        let settled = false;
        const finish = (approved: boolean) => {
            if (settled) return;
            settled = true;
            resolve(approved);
        };

        openModal(modalProps => (
            <ConfirmModal
                {...modalProps}
                onClose={() => {
                    finish(false);
                    modalProps.onClose();
                }}
                title="EqyCord — Translation Preview"
                subtitle={`Target language: ${language}`}
                confirmText="Send translated message"
                cancelText="Cancel sending"
                onConfirm={() => finish(true)}
                onCancel={() => finish(false)}
                variant="primary"
            >
                <p><strong>Original:</strong> {original}</p>
                <p><strong>Translated:</strong> {translated}</p>
                <p>This translation is sent only if you approve it.</p>
            </ConfirmModal>
        ));
    });
}

export default definePlugin({
    name: "EqyAutoTranslate",
    description: "EqyCord: choose a language, preview outgoing translations, and approve before sending.",
    tags: ["Chat", "Utility"],
    authors: [{ name: "EqyCord contributors", id: 0n }],
    dependencies: ["Translate"],
    settings,

    async onBeforeMessageSend(_channelId, message) {
        if (!settings.store.translateOnSend || !message.content?.trim()) return;

        // The upstream plugin can also modify outgoing messages. Never silently
        // perform a second translation when its automatic mode is enabled.
        if (vencordTranslateSettings.store.autoTranslate) {
            showToast("EqyCord: disable Auto Translate in the original Vencord Translate plugin to use EqyAutoTranslate.", "failure");
            return { cancel: true };
        }

        const original = message.content;
        let translated: string;
        try {
            translated = (await translate("sent", original, settings.store.targetLanguage)).text;
        } catch {
            // Fail closed: a translation error must not unexpectedly send the original.
            return { cancel: true };
        }

        if (translated === original) return;

        if (settings.store.previewBeforeSend) {
            const approved = await confirmTranslation(original, translated, settings.store.targetLanguage);
            if (!approved) return { cancel: true };
        }

        message.content = translated;
    }
});
