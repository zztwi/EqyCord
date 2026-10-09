/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";
import { build } from "esbuild";

async function load(entry, mocks = {}, globals = {}) {
    const { outputFiles } = await build({
        entryPoints: [entry], bundle: true, write: false, format: "cjs", platform: "node",
        jsxFactory: "React.createElement", loader: { ".css": "empty" }, logLevel: "silent",
        external: ["@api/*", "@utils/*", "@plugins/*", "@webpack", "@webpack/*", "@components/*", "~*", "./styles.css", "./settings", "./TranslateIcon", "./TranslationAccessory", "./utils"]
    });
    const module = { exports: {} };
    const require = name => {
        assert.ok(Object.hasOwn(mocks, name), "Unmocked boundary: " + name);
        return mocks[name];
    };
    const injected = { IS_WEB: false, IS_DISCORD_DESKTOP: false, React: { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }) }, ...globals };
    new Function("module", "exports", "require", ...Object.keys(injected), outputFiles[0].text)(module, module.exports, require, ...Object.values(injected));
    return module.exports;
}

const definePlugin = Object.assign(plugin => plugin, { OptionType: { BOOLEAN: 1, SELECT: 2, COMPONENT: 3 } });
const definePluginSettings = def => ({ def, store: Object.fromEntries(Object.entries(def).map(([key, option]) => [key, option.default ?? option.options?.find(o => o.default)?.value])) });
const tick = () => new Promise(resolve => setImmediate(resolve));

test("renamed plugin settings migrate without overriding current values", async () => {
    const { migrateEqyPluginNames } = await load("src/shared/eqyPluginNames.ts");
    const plugins = { EqyAutoTranslate: { enabled: true, targetLanguage: "it" }, EqyVoiceTools: { enabled: true }, AutoTranslate: { enabled: false }, Other: { enabled: true } };
    migrateEqyPluginNames(plugins);
    assert.deepEqual(plugins, { AutoTranslate: { enabled: false }, VoiceTool: { enabled: true }, Other: { enabled: true } });
});

test("message index searches all chats, respects scope/permissions, and updates/deletes old content", async () => {
    const { MessageIndex } = await load("src/shared/messageSearch.ts");
    const index = new MessageIndex(2);
    const message = (id, channelId, content, timestamp = 1) => ({ id, channelId, content, timestamp, authorId: "me", author: "Me", attachments: [] });
    index.upsert(message("1", "a", "Caffè con Marco"));
    index.upsert(message("2", "b", "Caffè domani", 2));
    assert.deepEqual(index.search({ query: "caffe" }).map(m => m.id), ["2", "1"]);
    assert.deepEqual(index.search({ query: "caffe", channelId: "a" }).map(m => m.id), ["1"]);
    assert.deepEqual(index.search({ query: "caffe" }, channel => channel === "a").map(m => m.id), ["1"]);
    index.upsert(message("1", "a", "Modificato"));
    assert.deepEqual(index.search({ query: "caffe" }).map(m => m.id), ["2"]);
    index.upsert(message("3", "c", "nuovo"));
    assert.equal(index.size, 2);
    assert.deepEqual(index.search({ query: "caffe" }), []);
    index.removeChannel("a"); assert.equal(index.size, 1);
    index.clear(); assert.equal(index.size, 0);
});

