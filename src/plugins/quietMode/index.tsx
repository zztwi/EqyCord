/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "@components/messageSearch.css";

import { registerVoiceButton, unregisterVoiceButton } from "@plugins/_api/voicePanel";
import definePlugin from "@utils/types";
import { StreamerModeStore } from "@webpack/common";

let active = false;
function toggle() { active = !active; StreamerModeStore.emitChange(); }
function Icon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>; }
export default definePlugin({
    name: "QuietMode", description: "Toggle Discord notification sounds and notifications off locally from the voice panel. Your microphone and voice audio stay unchanged.",
    authors: [{ name: "0009cx0", id: 0n }], tags: ["Voice", "Notifications"], dependencies: ["VoicePanelAPI"],
    patches: [{ find: 'static displayName="StreamerModeStore"', replacement: { match: /(get disable(?:Sounds|Notifications)\(\)\{return )/g, replace: "$1$self.isQuiet()||" } }],
    start() { registerVoiceButton("quiet", { label: "Quiet Mode · toggle notifications", icon: Icon, action: toggle, active: () => active }); },
    stop() { active = false; StreamerModeStore.emitChange(); unregisterVoiceButton("quiet"); },
    flux: { LOGOUT() { active = false; }, VOICE_CHANNEL_SELECT({ channelId }: { channelId: string | null; }) { if (!channelId) { active = false; StreamerModeStore.emitChange(); } } },
    isQuiet: () => active,
    settingsAboutComponent: () => <div className="eqy-search-panel"><p>Use the bell in the voice panel to toggle Quiet Mode. It resets when you leave voice or disable this plugin.</p></div>
});
