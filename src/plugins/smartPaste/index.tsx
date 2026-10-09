/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "@components/messageSearch.css";

import { Button } from "@components/Button";
import { HeadingSecondary } from "@components/Heading";
import { cleanPaste, codePaste } from "@shared/smartPaste";
import definePlugin from "@utils/types";
import { RenderModalProps } from "@vencord/discord-types";
import { findByPropsLazy } from "@webpack";
import { ChannelStore, DraftStore, DraftType, Menu, Modal, openModal, React, SelectedChannelStore, TextArea, TextInput, UploadHandler, UserStore } from "@webpack/common";

const drafts = findByPropsLazy("changeDraft", "saveDraft");
function PasteDialog({ props, channelId }: { props: RenderModalProps; channelId: string; }) {
    const [text, setText] = React.useState("");
    const [language, setLanguage] = React.useState("");
    const [error, setError] = React.useState("");
    const account = React.useRef(UserStore.getCurrentUser()?.id);
    const original = React.useRef(DraftStore.getDraft(channelId, DraftType.ChannelMessage));
    const valid = () => account.current === UserStore.getCurrentUser()?.id && channelId === SelectedChannelStore.getChannelId() && DraftStore.getDraft(channelId, DraftType.ChannelMessage) === original.current;
    return <Modal {...props} title="Smart Paste" size="lg" actions={[{ text: "Close", variant: "secondary", onClick: props.onClose }, { text: "Insert into draft", variant: "primary", disabled: !text.trim(), onClick: () => {
        if (!valid()) { setError("The chat or draft changed. Close this panel and try again."); return; }
        drafts.changeDraft(channelId, [original.current, text].filter(Boolean).join("\n"), DraftType.ChannelMessage); props.onClose();
    } }]}><div className="eqy-search-panel">
        <p className="eqy-hint">Paste and edit text here. Nothing is sent automatically.</p>
        <TextArea aria-label="Paste text" maxLength={200000} placeholder="Paste your text here…" value={text} onChange={setText} rows={8} />
        <section><HeadingSecondary>Code language (optional)</HeadingSecondary><TextInput placeholder="javascript, python, json…" value={language} onChange={setLanguage} /></section>
        <div className="eqy-control-actions"><Button size="small" variant="secondary" onClick={async () => { try { setText((await navigator.clipboard.readText()).slice(0, 200000)); } catch { setError("Clipboard access unavailable. Paste into the text box instead."); } }}>Read clipboard</Button><Button size="small" variant="secondary" onClick={() => setText(cleanPaste(text))}>Clean whitespace</Button><Button size="small" variant="secondary" onClick={() => setText(codePaste(text, language))}>Format as code</Button><Button size="small" variant="secondary" disabled={!text.trim()} onClick={() => {
            if (!valid()) { setError("The chat or draft changed. Close this panel and try again."); return; }
            UploadHandler.promptToUpload([new File([text], "message.txt", { type: "text/plain" })], ChannelStore.getChannel(channelId), DraftType.ChannelMessage); props.onClose();
        }}>Attach as text file</Button></div>
        {error && <p className="eqy-error" role="alert">{error}</p>}
    </div></Modal>;
}
export default definePlugin({
    name: "SmartPaste", description: "Clean pasted text, format code or attach a text file before sending. Right-click the message composer to open Smart Paste.",
    authors: [{ name: "0009cx0", id: 0n }], tags: ["Chat", "Utility"],
    contextMenus: { "textarea-context": children => { const channelId = SelectedChannelStore.getChannelId(); if (channelId) children.push(<Menu.MenuItem id="eqy-smart-paste" label="Smart Paste" action={() => openModal(props => <PasteDialog props={props} channelId={channelId} />)} />); } }
});