test("related messages rank meaningful shared words and attachments retain only text for identical URLs", async () => {
    const { MessageIndex, keywords, parseSearchResponse } = await load("src/shared/messageSearch.ts");
    assert.deepEqual(keywords("Come stai? Ho perso il contratto contratto firmato"), ["contratto", "firmato", "perso", "stai"]);
    const index = new MessageIndex();
    const base = { channelId: "a", authorId: "me", author: "Me", timestamp: 1, attachments: [] };
    index.upsert({ ...base, id: "1", content: "contratto firmato" });
    index.upsert({ ...base, id: "2", content: "contratto" });
    index.upsert({ ...base, id: "3", content: "ciao", attachments: [{ id: "f", filename: "documento.pdf", url: "url" }] });
    assert.deepEqual(index.search({ query: "contratto firmato", mode: "related", excludeId: "3" }).map(m => m.id), ["1", "2"]);
    index.setAttachmentText("3", "f", "fattura marzo");
    assert.equal(index.search({ query: "fattura", mode: "attachments" })[0].id, "3");
    index.upsert({ ...base, id: "3", content: "edited", attachments: [{ id: "f", filename: "documento.pdf", url: "url" }] });
    assert.equal(index.search({ query: "fattura", mode: "attachments" }).length, 1);
    index.upsert({ ...base, id: "3", content: "edited", attachments: [{ id: "f", filename: "documento.pdf", url: "new-url" }] });
    assert.equal(index.search({ query: "fattura", mode: "attachments" }).length, 0);
    assert.deepEqual(parseSearchResponse({ messages: [[{ id: "1", hit: true }, { id: "2", hit: false }]], total_results: 1 }).messages.map(m => m.id), ["1"]);
    assert.throws(() => parseSearchResponse({ messages: "bad" }));
});

test("voice rolling buffer respects duration, byte bounds, clear and produces PCM WAV", async () => {
    const { RollingAudio, pcmWav } = await load("src/plugins/voiceReplay/buffer.ts");
    const buffer = new RollingAudio(30, 5);
    buffer.push({ bytes: new Uint8Array(3), timestamp: 1000, mime: "audio/webm" });
    buffer.push({ bytes: new Uint8Array(3), timestamp: 2000, mime: "audio/webm" });
    assert.equal(buffer.count, 1);
    assert.equal(buffer.snapshot(30, 33000).length, 0);
    buffer.push({ bytes: new Uint8Array(1), timestamp: 34000, mime: "audio/webm" });
    assert.equal(buffer.snapshot(1, 34000).length, 1);
    buffer.clear(); assert.equal(buffer.count, 0);
    const wav = Buffer.from(pcmWav(new Float32Array([-2, 0, 2])));
    assert.equal(wav.toString("ascii", 0, 4), "RIFF"); assert.equal(wav.readUInt32LE(24), 16000);
    assert.equal(wav.readInt16LE(44), -32768); assert.equal(wav.readInt16LE(48), 32767);
});

async function searchSetup(get) {
    let account = "me";
    const subscriptions = new Map();
    const common = {
        UserStore: { getCurrentUser: () => account ? { id: account } : undefined, getUser: () => ({ username: "person" }) },
        ChannelStore: { getChannel: id => id === "dm" ? { isPrivate: () => true, isDM: () => true, recipients: ["person"] } : undefined, getMutablePrivateChannels: () => ({ dm: {} }), getMutableGuildChannelsForGuild: () => ({}) },
        GuildStore: { getGuilds: () => ({}) }, MessageStore: { getMessage: () => undefined, getMessages: () => ({ _array: [] }) },
        SelectedChannelStore: { getChannelId: () => "dm" }, PrivateChannelSortStore: { getPrivateChannelIds: () => ["dm"] },
        PermissionStore: {}, PermissionsBits: {}, RestAPI: { get },
        FluxDispatcher: { subscribe: (event, callback) => subscriptions.set(event, callback), unsubscribe: event => subscriptions.delete(event) }
    };
    const service = await load("src/utils/messageSearchService.ts", { "@webpack/common": common });
    service.acquireSearch("test");
    return { service, subscriptions, switchAccount() { account = "other"; } };
}

