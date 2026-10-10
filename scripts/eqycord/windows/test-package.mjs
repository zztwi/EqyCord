/* EqyCord contributors, 2026. SPDX-License-Identifier: GPL-3.0-or-later */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const repository = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const setup = resolve(process.argv[2] ?? "");
assert.ok(setup.endsWith(".exe") && existsSync(setup), "Pass the built setup executable.");
assert.equal(spawnSync(setup, ["--ui-smoke"], { windowsHide: true, timeout: 15000 }).status, 0, "Setup UI must start and close without changing Discord.");
console.log("PASS: setup window startup and clean exit (no Discord mutation).");
const testRoot = mkdtempSync(join(repository, "work", "setup-package-test-"));
const extracted = join(testRoot, "extracted");
const run = () => spawnSync(setup, ["--extract-only", extracted], { windowsHide: true, timeout: 120000 });
assert.equal(run().status, 0, "Package extraction must succeed.");
assert.equal(run().status, 0, "Extraction must be idempotent.");
const info = JSON.parse(readFileSync(join(extracted, "BUILD-INFO.json"), "utf8").replace(/^\uFEFF/, ""));
assert.equal(info.NodeVersion, "22.14.0");
const manifest = JSON.parse(readFileSync(join(dirname(setup), "payload", "manifest.json"), "utf8").replace(/^\uFEFF/, ""));
for (const [name, digest] of Object.entries(manifest.Files)) {
    assert.equal(createHash("sha256").update(readFileSync(join(extracted, name))).digest("hex"), digest, name);
    assert.doesNotMatch(name, /settings-before|settings\.json$|quickCss\.css$|last-restart/, "No personal data in package");
}
console.log("PASS: self-contained extraction, exact payload hashes, repeat extraction, and no personal settings.");

const fixture = join(testRoot, "FixtureDevelopment");
const resources = join(fixture, "app-1.0.1", "resources");
mkdirSync(resources, { recursive: true });
writeFileSync(join(resources, "app.asar"), "original-fixture-discord-archive");
const installerModule = pathToFileURL(join(extracted, "scripts", "eqycord", "installer.mjs")).href;
const script = `
    import assert from 'node:assert/strict';
    import { readFileSync, existsSync } from 'node:fs';
    import { operate } from ${JSON.stringify(installerModule)};
    const root = ${JSON.stringify(fixture)};
    const project = ${JSON.stringify(extracted)};
    const app = ${JSON.stringify(join(resources, "app.asar"))};
    const original = readFileSync(app);
    await operate('install', root, 'stable', project);
    await operate('verify', root, 'stable', project);
    await operate('uninstall', root, 'stable', project);
    assert.deepEqual(readFileSync(app), original);
    assert.equal(existsSync(${JSON.stringify(join(resources, "_app.asar"))}), false);
    assert.equal(existsSync(${JSON.stringify(join(resources, ".eqycord-install.json"))}), false);
    console.log('PASS: bundled Node runtime installed, verified, and restored exact original bytes on a fixture.');
`;
const fixtureResult = spawnSync(join(extracted, "runtime", "node.exe"), ["--input-type=module", "-e", script], { windowsHide: true, encoding: "utf8", timeout: 120000 });
assert.equal(fixtureResult.status, 0, fixtureResult.stderr || fixtureResult.error?.message);
console.log(fixtureResult.stdout.trim());

const altered = join(extracted, "BADGES.md");
writeFileSync(altered, "changed-by-fixture");
assert.equal(run().status, 1, "Changed installed package files must be refused.");
assert.equal(readFileSync(altered, "utf8"), "changed-by-fixture", "Changed files must not be overwritten.");
console.log("PASS: changed package files refused without overwrite.");
console.log("Fixture artifacts retained at " + testRoot);
