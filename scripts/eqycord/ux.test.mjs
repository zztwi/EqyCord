/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { build } from "esbuild";

async function load(entry, mocks = {}, globals = {}) {
    const { outputFiles } = await build({ entryPoints: [entry], bundle: true, write: false, format: "cjs", platform: "node", jsxFactory: "React.createElement", loader: { ".css": "empty" }, logLevel: "silent", external: ["@api/*", "@utils/*", "@plugins/*", "@webpack*", "@components/*"] });
    const module = { exports: {} };
    new Function("module", "exports", "require", ...Object.keys(globals), outputFiles[0].text)(module, module.exports, name => { assert.ok(Object.hasOwn(mocks, name), "Unmocked: " + name); return mocks[name]; }, ...Object.values(globals));
    return module.exports;
}

test("link search includes embed titles; filters and duplicates preserve meaningful URL parameters", async () => {
    const { MessageIndex, linkKey } = await load("src/shared/messageSearch.ts");
    const index = new MessageIndex();
    const message = (id, content, timestamp, attachments = [], links = [], linkTitles = []) => ({ id, content, timestamp, attachments, links, linkTitles, channelId: "chat", authorId: "a", author: "A" });
    index.upsert(message("1", "Watch this", 100, [], ["https://example.com/watch?v=1&utm_source=discord"], ["A perfect sunset"]));
    index.upsert(message("2", "Again", 200, [], ["https://example.com/watch?v=1"], []));
    index.upsert(message("3", "Another video", 300, [], ["https://example.com/watch?v=2"], []));
    index.upsert(message("4", "Photo", 400, [{ id: "f", filename: "photo.png", url: "https://cdn.discordapp.com/attachments/1/2/photo.png?ex=old" }]));
    index.upsert(message("5", "Same photo", 500, [{ id: "g", filename: "photo.png", url: "https://media.discordapp.net/attachments/1/2/photo.png?ex=new" }]));
    assert.equal(index.search({ query: "sunset", kind: "links" })[0].id, "1");
    assert.deepEqual(index.search({ query: "", mode: "duplicates", duplicateOf: "1" }).map(m => m.id), ["2"]);
    assert.deepEqual(index.search({ query: "", mode: "duplicates", duplicateOf: "4" }).map(m => m.id), ["5"]);
    assert.deepEqual(index.search({ query: "photo", kind: "images", after: 450 }).map(m => m.id), ["5"]);
    assert.equal(index.search({ query: "photo", kind: "videos" }).length, 0);
    assert.equal(index.search({ query: "photo", before: 450 }).length, 1);
    assert.notEqual(linkKey("https://example.com/watch?v=1"), linkKey("https://example.com/watch?v=2"));
    assert.equal(linkKey("file:///C:/secret"), "");
    assert.equal(index.context("1", () => false).length, 0);
    assert.ok(index.context("3", () => true).some(m => m.id === "3"));
});

test("translation queue deduplicates, serializes, clears cached private text and rejects stale work", async () => {
    const { TranslationQueue } = await load("src/shared/translationQueue.ts");
    let calls = 0;
    const queue = new TranslationQueue(async text => { calls++; return { text: text.toUpperCase(), source: "en" }; });
    const [a, b] = await Promise.all([queue.translate("hello", "it"), queue.translate("hello", "it")]);
    assert.equal(calls, 1); assert.deepEqual(a, b);
    await queue.translate("hello", "it"); assert.equal(calls, 1);
    queue.clear(); await queue.translate("hello", "it"); assert.equal(calls, 2);
    let release;
    const pending = new TranslationQueue(() => new Promise(resolve => { release = resolve; }));
    const request = pending.translate("private", "it");
    await new Promise(resolve => setImmediate(resolve)); pending.clear(); release({ text: "secret", source: "en" });
    await assert.rejects(request, /cancelled/);
});

