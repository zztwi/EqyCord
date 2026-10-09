/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "@components/messageSearch.css";

import { ChatBarButton } from "@api/ChatButtons";
import { definePluginSettings, SettingsStore } from "@api/Settings";
import { GoogleLanguages } from "@plugins/translate/languages";
import { TranslateIcon } from "@plugins/translate/TranslateIcon";
import { Translation, TranslationQueue } from "@shared/translationQueue";
import definePlugin, { OptionType } from "@utils/types";
import { Message, RenderModalProps } from "@vencord/discord-types";
import { Menu, Modal, openModal, React, showToast, UserStore } from "@webpack/common";

// Transport, language data and icon derived from Vencord Translate (2023 Vendicated,
// AshtonMemer, koish1 and contributors). Original copyright and GPL notices remain in translate/.
const languages = Object.entries(GoogleLanguages).filter(([value]) => value !== "auto").map(([value, label]) => ({ label, value, default: value === "en" }));
const settings = definePluginSettings({
    language: { type: OptionType.SELECT, displayName: "Choose Your Language", description: "Translate incoming messages into this language. Displayed text is sent to Google Translate.", options: languages },
    incoming: { type: OptionType.BOOLEAN, displayName: "Incoming Translation", description: "Automatically show translations below visible messages from other people. Messages already in your language stay unchanged.", default: true },
    outgoing: { type: OptionType.BOOLEAN, displayName: "Outgoing Translation", description: "Translate your messages before sending. The composer icon controls this separately from incoming translation.", default: false },
    target: { type: OptionType.SELECT, displayName: "Send In", description: "Destination language for outgoing messages.", options: languages }
});

// Retired providers remain in source with their original credits. Only one translation plugin is exposed.
const storedPlugins = SettingsStore.plain.plugins;
if (!Object.hasOwn(storedPlugins, "TranslationPeek")) {
    const old = storedPlugins.Translate;
    const preview = storedPlugins.AutoTranslate ?? storedPlugins.EqyAutoTranslate;
    storedPlugins.TranslationPeek = { enabled: !!(old?.enabled || preview?.enabled), language: old?.receivedOutput ?? "en", target: preview?.targetLanguage ?? old?.sentOutput ?? "en", outgoing: false };
}
for (const name of ["Translate", "AutoTranslate", "EqyAutoTranslate"]) if (storedPlugins[name]) storedPlugins[name].enabled = false;
SettingsStore.markAsChanged();
let running = false;
let account = "";
const requestTranslation = async (text: string, target: string, signal: AbortSignal) => {
    const response = await fetch("https://translate-pa.googleapis.com/v1/translate?" + new URLSearchParams({
        "params.client": "gtx", dataTypes: "TRANSLATION", key: "AIzaSyDLEeFI5OtFBwYBIoK_jj5m32rZK5CkCXA",
        "query.sourceLanguage": "auto", "query.targetLanguage": target, "query.text": text
    }), { signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]) });
    if (!response.ok) throw new Error(`Translation unavailable (${response.status}).`);
    const value = await response.json();
    if (typeof value.translation !== "string" || typeof value.sourceLanguage !== "string") throw new Error("Invalid translation response.");
    return { text: value.translation, source: value.sourceLanguage };
};
const queue = new TranslationQueue(requestTranslation);
const outgoingQueue = new TranslationQueue(requestTranslation);
function clearTranslations() { queue.clear(); outgoingQueue.clear(); }
function ensureAccount() { const id = UserStore.getCurrentUser()?.id ?? ""; if (id !== account) { clearTranslations(); account = id; } return id; }

function Incoming({ message }: { message: Message; }) {
    const { incoming, language } = settings.use(["incoming", "language"]);
    const [value, setValue] = React.useState<Translation>();
    const [error, setError] = React.useState("");
    const [retry, setRetry] = React.useState(0);
    React.useEffect(() => {
        let mounted = true;
        setValue(undefined); setError("");
        const id = ensureAccount();
        if (!running || !incoming || !message.content?.trim() || message.author?.id === id || (message as any).vencordEmbeddedBy || /^https?:\/\/\S+$/.test(message.content)) return;
        queue.translate(message.content, language).then(result => {
            if (mounted && running && id === ensureAccount() && result.source.split("-")[0] !== language.split("-")[0]) setValue(result);
        }).catch(() => { if (mounted && running && id === account) setError("Translation unavailable"); });
        return () => { mounted = false; };
    }, [message.id, message.content, message.author?.id, incoming, language, retry]);
    if (error) return <span className="eqy-inline-translation"><button className="eqy-text-action" onClick={() => setRetry(retry + 1)}>{error} · Retry</button></span>;
    if (!value) return null;
    return <span className="eqy-inline-translation">{value.text}<small>{GoogleLanguages[value.source] ?? value.source} → {GoogleLanguages[language] ?? language}</small></span>;
}
function OutgoingDialog({ props }: { props: RenderModalProps; }) {
    const { outgoing, target } = settings.use(["outgoing", "target"]);
    return <Modal {...props} title="Translation Peek" size="sm" actions={[{ text: "Done", variant: "primary", onClick: props.onClose }]}><div className="eqy-search-panel">
        <label><input type="checkbox" checked={outgoing} onChange={event => settings.store.outgoing = event.currentTarget.checked} /> Translate outgoing messages</label>
        <label>Send In<select value={target} onChange={event => settings.store.target = event.currentTarget.value}>{languages.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <p className="eqy-hint">When enabled, pressing Enter translates and sends your message. Incoming translations remain active independently. Text is shared with Google Translate.</p>
    </div></Modal>;
}
function ComposerButton() {
    const { outgoing } = settings.use(["outgoing"]);
    return <ChatBarButton tooltip={outgoing ? "Outgoing translation on · click to configure" : "Outgoing translation off · click to configure"} onClick={() => openModal(props => <OutgoingDialog props={props} />)} onContextMenu={event => { event.preventDefault(); settings.store.outgoing = !outgoing; }}>
        <span className="eqy-icon-state" data-active={outgoing}><TranslateIcon /></span>
    </ChatBarButton>;
}
export default definePlugin({
    name: "TranslationPeek",
    description: "Automatic incoming translations below messages and a separate outgoing translation control in the composer. Uses Google Translate.",
    authors: [{ name: "0009cx0", id: 0n }],
    tags: ["Chat", "Utility"],
    settings,
    start() { running = true; ensureAccount(); },
    stop() { running = false; clearTranslations(); },
    flux: { LOGOUT() { clearTranslations(); account = ""; }, CONNECTION_CLOSED() { clearTranslations(); } },
    renderMessageAccessory: props => <Incoming message={props.message} />,
    renderChatBarButton: ({ isMainChat }) => isMainChat ? <ComposerButton /> : null,
    chatBarButtonIcon: TranslateIcon,
    contextMenus: { message: (children, { message }) => { if (message?.content) children.push(<Menu.MenuItem id="eqy-translation-settings" label="Translation settings" action={() => openModal(props => <OutgoingDialog props={props} />)} />); } },
    async onBeforeMessageSend(_, message) {
        if (!running || !settings.store.outgoing || !message.content.trim()) return;
        const id = ensureAccount(), original = message.content, { target } = settings.store;
        try {
            const result = await outgoingQueue.translate(original, target);
            if (!running || id !== ensureAccount() || message.content !== original || !settings.store.outgoing || target !== settings.store.target) return { cancel: true };
            message.content = result.text;
        } catch {
            showToast("Translation failed. Your message was not sent; your draft is kept.", "failure");
            return { cancel: true };
        }
    }
});