test("history search uses DM endpoint, advances pages, and drops results after cancellation/account switch", async () => {
    const calls = [];
    const s = await searchSetup(async args => { calls.push(args); return { status: 200, body: { messages: [[{ id: "1", hit: true, channel_id: "dm", content: "caffe", author: { id: "me", username: "me" }, attachments: [] }]] } }; });
    const offsets = new Map(), controller = new AbortController();
    await s.service.searchHistory({ query: "caffe" }, () => {}, controller.signal, offsets);
    await s.service.searchHistory({ query: "caffe" }, () => {}, controller.signal, offsets);
    assert.equal(calls[0].url, "/channels/dm/messages/search"); assert.equal(calls[1].query.offset, 25);
    assert.equal(s.service.cachedSearch({ query: "caffe" }).length, 1);
    s.switchAccount(); assert.equal(s.service.cachedSearch({ query: "caffe" }).length, 0);
    controller.abort(); await assert.rejects(s.service.searchHistory({ query: "caffe" }, () => {}, controller.signal), /cancelled/);
    s.service.releaseSearch("test"); assert.equal(s.subscriptions.size, 0);
    let resolve;
    const pending = await searchSetup(() => new Promise(done => { resolve = done; }));
    const run = pending.service.searchHistory({ query: "private" }, () => {}, new AbortController().signal);
    pending.switchAccount();
    resolve({ status: 200, body: { messages: [[{ id: "2", channel_id: "dm", content: "private", author: { id: "me" }, attachments: [] }]] } });
    await assert.rejects(run, /cancelled/);
    assert.equal(pending.service.cachedSearch({ query: "private" }).length, 0);
    pending.service.releaseSearch("test");
});

test("history search stops on rate limits and reports indexing without advancing pages", async () => {
    const s = await searchSetup(async () => { throw { status: 429 }; });
    await assert.rejects(s.service.searchHistory({ query: "hello" }, () => {}, new AbortController().signal), /rate limit/);
    s.service.releaseSearch("test");
    const indexing = await searchSetup(async () => ({ status: 202 }));
    const offsets = new Map();
    const result = await indexing.service.searchHistory({ query: "hello" }, () => {}, new AbortController().signal, offsets);
    assert.equal(result.indexing, 1); assert.equal(offsets.size, 0); indexing.service.releaseSearch("test");
});

test("conversation search patch leaves people results and appends message results once", async () => {
    const plugin = (await load("src/plugins/messageSearch/index.tsx", {
        "@api/Settings": { definePluginSettings }, "@components/MessageSearch": {}, "@utils/messageSearchService": {}, "@utils/types": definePlugin
    })).default;
    const root = process.env.EQYCORD_DISCORD_ASSETS;
    const source = root ? readFileSync(`${root}/quickSwitcher.txt`, "utf8") : 'class Quick{render(){return [this.renderInput(),this.renderResults(),this.renderProtip()]}};const key="QUICK_SWITCHER_MODAL_KEY";';
    const { match, replace } = plugin.patches[0].replacement;
    assert.equal([...source.matchAll(new RegExp(match.source, "g"))].length, 1);
    const patched = source.replace(match, replace.replaceAll("$self", "searchPlugin"));
    assert.ok(patched.includes("this.renderResults(),searchPlugin.renderMessages(this.state.query),"));
    new Function(root ? "return ({" + patched.slice(1) + "});" : patched);
});

async function autoSetup(provider = async () => ({ text: "ciao" })) {
    let modal, options, closed = 0;
    const providerSettings = { store: { autoTranslate: false, service: "google" } };
    const plugin = (await load("src/plugins/eqyAutoTranslate/index.tsx", {
        "@api/Settings": { definePluginSettings, migratePluginSettings() {} },
        "@utils/types": definePlugin,
        "@plugins/translate/settings": { settings: providerSettings },
        "@plugins/translate/utils": { translate: provider },
        "@webpack/common": {
            ConfirmModal: "ConfirmModal", showToast() {},
            openModal(render, opts) { options = opts; modal = render({ transitionState: 1, onClose() { closed++; } }); return "preview"; },
            closeModal() { closed++; options?.onCloseCallback(); }
        }
    })).default;
    plugin.start();
    plugin.settings.store.translateOnSend = true;
    return { plugin, providerSettings, modal: () => modal, options: () => options, closed: () => closed };
}

