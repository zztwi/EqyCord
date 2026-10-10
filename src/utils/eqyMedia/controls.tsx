/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { UserAreaButton } from "@api/UserArea";
import { React, showToast } from "@webpack/common";

import { hasOutgoing, snapshot, subscribe } from "./engine";
export function MediaIcon(props: any) { return <svg {...props} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 9v6m4-10v14m5-17v20m5-17v14m4-10v6" /></svg>; }
export function EffectButton({ name, kind, active, onClick }: { name: string; kind: string; active: boolean; onClick(): void; }) {
    React.useSyncExternalStore(subscribe, snapshot);
    const available = hasOutgoing(kind);
    return <UserAreaButton icon={<MediaIcon />} tooltipText={available ? `${name}: ${active ? "ON — click to stop" : "OFF — click to enable"}` : `${name}: no outgoing WebRTC ${kind}. Native Canary media is unsupported.`} aria-label={name} role="switch" aria-checked={available && active} orangeGlow={available && active} onClick={() => { if (!available) showToast("No outgoing WebRTC track. Enable before joining a browser call; native Canary media is unsupported.", "failure"); else onClick(); }} />;
}
