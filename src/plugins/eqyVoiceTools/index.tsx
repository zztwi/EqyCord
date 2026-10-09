/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Button } from "@components/Button";
import { Flex } from "@components/Flex";
import { Paragraph } from "@components/Paragraph";
import definePlugin, { OptionType } from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { MediaEngineStore, SelectedChannelStore, showToast, useStateFromStores } from "@webpack/common";

const VoiceActions = findByPropsLazy("toggleSelfMute", "toggleSelfDeaf") as {
    toggleSelfMute(): void;
    toggleSelfDeaf(): void;
};
let running = false;

function VoiceControls() {
    const { muted, deafened, connected } = useStateFromStores([MediaEngineStore, SelectedChannelStore], () => ({
        muted: MediaEngineStore.isSelfMute(),
        deafened: MediaEngineStore.isSelfDeaf(),
        connected: !!SelectedChannelStore.getVoiceChannelId()
    }));

    const toggle = (action: "toggleSelfMute" | "toggleSelfDeaf") => {
        if (!running || !SelectedChannelStore.getVoiceChannelId()) return;
        try {
            VoiceActions[action]();
        } catch {
            showToast("EqyCord: voice controls are unavailable on this Discord version. Use Discord's normal controls.", "failure");
        }
    };

    return (
        <Flex flexDirection="column" gap="1em">
            <Paragraph>Normal Discord voice controls. Muting stops your microphone; deafening stops incoming audio and mutes you. Server restrictions still apply.</Paragraph>
            <Paragraph>Microphone: {muted ? "Muted" : "Unmuted"} · Audio: {deafened ? "Deafened" : "Listening"}</Paragraph>
            <Flex gap="0.5em">
                <Button disabled={!running || !connected} onClick={() => toggle("toggleSelfMute")}>{muted ? "Unmute" : "Mute"}</Button>
                <Button disabled={!running || !connected} onClick={() => toggle("toggleSelfDeaf")}>{deafened ? "Undeafen" : "Deafen"}</Button>
            </Flex>
            {!connected && <Paragraph>Join a voice channel to use these controls.</Paragraph>}
        </Flex>
    );
}

const settings = definePluginSettings({
    controls: {
        type: OptionType.COMPONENT,
        component: VoiceControls
    }
});

export default definePlugin({
    name: "EqyVoiceTools",
    description: "EqyCord: normal Discord mute/deafen controls with visible local voice state. No hidden audio bypass.",
    tags: ["Utility"],
    authors: [{ name: "EqyCord contributors", id: 0n }],
    settings,
    start() { running = true; },
    stop() { running = false; }
});
