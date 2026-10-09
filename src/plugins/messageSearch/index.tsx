/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { openMessageSearch, QuickMessageResults } from "@components/MessageSearch";
import { acquireSearch, releaseSearch } from "@utils/messageSearchService";
import definePlugin, { OptionType } from "@utils/types";

const settings = definePluginSettings({
    resultCount: { type: OptionType.NUMBER, description: "Message results below people in Find or Start a Conversation (1–10).", default: 4 },
    ownMessages: { type: OptionType.BOOLEAN, description: "Show only messages you wrote in the conversation search.", default: false }
});

export default definePlugin({
    name: "MessageSearch",
    description: "Search messages across loaded chats from Find or Start a Conversation, with on-demand DM history search.",
    authors: [{ name: "0009cx0", id: 0n }],
    tags: ["Chat", "Utility"],
    settings,
    patches: [{ find: "QUICK_SWITCHER_MODAL_KEY", replacement: { match: /this\.renderResults\(\),/, replace: "$&$self.renderMessages(this.state.query)," } }],
    start() { acquireSearch("MessageSearch"); },
    stop() { releaseSearch("MessageSearch"); },
    renderMessages(query: string) { return <QuickMessageResults query={query} limit={Math.min(10, Math.max(1, Number(settings.store.resultCount) || 4))} mine={settings.store.ownMessages} />; },
    settingsAboutComponent: () => <button onClick={() => openMessageSearch()}>Apri ricerca messaggi</button>
});