test("origins distinguish upstream, first-party and local community plugins", async () => {
    const { getPluginOrigin, matchesPluginOrigin } = await load("src/shared/eqyPluginOrigins.ts");
    assert.equal(getPluginOrigin("Translate"), "Vencord");
    for (const name of ["EqyAutoTranslate", "EqyVoiceTools"]) {
        assert.equal(getPluginOrigin(name), "EqyCord");
        assert.equal(matchesPluginOrigin(name, false, "EqyCord"), true);
        assert.equal(matchesPluginOrigin(name, false, "Vencord"), false);
    }
    assert.equal(getPluginOrigin("EqyAutoTranslate", true), "Community");
    assert.equal(matchesPluginOrigin("LocalPlugin", true, "Community"), true);
    assert.equal(matchesPluginOrigin("Translate", false, "All"), true);
});

test("every plugin source from the upstream base remains, with original copyright and authors", () => {
    const base = "718c867256a9d181edc7a534afb296b9bb41ab58";
    const paths = execFileSync("git", ["ls-tree", "-r", "--name-only", base, "src/plugins"], { encoding: "utf8" }).trim().split("\n");
    let plugins = 0;
    for (const path of paths) {
        const current = readFileSync(path, "utf8");
        if (!/\.(ts|tsx|css)$/.test(path)) continue;
        const original = execFileSync("git", ["show", `${base}:${path}`], { encoding: "utf8" });
        const copyright = original.match(/\* Copyright[^\r\n]*/)?.[0];
        if (copyright) assert.ok(current.includes(copyright), path + " copyright changed");
        const authors = original.match(/authors:\s*\[[\s\S]*?\]/)?.[0];
        if (authors) {
            plugins++;
            assert.ok(current.includes(authors), path + " original authors changed");
        }
    }
    console.log(`Preserved ${plugins} upstream plugin definitions and ${paths.length} upstream plugin files.`);
});

test("translation requires approval, including unchanged text; provider language codes are mapped", async () => {
    const { prepareTranslation, providerLanguage } = await load("src/plugins/eqyAutoTranslate/workflow.ts");
    let confirmed = 0;
    const flow = { isCurrent: () => true, translate: async () => "hello", confirm: async () => { confirmed++; return true; } };
    assert.equal(await prepareTranslation("hello", "en", flow), "hello");
    assert.equal(confirmed, 1);
    assert.equal(providerLanguage("deepl", "en"), "en-us");
    assert.equal(providerLanguage("deepl-pro", "pt"), "pt-pt");
    assert.equal(providerLanguage("google", "pt"), "pt");
});

test("translation rejects failures, empty output, timeout, cancellation and stale approvals", async () => {
    const { prepareTranslation } = await load("src/plugins/eqyAutoTranslate/workflow.ts");
    const base = { isCurrent: () => true, translate: async () => "ciao", confirm: async () => true };
    assert.equal(await prepareTranslation("hello", "it", { ...base, translate: async () => { throw Error("offline"); } }), null);
    assert.equal(await prepareTranslation("hello", "it", { ...base, translate: async () => " " }), null);
    assert.equal(await prepareTranslation("hello", "it", { ...base, translate: () => new Promise(() => {}) }, 5), null);
    assert.equal(await prepareTranslation("hello", "it", { ...base, confirm: async () => false }), null);
    assert.equal(await prepareTranslation("hello", "it", { ...base, confirm: async () => { throw Error("modal failed"); } }), null);
    let active = true;
    assert.equal(await prepareTranslation("hello", "it", { ...base, isCurrent: () => active, confirm: async () => { active = false; return true; } }), null);
});

test("actual AutoTranslate hook edits content only after confirm", async () => {
    const setup = await autoSetup();
    const message = { content: "hello" };
    const pending = setup.plugin.onBeforeMessageSend("channel", message);
    await tick();
    assert.equal(message.content, "hello");
    assert.equal(setup.modal().props.confirmText, "Send translated message");
    setup.modal().props.onConfirm();
    setup.options().onCloseCallback(); // ConfirmModal subsequently closes.
    assert.equal(await pending, undefined);
    assert.equal(message.content, "ciao");
    setup.plugin.stop();
});

