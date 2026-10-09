/*
 * EqyCord, a Discord client mod based on Vencord
 * Copyright (c) 2026 EqyCord contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const PROJECT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
export const INSTALLER_VERSION = "v1.4.2";
export const INSTALLER_SHA256 = "15268aba25625797bf562187dd87ddadf42882e079c7b6192880ad3e83353ef5";
const INSTALLER_URL = `https://github.com/Vencord/Installer/releases/download/${INSTALLER_VERSION}/VencordInstallerCli.exe`;
const channels = { stable: "Discord", ptb: "DiscordPTB", canary: "DiscordCanary" };
const hash = file => createHash("sha256").update(readFileSync(file)).digest("hex");

function inside(root, path) {
    const child = relative(realpathSync(root), realpathSync(path));
    if (child.startsWith("..") || resolve(root, child) !== realpathSync(path))
        throw new Error("Target resolves outside the selected installation.");
}

export function inspectInstall(location, branch = "stable") {
    if (!Object.hasOwn(channels, branch)) throw new Error("Supported channels: stable, ptb, canary (subject to runtime compatibility).");
    const root = realpathSync(location);
    const versions = readdirSync(root, { withFileTypes: true })
        .filter(entry => entry.isDirectory() && /^app-\d+(\.\d+)+$/.test(entry.name) && existsSync(join(root, entry.name, "resources")))
        .map(entry => entry.name).sort();
    const version = versions.at(-1);
    if (!version) throw new Error("Unsupported Discord layout: expected app-<version>/resources.");
    // The pinned upstream installer selects the lexically last app directory.
    // Refuse ambiguous versions rather than patching an older installation.
    const numericLatest = [...versions].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).at(-1);
    if (numericLatest !== version) throw new Error("Ambiguous Discord versions. Remove stale versions using Discord's installer first.");
    const resources = join(root, version, "resources");
    inside(root, resources);
    const app = join(resources, "app.asar");
    const backup = join(resources, "_app.asar");
    if (!existsSync(app)) throw new Error("Unsupported or broken installation: missing app.asar.");
    inside(root, app);
    if (existsSync(backup)) inside(root, backup);
    return { root, branch, version, resources, app, backup, stateFile: join(resources, ".eqycord-install.json"), patched: existsSync(backup) };
}

export async function ensureInstaller(project = PROJECT) {
    const cache = join(project, "dist", "Installer");
    mkdirSync(cache, { recursive: true });
    const binary = join(cache, "VencordInstallerCli.exe");
    if (existsSync(binary) && hash(binary) === INSTALLER_SHA256) return binary;
    const response = await fetch(INSTALLER_URL, { signal: AbortSignal.timeout(60000) });
    if (!response.ok) throw new Error("Installer download failed: " + response.status);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (createHash("sha256").update(bytes).digest("hex") !== INSTALLER_SHA256)
        throw new Error("Installer checksum mismatch; refusing to execute.");
    const temporary = binary + ".download";
    writeFileSync(temporary, bytes);
    renameSync(temporary, binary);
    return binary;
}

function assertClosed(root) {
    const name = basename(root).toLowerCase();
    const image = name.endsWith("development") ? "DiscordDevelopment.exe"
        : name.endsWith("canary") ? "DiscordCanary.exe" : name.endsWith("ptb") ? "DiscordPTB.exe" : "Discord.exe";
    const result = spawnSync("tasklist.exe", ["/fi", `IMAGENAME eq ${image}`, "/fo", "csv", "/nh"], { encoding: "utf8", windowsHide: true });
    if (result.status !== 0) throw new Error("Could not verify that Discord is closed.");
    if (result.stdout.toLowerCase().includes('"' + image.toLowerCase() + '"'))
        throw new Error(`Close ${image} before installing or restoring. EqyCord will not terminate it.`);
}

export async function operate(action, location, branch = "stable", project = PROJECT) {
    if (process.platform !== "win32") throw new Error("This wrapper supports Windows only.");
    if (!["install", "uninstall", "verify"].includes(action)) throw new Error("Use install, uninstall, verify or status.");
    const plan = inspectInstall(location, branch);
    const patcher = join(realpathSync(project), "dist", "patcher.js");
    let state;
    if (existsSync(plan.stateFile)) {
        inside(plan.root, plan.stateFile);
        state = JSON.parse(readFileSync(plan.stateFile, "utf8"));
        if (state.project !== realpathSync(project) || state.version !== plan.version)
            throw new Error("This installation belongs to a different checkout. Use its uninstaller.");
    }
    if (action === "verify") {
        if (!state || !plan.patched || hash(plan.backup) !== state.originalHash || hash(plan.app) !== state.patchedHash)
            throw new Error("EqyCord patch/backup verification failed.");
        for (const [file, digest] of Object.entries(state.buildHashes ?? {})) {
            if (basename(file) !== file || hash(join(project, "dist", file)) !== digest)
                throw new Error("EqyCord build has changed. Uninstall and install the new tested build.");
        }
        return { ...plan, verified: true };
    }
    if (action === "install" && (state || plan.patched))
        throw new Error("Already patched. Uninstall the existing mod before installing EqyCord.");
    if (action === "uninstall" && (!state || !plan.patched))
        throw new Error("No owned EqyCord patch to restore; refusing to alter another mod.");
    if (action === "uninstall" && (hash(plan.backup) !== state.originalHash || hash(plan.app) !== state.patchedHash))
        throw new Error("Patch or original backup changed; refusing unsafe restoration.");

    const buildHashes = {};
    if (action === "install") {
        for (const file of ["patcher.js", "preload.js", "renderer.js", "renderer.css"]) {
            const path = join(project, "dist", file);
            if (!existsSync(path)) throw new Error("Build missing " + file + ". Run pnpm build first.");
            buildHashes[file] = hash(path);
        }
    }
    assertClosed(plan.root);
    const originalHash = action === "install" ? hash(plan.app) : state.originalHash;
    const binary = await ensureInstaller(project);
    const run = operation => spawnSync(binary, ["--" + operation, "--location", plan.root], {
        encoding: "utf8", windowsHide: true, timeout: 120000,
        env: { ...process.env, VENCORD_USER_DATA_DIR: realpathSync(project), VENCORD_DEV_INSTALL: "1" }
    });
    try {
        const result = run(action);
        if (result.status !== 0) throw new Error("Vencord installer failed: " + (result.error?.message ?? result.stderr ?? result.stdout));
        if (action === "install") {
            if (!existsSync(plan.backup) || hash(plan.backup) !== originalHash || !readFileSync(plan.app).includes(Buffer.from(JSON.stringify(patcher))))
                throw new Error("Installation verification failed; retain _app.asar for recovery.");
            writeFileSync(plan.stateFile, JSON.stringify({
                project: realpathSync(project), version: plan.version, installer: INSTALLER_VERSION,
                originalHash, patchedHash: hash(plan.app), buildHashes
            }, null, 2));
        } else {
            if (existsSync(plan.backup) || hash(plan.app) !== originalHash)
                throw new Error("Restoration verification failed; retain files for recovery.");
            unlinkSync(plan.stateFile);
        }
    } catch (error) {
        if (action === "install" && existsSync(plan.backup) && hash(plan.backup) === originalHash) {
            // Only undo our own freshly created loader, never a foreign patch.
            if (existsSync(plan.app) && readFileSync(plan.app).includes(Buffer.from(JSON.stringify(patcher)))) {
                const rollback = run("uninstall");
                if (rollback.status === 0 && !existsSync(plan.backup) && hash(plan.app) === originalHash) {
                    if (existsSync(plan.stateFile)) unlinkSync(plan.stateFile);
                    throw new Error(error.message + " Original Discord files restored.");
                }
            }
        }
        throw error;
    }
    return { ...inspectInstall(location, branch), verified: true };
}

async function main() {
    const [action = "status", ...args] = process.argv.slice(2);
    const value = flag => { const index = args.indexOf(flag); return index < 0 ? undefined : args[index + 1]; };
    const branch = value("--branch") ?? "stable";
    if (!Object.hasOwn(channels, branch)) throw new Error("Unknown channel: " + branch);
    if (!process.env.LOCALAPPDATA && !value("--location")) throw new Error("LOCALAPPDATA unavailable; specify --location.");
    const location = value("--location") ?? join(process.env.LOCALAPPDATA, channels[branch]);
    const result = action === "status" ? inspectInstall(location, branch) : await operate(action, location, branch);
    console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main().catch(error => { console.error(error.message); process.exitCode = 1; });
}