async function translationSetup(fetch) {
    let current = "me";
    const stored = { Translate: { enabled: true, receivedOutput: "it", sentOutput: "en" }, AutoTranslate: { enabled: true } };
    const define = plugin => plugin;
    const settings = def => ({ def, store: Object.fromEntries(Object.entries(def).map(([key, option]) => [key, option.default ?? option.options?.find(o => o.default)?.value])) });
    const plugin = (await load("src/plugins/translationPeek/index.tsx", {
        "@components/messageSearch.css": {}, "@api/ChatButtons": {}, "@api/Settings": { SettingsStore: { plain: { plugins: stored }, markAsChanged() {} }, definePluginSettings: settings },
        "@plugins/translate/languages": { GoogleLanguages: { auto: "Detect language", en: "English", it: "Italian" } }, "@plugins/translate/TranslateIcon": {},
        "@utils/types": Object.assign(define, { OptionType: { BOOLEAN: 1, SELECT: 2 } }), "@webpack/common": { UserStore: { getCurrentUser: () => ({ id: current }) }, showToast() {} }
    }, { fetch })).default;
    plugin.start(); plugin.settings.store.outgoing = true;
    return { plugin, stored, changeAccount() { current = "other"; } };
}

test("Translation Peek migration replaces both legacy toggles and translates outgoing text only when selected", async () => {
    const setup = await translationSetup(async () => ({ ok: true, json: async () => ({ translation: "hello", sourceLanguage: "it" }) }));
    assert.equal(setup.stored.Translate.enabled, false); assert.equal(setup.stored.AutoTranslate.enabled, false);
    assert.equal(setup.stored.TranslationPeek.language, "it"); assert.equal(setup.stored.TranslationPeek.outgoing, false);
    const message = { content: "ciao" }; await setup.plugin.onBeforeMessageSend("chat", message); assert.equal(message.content, "hello");
    setup.plugin.settings.store.outgoing = false; const untouched = { content: "ciao" }; await setup.plugin.onBeforeMessageSend("chat", untouched); assert.equal(untouched.content, "ciao"); setup.plugin.stop();
});

test("Translation Peek cancels failed sends and stale account results without changing the draft", async () => {
    const failed = await translationSetup(async () => ({ ok: false, status: 429 }));
    const message = { content: "ciao" }; assert.deepEqual(await failed.plugin.onBeforeMessageSend("chat", message), { cancel: true }); assert.equal(message.content, "ciao"); failed.plugin.stop();
    let release;
    const setup = await translationSetup(() => new Promise(resolve => { release = resolve; }));
    const draft = { content: "private" }; const request = setup.plugin.onBeforeMessageSend("chat", draft);
    await new Promise(resolve => setImmediate(resolve)); setup.changeAccount(); release({ ok: true, json: async () => ({ translation: "translated", sourceLanguage: "en" }) });
    assert.deepEqual(await request, { cancel: true }); assert.equal(draft.content, "private"); setup.plugin.stop();
});

test("Voice Focus restores only its own volume changes and preserves user overrides", async () => {
    const { FocusVolumes } = await load("src/shared/focusVolumes.ts");
    const values = { speaker: 120, other: 80, newcomer: 100 };
    const focus = new FocusVolumes(id => values[id], (id, volume) => { values[id] = volume; });
    focus.apply(["speaker", "other"], "speaker", .25); assert.equal(values.speaker, 120); assert.equal(values.other, 20);
    focus.apply(["speaker", "other", "newcomer"], "speaker", .25); assert.equal(values.other, 20); assert.equal(values.newcomer, 25);
    values.other = 60; focus.restore(); assert.equal(values.other, 60); assert.equal(values.newcomer, 100);
});

test("Smart Paste cleans text without destroying indentation and safely fences embedded backticks", async () => {
    const { cleanPaste, codePaste } = await load("src/shared/smartPaste.ts");
    assert.equal(cleanPaste("  hello  \r\n    code  \n\n\n\nend\u200b"), "hello\n    code\n\n\nend");
    assert.equal(codePaste("a```b", "js\n@everyone"), "````jseveryone\na```b\n````");
    assert.ok(codePaste("`x".repeat(50000), "js").startsWith("```js"));
});

test("voice panel and Quiet Mode patches match the installed Canary reference asset", { skip: !process.env.EQYCORD_DISCORD_ASSETS }, () => {
    const source = readFileSync(process.env.EQYCORD_DISCORD_ASSETS + "/web.460ec5f2eb74e503.js", "utf8");
    assert.equal([...source.matchAll(/(dismissTooltips:[A-Za-z_$][\w$]*\}\),)(?=null!=[A-Za-z_$][\w$]*\.[A-Za-z_$][\w$]*\?)/g)].length, 1);
    for (const getter of ["Sounds", "Notifications"]) assert.equal([...source.matchAll(new RegExp(`get disable${getter}\\(\\)\\{return `, "g"))].length, 1);
    assert.ok(source.includes("setLocalVolume(e,t)"));
});
