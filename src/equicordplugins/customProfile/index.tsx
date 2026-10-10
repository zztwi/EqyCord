/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

// Adapted from Endcord CustomProfile by pepsify.
// Original copyright (c) 2026 Vendicated and contributors, GPL-3.0-or-later.
// EqyCord adaptations copyright (c) 2026 EqyCord contributors.


import "./styles.css";

import { addProfileBadge, ProfileBadge, removeProfileBadge } from "@api/Badges";
import * as DataStore from "@api/DataStore";
import { HeaderBarButton } from "@api/HeaderBar";
import { CustomProfileData, isProfileImage, publicCustomProfile } from "@shared/eqyCustomProfile";
import { EquicordDevs } from "@utils/constants";
import { ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalRoot, openModal } from "@utils/modal";
import definePlugin from "@utils/types";
import { IconUtils, React, UserProfileStore, UserStore } from "@webpack/common";
import virtualMerge from "virtual-merge";

import { AVATAR_DECORATIONS, BADGES, BOOST_ICONS, BOOST_LABELS, NITRO_LEVELS, PROFILE_EFFECTS, SPECIAL_BADGES } from "./assets";
import { connectAccount, disconnectAccount, isConnected, publishProfile, queueProfile, removeSharedProfile, serviceOrigin, startService, stopService } from "./service";

