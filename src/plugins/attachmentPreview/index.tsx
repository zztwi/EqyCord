/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "@components/messageSearch.css";

import { Button } from "@components/Button";
import { readAttachment } from "@components/MessageSearch";
import { canReadChannel } from "@utils/messageSearchService";
import definePlugin from "@utils/types";
import { RenderModalProps } from "@vencord/discord-types";
import { Menu, Modal, openModal, React, UserStore } from "@webpack/common";

function Preview({ props, file, channelId }: { props: RenderModalProps; file: { url: string; filename: string; }; channelId: string; }) {
    const [text, setText] = React.useState("");
    const [query, setQuery] = React.useState("");
    const [notice, setNotice] = React.useState("");
    const [busy, setBusy] = React.useState(false);
    const mounted = React.useRef(true);
    React.useEffect(() => () => { mounted.current = false; }, []);
    const image = /\.(png|jpe?g|gif|webp|bmp)$/i.test(file.filename), video = /\.(mp4|webm|mov)$/i.test(file.filename);
    const safe = (() => { try { const url = new URL(file.url); return url.protocol === "https:" && ["cdn.discordapp.com", "media.discordapp.net"].includes(url.hostname) && !url.username && !url.password && !url.port && /^\/attachments\/\d+\/\d+\//.test(url.pathname); } catch { return false; } })();
    return <Modal {...props} title={file.filename} size="lg" actions={[{ text: "Close", variant: "secondary", onClick: props.onClose }]}><div className="eqy-search-panel">
        {safe && image && <img style={{ maxWidth: "100%", maxHeight: "45vh", objectFit: "contain" }} src={file.url} alt={file.filename} />}
        {safe && video && <video style={{ maxWidth: "100%", maxHeight: "45vh" }} controls src={file.url} />}
        {!video && <Button variant="secondary" disabled={busy || !safe} onClick={async () => {
            setBusy(true); setNotice(""); const account = UserStore.getCurrentUser()?.id;
            try { const result = await readAttachment(file.url, file.filename); if (mounted.current && account === UserStore.getCurrentUser()?.id && canReadChannel(channelId)) { setText(result.text); setNotice(result.note); } }
            catch (error) { if (mounted.current) setNotice(String(error)); }
            finally { if (mounted.current) setBusy(false); }
        }}>{busy ? "Reading…" : image || /\.pdf$/i.test(file.filename) ? "Read text with OCR" : "Read text"}</Button>}
        {text && <><input aria-label="Find in file" value={query} onChange={e => setQuery(e.currentTarget.value)} placeholder="Find in file…" /><div className="eqy-search-results"><pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", font: "inherit", margin: 0 }}>{query ? text.split("\n").filter(line => line.toLowerCase().includes(query.toLowerCase())).join("\n") || "No matching lines" : text}</pre></div></>}
        {notice && <p className="eqy-hint" role="status">{notice}</p>}
        {!video && <p className="eqy-hint">Text extraction runs locally on Windows. PDFs show OCR text from the first five pages; document layout is not preserved. Maximum file size: 10 MB.</p>}
    </div></Modal>;
}
export default definePlugin({
    name: "AttachmentPreview", description: "Preview images, videos and extracted document text from a message. Right-click a message and choose an attachment.",
    authors: [{ name: "0009cx0", id: 0n }], tags: ["Chat", "Utility"], dependencies: ["AttachmentSearch"],
    contextMenus: { message: (children, { message, channel }) => { if (!message?.attachments?.length || !channel?.id) return; children.push(<Menu.MenuItem id="eqy-preview" label="Preview attachment">{message.attachments.map(file => <Menu.MenuItem key={file.id} id={"eqy-preview-" + file.id} label={file.filename} action={() => openModal(props => <Preview props={props} file={file} channelId={channel.id} />)} />)}</Menu.MenuItem>); } }
});
