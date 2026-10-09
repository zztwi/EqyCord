/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "@components/messageSearch.css";

import { FormSwitch } from "@components/FormSwitch";
import definePlugin from "@utils/types";
import { Menu, SelectedChannelStore, StreamerModeStore, useStateFromStores } from "@webpack/common";

let active = false;
let running = false;
function toggle() { if (!running) return; active = !active; StreamerModeStore.emitChange(); }
export default definePlugin({
    name: "QuietMode", description: "Toggle Discord notification sounds and notifications off locally from settings or a voice participant menu. Your microphone and voice audio stay unchanged.",
    authors: [{ name: "0009cx0", id: 0n }], tags: ["Voice", "Notifications"],
    patches: [{ find: 'static displayName="StreamerModeStore"', replacement: { match: /(get disable(?:Sounds|Notifications)\(\)\{return )/g, replace: "$1$self.isQuiet()||" } }],
    start() { running = true; },
    stop() { running = false; active = false; StreamerModeStore.emitChange(); },
    flux: { LOGOUT() { active = false; }, VOICE_CHANNEL_SELECT({ channelId }: { channelId: string | null; }) { if (!channelId) { active = false; StreamerModeStore.emitChange(); } } },
    isQuiet: () => active,
    contextMenus: { "user-context": children => { if (SelectedChannelStore.getVoiceChannelId()) children.push(<Menu.MenuCheckboxItem id="eqy-quiet" label="Quiet Mode" checked={active} action={toggle} />); } },
    settingsAboutComponent: () => {
        const checked = useStateFromStores([StreamerModeStore], () => active);
        return <div className="eqy-search-panel"><FormSwitch title="Quiet Mode" value={checked} onChange={toggle} disabled={!running} /><p>Suppress notification sounds and notifications locally. Enable the plugin first. Quiet Mode resets when you leave voice or disable the plugin.</p></div>;
    }
});