const Root = ModalRoot as React.ComponentType<any>;
const Header = ModalHeader as React.ComponentType<any>;
const Content = ModalContent as React.ComponentType<any>;
const Footer = ModalFooter as React.ComponentType<any>;
const Close = ModalCloseButton as React.ComponentType<any>;
const KEY = "eqycord.customProfiles.v1";
interface SavedProfile { data: CustomProfileData; enabled: boolean; shared: boolean; presets: { name: string; data: CustomProfileData }[]; }
let saved: Record<string, SavedProfile> = {};
const remote = new Map<string, CustomProfileData>();
let running = false;
const restore: (() => void)[] = [];
const EMPTY: SavedProfile = { data: {}, enabled: false, shared: false, presets: [] };
function changed(id: string) {
    // Refresh readers without dispatching styled proxies into canonical stores.
    if (!id) return;
    (UserStore as any).emitChange?.();
    (UserProfileStore as any).emitChange?.();
}
function profile(id: string): CustomProfileData | undefined {
    if (!running) return;
    if (id === UserStore.getCurrentUser()?.id) return saved[id]?.enabled ? saved[id].data : undefined;
    queueProfile(id);
    return remote.get(id);
}
function appearance(user: any) {
    if (!user?.id) return user;
    const data = profile(user.id);
    if (!data) return user;
    return virtualMerge(user, {
        ...(data.username ? { username: data.username } : {}),
        ...(data.globalName ? { globalName: data.globalName } : {}),
        ...(data.createdAt ? { createdAt: new Date(`${data.createdAt}T12:00:00Z`) } : {}),
        ...(data.oldName ? { primaryGuild: { tag: data.oldName, identityEnabled: true, identityGuildId: "0" } } : {})
    });
}
function profileAppearance(original: any, id: string) {
    const data = profile(id);
    if (!original || !data) return original;
    return virtualMerge(original, {
        ...(data.bio != null ? { bio: data.bio } : {}),
        ...(data.pronouns != null ? { pronouns: data.pronouns } : {}),
        ...(data.accentColor != null ? { accentColor: data.accentColor, themeColors: [data.accentColor, data.accentColor2 ?? data.accentColor] } : {}),
        ...(data.nitro ? { premiumType: 2 } : {}),
        ...(data.profileEffectId ? { profileEffectId: data.profileEffectId } : {}),
        ...(data.decorationAsset ? { avatarDecoration: { asset: data.decorationAsset, skuId: data.decorationAsset } } : {})
    });
}
function wrap(object: any, key: string, apply: (result: any, args: any[]) => any) {
    if (typeof object?.[key] !== "function") return;
    const original = object[key];
    const replacement = function (this: any, ...args: any[]) { const result = original.apply(this, args); return running ? apply(result, args) : result; };
    object[key] = replacement;
    restore.push(() => { if (object[key] === replacement) object[key] = original; });
}
const badge: ProfileBadge = {
    id: "eqycord-custom-profile",
    getBadges: ({ userId }) => {
        const data = profile(userId);
        if (!data) return [];
        const badges = BADGES.filter(b => (data.badgeFlags ?? 0) & b.flag).map(b => ({ label: b.label, icon: b.icon }));
        for (const id of data.customBadgeIds ?? []) if (SPECIAL_BADGES[id]) badges.push(SPECIAL_BADGES[id]);
        if (data.nitroLevel != null && NITRO_LEVELS[data.nitroLevel]) badges.push(NITRO_LEVELS[data.nitroLevel]);
        if (data.boostMonths != null && BOOST_ICONS[data.boostMonths]) badges.push({ label: `Server Boost — ${BOOST_LABELS[data.boostMonths]}`, icon: BOOST_ICONS[data.boostMonths] });
        return badges.map((b, i) => ({ id: `eqycord-profile-${i}`, iconSrc: b.icon, description: `EqyCord profile style: ${b.label}` }));
    }
};
function Pencil(props: any) {
    return <svg {...props} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15z" /></svg>;
}
function Editor(props: any) {
    const { id } = UserStore.getCurrentUser();
    const initial = saved[id] ?? EMPTY;
    const [data, setData] = React.useState<CustomProfileData>({ ...initial.data });
    const [sharing, setSharing] = React.useState(initial.shared);
    const [connected, setConnected] = React.useState(false);
    const [busy, setBusy] = React.useState(false);
    const [error, setError] = React.useState("");
    const [presets, setPresets] = React.useState(initial.presets);
    const [presetName, setPresetName] = React.useState("");
    React.useEffect(() => { void isConnected().then(setConnected).catch(() => {}); }, []);
    const set = (key: keyof CustomProfileData, value: any) => setData(old => ({ ...old, [key]: value }));
    async function action(fn: () => Promise<void>) {
        if (UserStore.getCurrentUser()?.id !== id) { setError("Your account changed. Reopen the editor."); return; }
        setBusy(true); setError("");
        try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : "Could not save profile"); }
        finally { setBusy(false); }
    }
    async function save(reset = false) {
        const next = reset ? {} : data;
        // Validate public fields while allowing private local images and contact previews.
        publicCustomProfile({ ...next, avatar: undefined, banner: undefined });
        for (const key of ["avatar", "banner"] as const) if (next[key] && !isProfileImage(next[key], true)) throw new Error(`Invalid ${key} image`);
        if (sharing && !reset) await publishProfile(next);
        else if (initial.shared) await removeSharedProfile();
        saved[id] = { data: next, enabled: !reset, shared: sharing && !reset, presets };
        await DataStore.set(KEY, saved);
        changed(id);
        props.onClose();
    }
    const text = (key: keyof CustomProfileData, label: string, type = "text", placeholder = "") => <label className="eqy-cp-field">{label}<input type={type} value={String(data[key] ?? "")} placeholder={placeholder} disabled={busy} onChange={e => set(key, e.target.value || undefined)} /></label>;
    const choices = (key: "nitroLevel" | "boostMonths", items: { label: string; icon: string }[]) => <div className="eqy-cp-chips"><button type="button" aria-pressed={data[key] == null} onClick={() => set(key, undefined)}>None</button>{items.map((b, i) => <button type="button" key={i} aria-pressed={data[key] === i} onClick={() => set(key, i)}><img src={b.icon} alt="" />{b.label}</button>)}</div>;
    return <Root {...props} size="medium" className="eqy-cp-root">
        <Header><Pencil /><h2>Custom Profile</h2><Close onClick={props.onClose} /></Header>
        <Content className="eqy-cp-content">
            <p className="eqy-cp-note">Profile appearance for EqyCord. Badges and Nitro styles are cosmetic.</p>
            <div className="eqy-cp-presets"><input aria-label="Preset name" placeholder="Preset name" value={presetName} onChange={e => setPresetName(e.target.value)} maxLength={32} /><button type="button" disabled={!presetName.trim() || presets.length >= 20 || busy} onClick={() => { setPresets([...presets, { name: presetName.trim(), data: { ...data } }]); setPresetName(""); }}>Save preset</button></div>
            <div className="eqy-cp-chips">{presets.map((p, i) => <span key={i}><button type="button" onClick={() => setData({ ...p.data })}>{p.name}</button><button type="button" aria-label={`Delete preset ${p.name}`} onClick={() => setPresets(presets.filter((_, n) => n !== i))}>×</button></span>)}</div>
            <h3>Identity</h3><div className="eqy-cp-grid">{text("username", "Username", "text", "Your username")}{text("globalName", "Display name")}</div>
            <h3>Appearance</h3><div className="eqy-cp-grid">{text("avatar", "Profile picture", "url", "HTTPS image URL")}{text("banner", "Banner", "url", "HTTPS image URL")}</div>
            <label className="eqy-cp-field">Upload a local profile picture<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={busy} onChange={e => { const file = e.target.files?.[0]; if (!file) return; if (file.size > 250_000) { setError("Choose an image smaller than 250 KB"); return; } const reader = new FileReader(); reader.onload = () => { if (isProfileImage(reader.result, true)) set("avatar", reader.result); else setError("Unsupported image"); }; reader.readAsDataURL(file); }} /></label>
            <label className="eqy-cp-field">Bio<textarea maxLength={190} value={data.bio ?? ""} onChange={e => set("bio", e.target.value)} /></label>
            {text("pronouns", "Pronouns")}
            <div className="eqy-cp-colors">{(["accentColor", "accentColor2"] as const).map((key, i) => <label key={key}>Color {i + 1}<input type="color" value={`#${(data[key] ?? 0x5865f2).toString(16).padStart(6, "0")}`} onChange={e => set(key, parseInt(e.target.value.slice(1), 16))} /><button type="button" onClick={() => set(key, undefined)}>Clear</button></label>)}</div>
            {text("createdAt", "Account creation date (display only)", "date")}
            {text("email", "Email (local preview only)")}{text("phone", "Phone (local preview only)")}{text("oldName", "Clan tag (up to 5 characters)")}
            <h3>Badges</h3><div className="eqy-cp-chips">{BADGES.map(b => <button type="button" key={b.flag} aria-pressed={!!((data.badgeFlags ?? 0) & b.flag)} onClick={() => set("badgeFlags", (data.badgeFlags ?? 0) ^ b.flag)}><img src={b.icon} alt="" />{b.label}</button>)}</div>
            <h3>Nitro style</h3>{choices("nitroLevel", NITRO_LEVELS)}
            <label className="eqy-cp-toggle"><input type="checkbox" checked={data.nitro ?? false} onChange={e => set("nitro", e.target.checked)} />Preview Nitro profile colors</label>
            <h3>Server boost style</h3>{choices("boostMonths", BOOST_ICONS.map((icon, i) => ({ icon, label: BOOST_LABELS[i] })))}
            <h3>Special badges</h3><div className="eqy-cp-chips">{Object.entries(SPECIAL_BADGES).map(([key, b]) => <button type="button" key={key} aria-pressed={data.customBadgeIds?.includes(key) ?? false} onClick={() => set("customBadgeIds", data.customBadgeIds?.includes(key) ? data.customBadgeIds.filter(x => x !== key) : [...data.customBadgeIds ?? [], key])}><img src={b.icon} alt="" />{b.label}</button>)}</div>
            <label className="eqy-cp-field">Avatar decoration<select value={data.decorationAsset ?? ""} onChange={e => set("decorationAsset", e.target.value || undefined)}><option value="">None</option>{AVATAR_DECORATIONS.map((d, i) => <option key={i} value={d.id}>{d.label}</option>)}</select></label>
            <label className="eqy-cp-field">Profile effect<select value={data.profileEffectId ?? ""} onChange={e => set("profileEffectId", e.target.value || undefined)}><option value="">None</option>{PROFILE_EFFECTS.map((d, i) => <option key={i} value={d.id}>{d.label}</option>)}</select></label>
            <h3>Profile sharing</h3><p className="eqy-cp-note">{serviceOrigin ? "Connect the same Discord account to share your profile with other connected EqyCord clients. Email and phone stay local. Shared images must use HTTPS URLs." : "Local editing is available. Profile sharing will become available when the EqyCord service is activated."}</p>
            <button type="button" disabled={!serviceOrigin || busy} onClick={() => void action(async () => { if (connected) { if (initial.shared) throw new Error("Turn sharing off and save before disconnecting"); await disconnectAccount(); remote.clear(); } else await connectAccount(); setConnected(await isConnected()); })}>{connected ? "Disconnect account" : "Connect Discord account"}</button>
            <label className="eqy-cp-toggle"><input type="checkbox" disabled={!serviceOrigin || !connected || busy} checked={sharing} onChange={e => setSharing(e.target.checked)} />Share profile with EqyCord</label>
            {error && <p role="alert" className="eqy-cp-error">{error}</p>}
        </Content>
        <Footer><button type="button" disabled={busy} onClick={props.onClose}>Cancel</button><button type="button" disabled={busy} className="eqy-cp-danger" onClick={() => void action(() => save(true))}>Reset</button><button type="button" disabled={busy} className="eqy-cp-primary" onClick={() => void action(() => save())}>{busy ? "Working…" : "Save"}</button></Footer>
    </Root>;
}
function openEditor() { openModal(props => <Editor {...props} />); }

