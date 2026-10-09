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

async function load(entry) {
    const { outputFiles } = await build({ entryPoints: [entry], bundle: true, write: false, format: "cjs", platform: "node", logLevel: "silent" });
    const module = { exports: {} };
    new Function("module", "exports", outputFiles[0].text)(module, module.exports);
    return module.exports;
}

test("Equicord imports use the EqyCord origin and the separate origin is gone", async () => {
    const { getPluginOrigin, matchesPluginOrigin } = await load("src/shared/eqyPluginOrigins.ts");
    assert.equal(getPluginOrigin("Translate", false, "translate"), "Vencord");
    assert.equal(getPluginOrigin("Animalese", false, "src/equicordplugins/animalese"), "EqyCord");
    assert.equal(matchesPluginOrigin("Animalese", false, "EqyCord", "src/equicordplugins/animalese"), true);
    assert.equal(getPluginOrigin("LocalPlugin", true), "Community");

    const settings = readFileSync("src/components/settings/tabs/plugins/index.tsx", "utf8");
    assert.match(settings, /\["All", "Vencord", "EqyCord", "Community"\]/);
    assert.doesNotMatch(settings, /"Equicord"/);
});

test("all imported Equicord plugins are registered without duplicate Vencord names", () => {
    const plugins = JSON.parse(readFileSync("dist/plugins.json", "utf8"));
    const imported = plugins.filter(plugin => plugin.filePath.startsWith("src/equicordplugins/"));
    const upstream = plugins.filter(plugin => !plugin.filePath.startsWith("src/equicordplugins/"));
    assert.equal(imported.length, 200);

    const upstreamNames = new Set(upstream.map(plugin => plugin.name));
    assert.deepEqual(imported.filter(plugin => upstreamNames.has(plugin.name)).map(plugin => plugin.name), []);
    assert.equal(plugins.some(plugin => plugin.filePath.startsWith("eqyAutoTranslate") || plugin.filePath.startsWith("eqyVoiceTools")), false);
});

test("Equicord API plugins are included by the runtime build", () => {
    const source = readFileSync("scripts/build/common.mjs", "utf8");
    assert.match(source, /equicordplugins\/_api/);
});

test("Vencord-compatible backup parsing preserves unknown plugin settings and rejects unsafe data", async () => {
    const { parseSettingsBackup } = await load("src/shared/eqySettingsBackup.ts");
    const backup = { settings: { plugins: { Animalese: { enabled: true, volume: 4 }, UnknownPlugin: { custom: "keep" } } }, quickCss: ".x { color: red; }", extra: true };
    assert.deepEqual(parseSettingsBackup(JSON.stringify(backup)), { settings: backup.settings, quickCss: backup.quickCss });
    assert.throws(() => parseSettingsBackup("{"));
    assert.throws(() => parseSettingsBackup(JSON.stringify({ settings: { plugins: [] }, quickCss: "" })));
    assert.throws(() => parseSettingsBackup('{"settings":{"plugins":{"__proto__":{"polluted":true}}},"quickCss":""}'), /Unsafe settings key/);
});

test("all original Vencord plugin sources and copyright notices remain intact", () => {
    const base = "718c867256a9d181edc7a534afb296b9bb41ab58";
    const paths = execFileSync("git", ["ls-tree", "-r", "--name-only", base, "src/plugins"], { encoding: "utf8" }).trim().split("\n");
    for (const path of paths) {
        if (!/\.(ts|tsx|css)$/.test(path)) continue;
        const current = readFileSync(path, "utf8");
        const original = execFileSync("git", ["show", `${base}:${path}`], { encoding: "utf8" });
        const copyright = original.match(/\* Copyright[^\r\n]*/)?.[0];
        if (copyright) assert.ok(current.includes(copyright), path + " copyright changed");
    }
});
