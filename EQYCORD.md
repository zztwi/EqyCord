# EqyCord development build

EqyCord is an independent, unofficial Discord client modification based on [Vencord](https://github.com/Vendicated/Vencord). It is not affiliated with Discord or endorsed by Vencord's maintainers. Client modifications can violate [Discord's terms](https://discord.com/terms).

## What is implemented

- EqyCord settings identity across Plugins, Themes, Updater, Cloud and Backup & Restore. Internal Vencord keys and APIs remain compatible.
- Plugin cards show origin and original authors. Details retain the authors, source link and GPL-3.0-or-later credit for included plugins. Local userplugins are Community, with their own source/license.
- Independent Origin: All/Vencord/EqyCord/Community filter, combinable with Show All/Enabled/Disabled/Favorites/New/API/UserPlugins, search and Tags. Toggle, dependency and settings cards remain upstream implementations.
- Every one of the 418 upstream plugin files at base commit 718c867256a9d181edc7a534afb296b9bb41ab58 is retained. The regression test checks 185 upstream plugin definitions and their original author/copyright declarations. Platform-specific exclusions are unchanged: a desktop-only plugin cannot run in a browser.
- Two opt-in first-party plugins: EqyAutoTranslate and EqyVoiceTools. Neither is enabled by default.
- Automatic updating is disabled in all fork builds until an EqyCord release channel is validated. The Updater page explains how to rebuild from source. It will not download a Vencord release over this fork, including after importing autoUpdate=true from a backup.

## AutoTranslate

1. Enable EqyAutoTranslate; its Translate dependency is enabled through the upstream plugin manager. MessageEventsAPI is inferred by the upstream hook system.
2. Configure the provider in the original Translate plugin. Keep Translate > Auto Translate off. Conflicting modes cancel the send, regardless of listener registration order.
3. Select English, Italian, Spanish, French, German, Portuguese or Japanese in EqyAutoTranslate, then opt in to Translate outgoing text.
4. Send a text draft. Original and translated text appear in an obligatory confirmation dialog, even if the translation is identical. Approve to send, or cancel/close to cancel the send.
5. Provider failure, empty output, a 20-second translation timeout, modal failure, a changed draft or disabling/stopping the plugin cancels the pending send. Disabling/stopping closes pending previews. A timed-out provider request may finish later, but its result is ignored.

The provider receives text before the local preview; cancellation does not undo that disclosure. Google is used on web. Desktop also retains upstream DeepL/Kagi with their original credential settings and fallback behavior. English/Portuguese codes are mapped for DeepL. A live Google request with a generic test string passed. DeepL/Kagi integration, live Discord modal behavior, attachments, mentions, server limits, other text-transforming plugins and two-account sending still require runtime validation. Other plugins can transform text after this hook: the preview approves this plugin's output, not a guarantee against every later transformation.

## Voice Tools

Enable EqyVoiceTools and open its settings. Join a voice channel, then use Mute/Unmute and Deafen/Undeafen. The buttons call Discord's normal toggleSelfMute/toggleSelfDeaf actions and display MediaEngineStore state. They are disabled while disconnected or when this plugin is stopped. Server restrictions still apply.

This does not patch voice transport or fake mute/deafen state. No claim is made that microphone audio passes while others see you muted. Real Discord action discovery and a two-account voice call have not been tested.

## Backup compatibility and Cloud

Export retains the Vencord shape: { settings: { ... }, quickCss: "..." }. Only the suggested filename uses EqyCord. Plugin names, options, theme links and unknown plugin settings are retained. Invalid envelopes, invalid plugin containers and prototype-related keys are rejected before writes. If either persisted write fails, the importer attempts to restore the previous settings and CSS; storage failures during recovery can still require restoring an exported backup.

A backup contains settings, not executable plugin code. The specific JSON referenced in the previous chat was not exposed as an attachment to this session; compatibility tests use a clearly labeled synthetic Vencord fixture, not that private file. Renamed/removed plugins and platform restrictions are not automatically migrated.

Cloud remains the original Vencord integration and configured external backend, with its original privacy/source links. EqyCord does not operate a cloud service. No account was authorized or cloud data uploaded during testing.

## Windows installer / restore

Requires Windows and Node.js 22 or later. Double-click EqyCord-Windows.cmd to select a channel and action, or use the commands below. Keep the checkout/package at its installation path: the loader points to its dist directory. Close the chosen Discord client first. The wrapper refuses a running client and does not deliberately terminate it.

Development commands from a Git checkout:

    pnpm install --frozen-lockfile
    pnpm test
    pnpm buildWeb
    pnpm build
    pnpm installer:windows status --branch stable
    pnpm installer:windows install --branch stable
    pnpm installer:windows verify --branch stable
    pnpm installer:windows uninstall --branch stable

Use --branch ptb or --branch canary for those installations. --location accepts a custom installation root. pnpm inject / pnpm uninject use this Windows wrapper; non-Windows installation is outside this fork wrapper's validated scope. A precompiled development package can run node scripts/eqycord/installer.mjs with the same actions, without reinstalling dependencies.

The wrapper reuses the original [Vencord Installer v1.4.2](https://github.com/Vencord/Installer/tree/v1.4.2) in local-development mode: VENCORD_DEV_INSTALL=1, VENCORD_USER_DATA_DIR=<this checkout>. It checks the pinned SHA256 15268aba25625797bf562187dd87ddadf42882e079c7b6192880ad3e83353ef5 before executing that binary. Its upstream notices/license remain intact.

Preflight accepts the legacy app-<version>/resources/app.asar layout and rejects missing/ambiguous versions and paths outside the selected root. It refuses to overwrite any existing mod, hashes the original _app.asar backup, records ownership/build hashes, verifies the installed loader and refuses unsafe restoration after tampering. Uninstall restores the original archive and verifies its exact hash. A failed install attempts upstream rollback only when its own loader and unchanged original backup can be identified. Preserve _app.asar and the ownership record if recovery fails; do not delete them.

Discord updates can create a new app directory: status then shows the current version and ownedVersions lists older EqyCord patches. To restore an older version, use uninstall --app-version app-<version> with the same --branch/--location. verify and status also accept --app-version. Uninstall restores only the chosen owned archive using verified backup hashes, without changing the newer client. Installation still uses the pinned Vencord injector and always targets the current version. Support for Stable/PTB/Canary is conditional on layout and Discord runtime compatibility, not certification for all three channels.

## Credits and distribution

- Vencord by Vendicated and contributors, with all original plugin authors and file headers retained; GPL-3.0-or-later. The original README follows the fork introduction unchanged.
- EqyCord contributions: provenance/filter UI, fork presentation, preview workflow, Voice Tools, backup validation, Windows wrapper and regression tests. The collective author uses id 0 to avoid inventing a Discord account.
- Translate providers and original Translate code remain credited to their Vencord authors. Existing dependency licenses and generated LEGAL files must accompany distributions.
- Vencord Installer is a separate upstream project; its license/notices and corresponding v1.4.2 source must accompany a bundled binary. The wrapper is EqyCord GPL-3.0-or-later code.
- Browser extension icons are original Vencord assets retained with upstream credit. Extension identity/homepage and Firefox identifier distinguish this fork. Internal Vencord filenames/global names are intentional API compatibility choices.
- Provide corresponding source and the full LICENSE with compiled builds. This development branch is not a tested public release. See TESTING.md for executed checks and outstanding runtime tests.
