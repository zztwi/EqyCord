/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import test from "node:test";

import { inspectInstall, operate, PROJECT } from "./installer.mjs";

function fixture() {
    const work = join(PROJECT, "work");
    mkdirSync(work, { recursive: true });
    const temporary = mkdtempSync(join(work, "installer-test-"));
    // Upstream would terminate a process named DiscordDevelopment.exe, never the
    // user's Stable/PTB/Canary. The wrapper also verifies that it is closed.
    const location = join(temporary, "FixtureDevelopment");
    const resources = join(location, "app-1.0.1", "resources");
    mkdirSync(resources, { recursive: true });
    writeFileSync(join(resources, "app.asar"), "fixture-original-discord-archive");
    return { location, resources, cleanup() {
        const child = relative(work, resolve(temporary));
        assert.ok(child && !child.startsWith(".."));
        rmSync(temporary, { recursive: true, force: true });
    } };
}

test("Windows preflight detects legacy layout and rejects invalid/ambiguous versions", () => {
    const f = fixture();
    try {
        assert.equal(inspectInstall(f.location, "canary").patched, false);
        assert.throws(() => inspectInstall(f.location, "unknown"), /Supported channels/);
        mkdirSync(join(f.location, "app-1.0.9", "resources"), { recursive: true });
        mkdirSync(join(f.location, "app-1.0.10", "resources"), { recursive: true });
        assert.throws(() => inspectInstall(f.location), /Ambiguous/);
    } finally { f.cleanup(); }
});

test("Windows installer refuses to overwrite an existing foreign patch", { skip: process.platform !== "win32" }, async () => {
    const f = fixture();
    try {
        writeFileSync(join(f.resources, "_app.asar"), "foreign-original");
        await assert.rejects(operate("install", f.location), /Already patched/);
        await assert.rejects(operate("uninstall", f.location), /No owned/);
    } finally { f.cleanup(); }
});

test("pinned Windows installer installs, verifies, detects tampering and restores exact original bytes on a fixture", { skip: process.platform !== "win32" }, async () => {
    const f = fixture();
    try {
        const original = readFileSync(join(f.resources, "app.asar"));
        const installed = await operate("install", f.location);
        assert.equal(installed.patched, true);
        assert.equal((await operate("verify", f.location)).verified, true);
        assert.deepEqual(readFileSync(join(f.resources, "_app.asar")), original);
        const backup = join(f.resources, "_app.asar");
        writeFileSync(backup, "tampered");
        await assert.rejects(operate("verify", f.location), /verification failed/);
        await assert.rejects(operate("uninstall", f.location), /unsafe restoration/);
        writeFileSync(backup, original);
        assert.equal((await operate("uninstall", f.location)).patched, false);
        assert.deepEqual(readFileSync(join(f.resources, "app.asar")), original);
        assert.equal(existsSync(join(f.resources, ".eqycord-install.json")), false);
        console.log("Fixture restore SHA256: " + createHash("sha256").update(original).digest("hex"));
    } finally { f.cleanup(); }
});