export default definePlugin({
    name: "CustomProfile",
    description: "Customize your profile appearance and optionally share it with connected EqyCord clients. Official badges and Nitro are not granted.",
    authors: [EquicordDevs.endcord_pepsify],
    dependencies: ["HeaderBarAPI", "BadgeAPI"],
    headerBarButton: { icon: Pencil, render: () => <HeaderBarButton icon={Pencil} tooltip="Custom Profile" onClick={openEditor} />, priority: 10 },
    patches: [{ find: ':"SHOULD_LOAD");', replacement: { match: /\i(?:\?)?.getPreviewBanner\(\i,\i,\i\)(?=.{0,100}"COMPLETE")/, replace: "$self.bannerUrl(arguments[0])||$&" } }],
    bannerUrl(props: any) { return profile(props?.user?.id ?? props?.userId ?? props?.id)?.banner; },
    async start() {
        saved = await DataStore.get<Record<string, SavedProfile>>(KEY) ?? {};
        running = true;
        startService((id, data) => { if (data) remote.set(id, data); else remote.delete(id); changed(id); });
        wrap(UserStore, "getUser", appearance);
        wrap(UserStore, "getCurrentUser", user => {
            // Avoid recursion: own-account identification inside appearance uses getCurrentUser.
            if (!user) return user;
            const data = saved[user.id]?.enabled ? saved[user.id].data : undefined;
            return data ? virtualMerge(user, { ...(data.username ? { username: data.username } : {}), ...(data.globalName ? { globalName: data.globalName } : {}), ...(data.email ? { email: data.email } : {}), ...(data.phone ? { phone: data.phone } : {}) }) : user;
        });
        wrap(UserProfileStore, "getUserProfile", (result, args) => profileAppearance(result, args[0]));
        wrap(IconUtils, "getUserAvatarURL", (result, args) => profile(args[0]?.id)?.avatar ?? result);
        addProfileBadge(badge);
    },
    stop() {
        running = false;
        stopService();
        removeProfileBadge(badge);
        restore.reverse().forEach(fn => fn());
        restore.length = 0;
        const ids = [...remote.keys(), ...Object.keys(saved)];
        remote.clear();
        ids.forEach(changed);
    },
    settingsAboutComponent: () => <button type="button" onClick={openEditor}>Open Custom Profile</button>
});