for (const action of ["cancel", "close", "escape/backdrop", "stop", "content-changed"]) {
    test("actual AutoTranslate hook cancels on " + action, async () => {
        const setup = await autoSetup();
        const message = { content: "hello" };
        const pending = setup.plugin.onBeforeMessageSend("channel", message);
        await tick();
        if (action === "cancel") setup.modal().props.onCancel();
        if (action === "close") setup.modal().props.onClose();
        if (action === "escape/backdrop") setup.options().onCloseCallback();
        if (action === "stop") setup.plugin.stop();
        if (action === "content-changed") { message.content = "new draft"; setup.modal().props.onConfirm(); }
        assert.deepEqual(await pending, { cancel: true });
        assert.equal(message.content, action === "content-changed" ? "new draft" : "hello");
        setup.plugin.stop();
    });
}

test("actual AutoTranslate hook cancels conflicting modes and provider errors", async () => {
    let calls = 0;
    const setup = await autoSetup(async () => { calls++; throw Error("provider failed"); });
    setup.providerSettings.store.autoTranslate = true;
    const message = { content: "hello" };
    assert.deepEqual(await setup.plugin.onBeforeMessageSend("channel", message), { cancel: true });
    assert.equal(calls, 0);
    setup.providerSettings.store.autoTranslate = false;
    assert.deepEqual(await setup.plugin.onBeforeMessageSend("channel", message), { cancel: true });
    assert.equal(message.content, "hello");
    setup.plugin.stop();
});

test("upstream Translate defers to EqyAutoTranslate independently of listener order", async () => {
    let calls = 0;
    const Settings = { plugins: { EqyAutoTranslate: { enabled: true, translateOnSend: true } } };
    const upstream = (await load("src/plugins/translate/index.tsx", {
        "@api/ContextMenu": {}, "@api/Settings": { Settings }, "@utils/constants": { Devs: {} }, "@utils/types": definePlugin,
        "@webpack/common": {}, "./styles.css": {}, "./settings": { settings: { store: { autoTranslate: true } } },
        "./TranslateIcon": {}, "./TranslationAccessory": {}, "./utils": { translate: async () => { calls++; return { text: "changed" }; } }
    })).default;
    const message = { content: "hello" };
    await upstream.onBeforeMessageSend("channel", message);
    assert.equal(calls, 0);
    assert.equal(message.content, "hello");
});

test("Vencord backup parser preserves unknown plugin data and rejects malformed/unsafe data", async () => {
    const { parseSettingsBackup } = await load("src/shared/eqySettingsBackup.ts");
    const fixture = JSON.parse(readFileSync("scripts/eqycord/backup.fixture.json", "utf8"));
    const expected = structuredClone(fixture);
    expected.settings.plugins.AutoTranslate = expected.settings.plugins.EqyAutoTranslate;
    delete expected.settings.plugins.EqyAutoTranslate;
    assert.deepEqual(parseSettingsBackup(JSON.stringify(fixture)), expected);
    for (const data of ["null", "[]", "{}", '{"settings":[],"quickCss":""}', '{"settings":{"plugins":[]},"quickCss":""}', '{"settings":{"nested":{"__proto__":{}}},"quickCss":""}', '{"settings":{},"quickCss":false}']) {
        assert.throws(() => parseSettingsBackup(data));
    }
});

