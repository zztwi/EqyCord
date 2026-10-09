/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { registerVoiceButton, unregisterVoiceButton } from "@plugins/_api/voicePanel";
import { FocusVolumes } from "@shared/focusVolumes";
import definePlugin, { OptionType } from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { MediaEngineStore, Menu, Modal, openModal, React, SelectedChannelStore, showToast, UserStore, VoiceStateStore } from "@webpack/common";

const settings = definePluginSettings({ backgroundVolume: { type: OptionType.SLIDER, description: "Volume of other participants while focusing (percentage of their original volume).", markers: [0, 25, 50, 75, 100], default: 25, stickToMarkers: true } });
const actions = findByPropsLazy("setLocalVolume", "setLocalMute");
const volumes = new FocusVolumes(id => MediaEngineStore.getLocalVolume(id), (id, value) => actions.setLocalVolume(id, value));
let focused: string | undefined;
let account: string | undefined;
function reset() { if (account === UserStore.getCurrentUser()?.id) { if (volumes.restore().length) showToast("Some voice volumes could not be restored. Check participant volumes.", "failure"); } else volumes.discard(); focused = undefined; }
function apply() {
    const channel = SelectedChannelStore.getVoiceChannelId();
    if (!channel || !focused) return;
    const ids = Object.keys(VoiceStateStore.getVoiceStatesForChannel(channel)).filter(id => id !== UserStore.getCurrentUser()?.id);
    if (!ids.includes(focused)) { reset(); return; }
    volumes.apply(ids, focused, settings.store.backgroundVolume / 100);
}
function focus(id: string) { reset(); account = UserStore.getCurrentUser()?.id; focused = id; try { apply(); } catch { reset(); showToast("Voice Focus is unavailable on this Discord version.", "failure"); } }
function Icon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5" /></svg>; }
function openFocus() { openModal(props => <Modal {...props} title="Voice Focus" size="sm" actions={[{ text: "Close", variant: "secondary", onClick: props.onClose }, { text: "Restore volumes", variant: "primary", onClick: () => { reset(); props.onClose(); } }]}><div className="eqy-search-panel"><p>Choose a participant to keep at their usual volume. Everyone else becomes quieter locally.</p>{Object.keys(VoiceStateStore.getVoiceStatesForChannel(SelectedChannelStore.getVoiceChannelId() ?? "")).filter(id => id !== UserStore.getCurrentUser()?.id).map(id => <button className="eqy-text-action" key={id} onClick={() => { focus(id); props.onClose(); }}>{UserStore.getUser(id)?.username ?? "Participant"}{id === focused ? " · Focused" : ""}</button>)}</div></Modal>); }
export default definePlugin({
    name: "VoiceFocus", description: "Focus on one voice participant by lowering others locally. Original volumes restore when focus ends; manual volume changes are preserved.",
    authors: [{ name: "0009cx0", id: 0n }], tags: ["Voice", "Utility"], settings, dependencies: ["VoicePanelAPI"],
    start() { registerVoiceButton("focus", { label: "Voice Focus · choose a participant", icon: Icon, action: openFocus, active: () => !!focused }); },
    stop() { reset(); unregisterVoiceButton("focus"); },
    flux: { VOICE_CHANNEL_SELECT() { reset(); }, VOICE_STATE_UPDATES() { setTimeout(() => { try { apply(); } catch { reset(); } }, 0); }, LOGOUT() { reset(); }, CONNECTION_CLOSED() { reset(); } },
    contextMenus: { "user-context": (children, { user }) => { if (!user || !SelectedChannelStore.getVoiceChannelId() || !VoiceStateStore.getVoiceStateForChannel(SelectedChannelStore.getVoiceChannelId()!, user.id)) return; children.push(<Menu.MenuItem id="eqy-focus" label={focused === user.id ? "Stop Voice Focus" : "Focus on this voice"} action={() => focused === user.id ? reset() : focus(user.id)} />); } },
    settingsAboutComponent: () => <button className="eqy-text-action" onClick={openFocus}>Open Voice Focus</button>
});
