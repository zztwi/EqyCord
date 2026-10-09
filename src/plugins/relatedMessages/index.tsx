/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { openMessageSearch } from "@components/MessageSearch";
import { acquireSearch, indexMessage, releaseSearch } from "@utils/messageSearchService";
import definePlugin from "@utils/types";
import { Menu } from "@webpack/common";

const messageMenu: NavContextMenuPatchCallback = (children, { message, channel }) => {
    if (!message?.content || !channel?.id) return;
    children.push(<Menu.MenuItem id="eqy-related-messages" label="Trova messaggi correlati" action={() => {
        indexMessage(message, channel.id);
        openMessageSearch({ query: message.content, mode: "related", excludeId: message.id });
    }} />);
};

export default definePlugin({
    name: "RelatedMessages",
    description: "Find related messages by their meaningful words: right-click a message to search and open matching conversations.",
    authors: [{ name: "0009cx0", id: 0n }],
    tags: ["Chat", "Utility"],
    contextMenus: { message: messageMenu },
    start() { acquireSearch("RelatedMessages"); },
    stop() { releaseSearch("RelatedMessages"); },
    settingsAboutComponent: () => <button onClick={() => openMessageSearch({ query: "", mode: "related" })}>Apri ricerca correlata</button>
});
