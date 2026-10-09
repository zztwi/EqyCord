/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { openMessageSearch, setAttachmentExtractor } from "@components/MessageSearch";
import { acquireSearch, indexMessage, releaseSearch } from "@utils/messageSearchService";
import definePlugin, { PluginNative } from "@utils/types";
import { Menu } from "@webpack/common";

const Native = VencordNative.pluginHelpers.AttachmentSearch as PluginNative<typeof import("./native")>;
const menu: NavContextMenuPatchCallback = (children, { message, channel }) => {
    if (!channel?.id) return;
    children.push(<Menu.MenuItem id="eqy-search-attachments" label="Search attachments" action={() => {
        if (message) indexMessage(message, channel.id);
        openMessageSearch({ query: "", mode: "attachments", channelId: channel.id });
    }} />);
};

export default definePlugin({
    name: "AttachmentSearch",
    description: "Find attachments by filename and read text/images/PDF locally on Windows. Right-click a message or open plugin settings.",
    authors: [{ name: "0009cx0", id: 0n }],
    tags: ["Chat", "Utility"],
    contextMenus: { message: menu, "channel-context": menu, "user-context": menu },
    start() { acquireSearch("AttachmentSearch"); if (!IS_WEB) setAttachmentExtractor((url, filename) => Native.extractAttachment(url, filename)); },
    stop() { setAttachmentExtractor(); releaseSearch("AttachmentSearch"); },
    settingsAboutComponent: () => <><p>Windows OCR supports images and the first five PDF pages, up to 10 MB. Browser builds support filename search. Extracted text stays in memory until disconnect.</p><button onClick={() => openMessageSearch({ query: "", mode: "attachments" })}>Open Attachment Search</button></>
});
