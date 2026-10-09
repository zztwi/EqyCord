/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { openMessageSearch } from "@components/MessageSearch";
import { acquireSearch, indexMessage, releaseSearch } from "@utils/messageSearchService";
import definePlugin from "@utils/types";
import { Menu } from "@webpack/common";

export default definePlugin({
    name: "DuplicateFinder",
    description: "Find repeated links or the same uploaded attachment across loaded chats. Right-click a message to find duplicates.",
    authors: [{ name: "0009cx0", id: 0n }], tags: ["Chat", "Utility"],
    start() { acquireSearch("DuplicateFinder"); }, stop() { releaseSearch("DuplicateFinder"); },
    contextMenus: { message: (children, { message, channel }) => {
        if (!message || !channel || !(message.attachments?.length || /https?:\/\//.test(message.content ?? ""))) return;
        children.push(<Menu.MenuItem id="eqy-duplicates" label="Find duplicates" action={() => { indexMessage(message, channel.id); openMessageSearch({ query: "", mode: "duplicates", duplicateOf: message.id }); }} />);
    } }
});
