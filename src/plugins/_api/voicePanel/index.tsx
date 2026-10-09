/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "@components/messageSearch.css";

import ErrorBoundary from "@components/ErrorBoundary";
import definePlugin from "@utils/types";
import { React, SelectedChannelStore, Tooltip, useStateFromStores } from "@webpack/common";

const buttons = new Map<string, { label: string; icon: () => React.ReactNode; action: () => void; active?: () => boolean; }>();
const listeners = new Set<() => void>();
let revision = 0;
function emit() { revision++; for (const listener of listeners) listener(); }
export function registerVoiceButton(id: string, value: typeof buttons extends Map<string, infer V> ? V : never) { buttons.set(id, value); emit(); }
export function unregisterVoiceButton(id: string) { buttons.delete(id); emit(); }
const Panel = ErrorBoundary.wrap(() => {
    React.useSyncExternalStore(listener => { listeners.add(listener); return () => { listeners.delete(listener); }; }, () => revision);
    const connected = useStateFromStores([SelectedChannelStore], () => !!SelectedChannelStore.getVoiceChannelId());
    const [, tick] = React.useState(0);
    React.useEffect(() => { const timer = setInterval(() => tick(value => value + 1), 1000); return () => clearInterval(timer); }, []);
    if (!connected) return null;
    return <span style={{ display: "inline-flex", gap: 2 }}>{[...buttons].map(([id, button]) => <Tooltip key={id} text={button.label}>{props => <button {...props} className="eqy-voice-button" aria-label={button.label} aria-pressed={button.active?.()} onClick={button.action}><span className={button.active ? "eqy-icon-state" : undefined} data-active={button.active?.()}>{button.icon()}</span></button>}</Tooltip>)}</span>;
}, { noop: true });
export default definePlugin({
    name: "VoicePanelAPI", description: "Shared voice-panel controls for EqyCord plugins.", authors: [{ name: "0009cx0", id: 0n }],
    patches: [{ find: "handleOpenSettingsContextMenu=", replacement: { match: /(dismissTooltips:\i\}\),)(?=null!=\i\.\i\?)/, replace: "$1$self.renderPanel()," } }],
    renderPanel: () => <Panel />
});
