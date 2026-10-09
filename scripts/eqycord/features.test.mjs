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

async function autoSetup(provider = async () => ({ text: "ciao" })) {
    let modal, options, closed = 0;
    const providerSettings = { store: { autoTranslate: false, service: "google" } };
    const plugin = (await load("src/plugins/eqyAutoTranslate/index.tsx", {
        "@api/Settings": { definePluginSettings },
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
    assert.deepEqual(parseSettingsBackup(JSON.stringify(fixture)), fixture);
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
    assert.deepEqual(exported.settings.plugins, JSON.parse(data).settings.plugins);
    assert.equal(exported.quickCss, JSON.parse(data).quickCss);
    assert.deepEqual(PlainSettings, stored);
});

test("Voice Tools invokes normal Discord actions and does nothing while disconnected or stopped", async () => {
    let connected = true, muted = false, deafened = false, calls = 0;
    const plugin = (await load("src/plugins/eqyVoiceTools/index.tsx", {
        "@api/Settings": { definePluginSettings }, "@utils/types": definePlugin,
        "@components/Button": { Button: "Button" }, "@components/Flex": { Flex: "Flex" }, "@components/Paragraph": { Paragraph: "Paragraph" },
        "@webpack": { findByPropsLazy: () => ({ toggleSelfMute() { calls++; muted = !muted; }, toggleSelfDeaf() { calls++; deafened = !deafened; } }) },
        "@webpack/common": { MediaEngineStore: { isSelfMute: () => muted, isSelfDeaf: () => deafened }, SelectedChannelStore: { getVoiceChannelId: () => connected ? "voice" : null }, useStateFromStores: (_stores, read) => read(), showToast() {} }
    })).default;
    plugin.start();
    const controls = plugin.settings.def.controls.component;
    const buttons = () => controls().props.children[2].props.children;
    buttons()[0].props.onClick();
    buttons()[1].props.onClick();
    assert.equal(muted, true);
    assert.equal(deafened, true);
    assert.equal(calls, 2);
    connected = false;
    assert.equal(buttons()[0].props.disabled, true);
    buttons()[0].props.onClick();
    connected = true;
    plugin.stop();
    buttons()[1].props.onClick();
    assert.equal(calls, 2);
});