test("real backup import/export round trips and rolls back a failed CSS write", async () => {
    const original = { plugins: { Translate: { enabled: false } }, autoUpdate: false };
    let stored = structuredClone(original), css = "old-css", failCss = false;
    const PlainSettings = structuredClone(original);
    const offline = await load("src/api/SettingsSync/offline.ts", {
        "@api/Settings": { PlainSettings }, "@utils/Logger": { Logger: class {} }, "@utils/web": {}, "@webpack/common": {}
    }, { VencordNative: {
        settings: { get: () => stored, set: async value => { stored = structuredClone(value); } },
        quickCss: { get: async () => css, set: async value => { if (failCss) { failCss = false; throw Error("write failed"); } css = value; } }
    } });
    const data = readFileSync("scripts/eqycord/backup.fixture.json", "utf8");
    failCss = true;
    await assert.rejects(offline.importSettings(data), /write failed/);
    assert.deepEqual(stored, original);
    assert.deepEqual(PlainSettings, original);
    assert.equal(css, "old-css");
    await offline.importSettings(data);
    const exported = JSON.parse(await offline.exportSettings());
    const expected = JSON.parse(data).settings.plugins;
    expected.AutoTranslate = expected.EqyAutoTranslate; delete expected.EqyAutoTranslate;
    assert.deepEqual(exported.settings.plugins, expected);
    assert.equal(exported.quickCss, JSON.parse(data).quickCss);
    assert.deepEqual(PlainSettings, stored);
});

async function ghostSetup() {
    let channel = "voice", muted = false, deafened = false;
    const errors = [], sends = [];
    const React = { createElement: (type, props, ...children) => ({ type, props: { ...props, children } }), useSyncExternalStore: (_subscribe, snapshot) => snapshot() };
    const plugin = (await load("src/plugins/eqyVoiceTools/index.tsx", {
        "@api/Settings": { migratePluginSettings() {} },
        "./styles.css": {},
        "@utils/types": definePlugin,
        "@components/ErrorBoundary": { wrap: component => component },
        "@webpack/common": {
            React, Tooltip: "Tooltip", MediaEngineStore: { isSelfMute: () => muted, isSelfDeaf: () => deafened },
            SelectedChannelStore: { getVoiceChannelId: () => channel }, UserStore: { getCurrentUser: () => ({ id: "me" }) },
            AuthenticationStore: { getSessionId: () => "current-session" },
            useStateFromStores: (_stores, read) => read(), showToast: message => errors.push(message)
        }
    }, { React })).default;
    const socket = { isSessionEstablished: () => true, voiceStateUpdate: state => sends.push(plugin.prepareVoiceState(state, socket)) };
    plugin.start();
    const local = { channelId: channel, guildId: "guild", selfMute: muted, selfDeaf: deafened, selfVideo: true, flags: 8 };
    socket.voiceStateUpdate(local);
    const button = () => {
        const node = plugin.renderGhostButton();
        return node.type().props.children[0]({}).props.children[0];
    };
    const acknowledge = (extra = {}) => plugin.flux.VOICE_STATE_UPDATES({ voiceStates: [{ userId: "me", sessionId: "current-session", channelId: channel, selfMute: true, selfDeaf: true, ...extra }] });
    return { plugin, socket, local, errors, sends, button, acknowledge, disconnect() { channel = null; plugin.flux.VOICE_CHANNEL_SELECT({ channelId: null }); } };
}

test("Ghost changes only reported flags, waits for own session acknowledgement and restores current local state", async () => {
    const s = await ghostSetup();
    assert.equal(s.button().props.disabled, false);
    s.button().props.onClick();
    assert.equal(s.button().props["aria-pressed"], false);
    assert.deepEqual(s.sends.at(-1), { ...s.local, selfMute: true, selfDeaf: true });
    assert.equal(s.local.selfMute, false);
    assert.equal(s.local.selfDeaf, false);
    s.acknowledge({ userId: "other" });
    s.acknowledge({ sessionId: "other-session" });
    assert.equal(s.button().props["aria-pressed"], false);
    s.acknowledge();
    assert.equal(s.button().props["aria-pressed"], true);
    assert.equal(s.plugin.displayedVoiceFlag(false), true);
    s.socket.voiceStateUpdate({ ...s.local, selfMute: true });
    s.button().props.onClick();
    assert.equal(s.sends.at(-1).selfMute, true);
    assert.equal(s.sends.at(-1).selfDeaf, false);
    assert.equal(s.plugin.displayedVoiceFlag(false), false);
    s.plugin.stop();
});

