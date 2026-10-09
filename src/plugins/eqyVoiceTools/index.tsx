/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./styles.css";

import ErrorBoundary from "@components/ErrorBoundary";
import definePlugin from "@utils/types";
import { AuthenticationStore, MediaEngineStore, React, SelectedChannelStore, showToast, Tooltip, UserStore, useStateFromStores } from "@webpack/common";

import { GhostController, VoiceSocket, VoiceState } from "./state";

const ghost = new GhostController(() => SelectedChannelStore.getVoiceChannelId(), message => showToast(message, "failure"));

function GhostIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2a8 8 0 0 0-8 8v11a1 1 0 0 0 1.6.8L8 20l3.4 2.6a1 1 0 0 0 1.2 0L16 20l2.4 1.8A1 1 0 0 0 20 21V10a8 8 0 0 0-8-8Zm-3 8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
    </svg>;
}

function useGhostState() { return React.useSyncExternalStore(ghost.subscribe, ghost.snapshot); }

const GhostButton = ErrorBoundary.wrap(() => {
    useGhostState();
    const { muted, deafened, connected } = useStateFromStores([MediaEngineStore, SelectedChannelStore], () => ({
        muted: MediaEngineStore.isSelfMute(),
        deafened: MediaEngineStore.isSelfDeaf(),
        connected: !!SelectedChannelStore.getVoiceChannelId()
    }));

    const label = !connected ? "Ghost — join a voice channel"
        : !ghost.available ? "Ghost unavailable — restart Discord after enabling this plugin"
            : ghost.pending ? "Ghost — waiting for confirmation; click to cancel"
                : ghost.confirmed ? `Ghost active (experimental) · Microphone: ${muted ? "off" : "on"} · Audio: ${deafened ? "off" : "on"}`
                    : "Enable Ghost (experimental) — report muted and deafened without changing local audio";
    return <Tooltip text={label}>{props => <button
        {...props}
        className="eqycord-ghost-button"
        aria-label={label}
        aria-pressed={ghost.confirmed}
        data-active={ghost.confirmed}
        data-pending={ghost.pending}
        disabled={!connected || !ghost.available}
        onClick={() => ghost.toggle()}
    ><GhostIcon /></button>}</Tooltip>;
}, { noop: true });

export default definePlugin({
    name: "EqyVoiceTools",
    description: "EqyCord Ghost: an experimental voice-panel button that reports mute/deafen separately from local audio. Two-account audio verification required.",
    tags: ["Utility"],
    authors: [{ name: "0009cx0", id: 0n }],
    patches: [
        {
            find: /voiceStateUpdate\(\i\)\{/,
            replacement: {
                match: /voiceStateUpdate\((\i)\)\{/,
                replace: "$&$1=$self.prepareVoiceState($1,this);"
            }
        },
        {
            find: "handleOpenSettingsContextMenu=",
            group: true,
            replacement: [
                {
                    match: /(function \i\(\i\)\{)(?=let\{selfDeaf:\i,selfMute:)/,
                    replace: "$1$self.useGhostState();"
                },
                {
                    match: /(dismissTooltips:\i\}\),)(?=null!=\i\.\i\?)/,
                    replace: "$1$self.renderGhostButton(),"
                },
                {
                    match: /(accountContainerRef:\i,selfMute:)(\i)(?=,serverMute:)/,
                    replace: "$1$self.displayedVoiceFlag($2)"
                },
                {
                    match: /(selfDeaf:)(\i)(?=,serverDeaf:\i,onClick:)/,
                    replace: "$1$self.displayedVoiceFlag($2)"
                }
            ]
        }
    ],
    start() { ghost.start(); },
    stop() { ghost.stop(); },
    flux: {
        VOICE_STATE_UPDATES({ voiceStates }: { voiceStates: { userId: string; sessionId: string; channelId: string | null; selfMute: boolean; selfDeaf: boolean; }[]; }) {
            const userId = UserStore.getCurrentUser()?.id;
            for (const state of voiceStates) {
                if (state.userId === userId && state.sessionId === AuthenticationStore.getSessionId()
                    && state.channelId === SelectedChannelStore.getVoiceChannelId()) ghost.acknowledge(state);
            }
        },
        VOICE_CHANNEL_SELECT({ channelId }: { channelId: string | null; }) { ghost.channelChanged(channelId); },
        CONNECTION_CLOSED() { ghost.resetConnection(); },
        LOGOUT() { ghost.resetConnection(); }
    },
    useGhostState,
    displayedVoiceFlag(actual: boolean) { return ghost.confirmed || actual; },
    renderGhostButton: () => <GhostButton />,
    prepareVoiceState(state: VoiceState, socket: VoiceSocket) { return ghost.prepare(state, socket); }
});