test("Ghost resets on channel change, connection loss and plugin stop; never activates while disconnected", async () => {
    const s = await ghostSetup();
    s.button().props.onClick(); s.acknowledge();
    s.plugin.stop();
    assert.equal(s.sends.at(-1).selfDeaf, false);
    assert.equal(s.button().props.disabled, true);
    s.plugin.start(); s.socket.voiceStateUpdate(s.local);
    s.button().props.onClick(); s.acknowledge();
    s.plugin.flux.CONNECTION_CLOSED();
    assert.equal(s.button().props.disabled, true);
    s.socket.voiceStateUpdate(s.local);
    s.button().props.onClick(); s.acknowledge();
    s.disconnect();
    assert.equal(s.button().props.disabled, true);
    assert.equal(s.plugin.prepareVoiceState({ ...s.local, channelId: "new" }, s.socket).selfDeaf, false);
    s.plugin.stop();
});

test("Ghost confirmation timeout and failed socket restore normal status without persisting Ghost", async () => {
    const { GhostController } = await load("src/plugins/eqyVoiceTools/state.ts");
    const errors = [], sends = [];
    const ghost = new GhostController(() => "voice", message => errors.push(message), 5);
    const socket = { isSessionEstablished: () => true, voiceStateUpdate: state => sends.push(ghost.prepare(state, socket)) };
    const local = { channelId: "voice", selfMute: false, selfDeaf: false };
    ghost.start(); socket.voiceStateUpdate(local); ghost.toggle();
    await new Promise(resolve => setTimeout(resolve, 20));
    assert.equal(ghost.pending, false); assert.equal(ghost.confirmed, false);
    assert.deepEqual(sends.at(-1), local); assert.equal(errors.length, 1);
    socket.voiceStateUpdate = () => { throw Error("disconnected"); };
    ghost.toggle(); assert.equal(ghost.pending, false); assert.equal(errors.length, 2);
    ghost.stop();
});

test("Ghost patches insert one adjacent button and visual flags without replacing native voice handlers", async () => {
    const s = await ghostSetup();
    const { canonicalizeMatch, canonicalizeReplace } = await load("src/utils/patches.ts", { "./intlHash": { runtimeHashMessageKey: key => key } });
    const root = process.env.EQYCORD_DISCORD_ASSETS;
    const examples = [
        'class Gateway{voiceStateUpdate(e){const payload={self_mute:e.selfMute,self_deaf:e.selfDeaf};this.send(4,payload)}voiceServerPing(){}}',
        'function controls(p){let{selfDeaf:d,selfMute:m}=p;return jsx("div",{children:[jsx(Mic,{accountContainerRef:ref,selfMute:m,serverMute:s}),jsx(Deaf,{selfDeaf:d,serverDeaf:s,onClick:deaf,dismissTooltips:done}),null!=lazy.Component?jsx(lazy.Component,{}):settings()]})}obj.handleOpenSettingsContextMenu=fn;'
    ];
    for (const [index, patch] of s.plugin.patches.entries()) {
        let source = root ? readFileSync(`${root}/${index ? "panel" : "gateway"}.txt`, "utf8") : examples[index];
        assert.ok(canonicalizeMatch(patch.find) instanceof RegExp ? canonicalizeMatch(patch.find).test(source) : source.includes(patch.find));
        for (const replacement of [patch.replacement].flat()) {
            const regex = canonicalizeMatch(replacement.match);
            assert.equal([...source.matchAll(new RegExp(regex.source, "g"))].length, 1, replacement.match.toString());
            source = source.replace(regex, canonicalizeReplace(replacement.replace, "ghost"));
        }
        new Function(root ? "return ({" + source.slice(1) + "});" : source);
        if (index) {
            assert.ok(source.includes("ghost.renderGhostButton(),null!="));
            assert.ok(source.includes("onClick:deaf") || source.includes("handleToggleSelfDeaf:this.handleToggleSelfDeaf"));
        }
    }
    assert.ok(s.plugin.patches.length); // Upstream manager requests restart for patched plugins.
    s.plugin.stop();
});
