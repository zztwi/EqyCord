# EqyCord development build

EqyCord is an independent, unofficial Discord client modification based on [Vencord](https://github.com/Vendicated/Vencord). It is not affiliated with Discord or endorsed by Vencord's maintainers. Client modifications can violate [Discord's terms](https://discord.com/terms).

## What is implemented

- EqyCord settings identity across Plugins, Themes, Updater, Cloud and Backup & Restore. Internal Vencord keys and APIs remain compatible.
- Plugin cards show only By Vencord / By EqyCord / By Community. Individual original authors, source and license remain in plugin details and source headers. First-party plugin author display name is 0009cx0, as supplied by the owner; id 0 avoids inventing a Discord account ID.
- Independent Origin: All/Vencord/EqyCord/Community filter, combinable with Show All/Enabled/Disabled/Favorites/New/API/UserPlugins, search and Tags. Toggle, dependency and settings cards remain upstream implementations.
- Every one of the 418 upstream plugin files at base commit 718c867256a9d181edc7a534afb296b9bb41ab58 is retained. The regression test checks 185 upstream plugin definitions and their original author/copyright declarations. Platform-specific exclusions are unchanged: a desktop-only plugin cannot run in a browser.
- Six opt-in first-party plugins: AutoTranslate, VoiceTool (experimental Ghost), MessageSearch, RelatedMessages, AttachmentSearch and VoiceReplay. Old EqyAutoTranslate/EqyVoiceTools settings migrate to AutoTranslate/VoiceTool, including imported backups. All stay disabled by default.
- MessageSearch keeps people results in Find or Start a Conversation and adds matches from locally loaded conversations. Its button searches DM history on demand. RelatedMessages ranks cached/history messages by shared words, not AI semantics. AttachmentSearch locates files by name or extracted text; Windows reads text/images/PDFs locally.
- VoiceReplay adds a chat-bar control with 30-second, 1-, 2- and 5-minute durations. It captures PC playback only after an explicit start and consent acknowledgement, then offers playback or local Whisper transcription. It does not capture the microphone separately or provide live captions/speaker identification. Its rolling buffer is memory-only and clears on stop, voice-channel changes, logout and disconnect.
- Automatic updating is disabled in all fork builds until an EqyCord release channel is validated. The Updater page explains how to rebuild from source. It will not download a Vencord release over this fork, including after importing autoUpdate=true from a backup.

## AutoTranslate

1. Enable AutoTranslate; its Translate dependency is enabled through the upstream plugin manager. MessageEventsAPI is inferred by the upstream hook system.
2. Configure the provider in the original Translate plugin. Keep Translate > Auto Translate off. Conflicting modes cancel the send, regardless of listener registration order.
3. Select English, Italian, Spanish, French, German, Portuguese or Japanese in AutoTranslate, then opt in to Translate outgoing text.
4. Send a text draft. Original and translated text appear in an obligatory confirmation dialog, even if the translation is identical. Approve to send, or cancel/close to cancel the send.
5. Provider failure, empty output, a 20-second translation timeout, modal failure, a changed draft or disabling/stopping the plugin cancels the pending send. Disabling/stopping closes pending previews. A timed-out provider request may finish later, but its result is ignored.

The provider receives text before the local preview; cancellation does not undo that disclosure. Google is used on web. Desktop also retains upstream DeepL/Kagi with their original credential settings and fallback behavior. English/Portuguese codes are mapped for DeepL. A live Google request with a generic test string passed. DeepL/Kagi integration, live Discord modal behavior, attachments, mentions, server limits, other text-transforming plugins and two-account sending still require runtime validation. Other plugins can transform text after this hook: the preview approves this plugin's output, not a guarantee against every later transformation.

## Ghost (VoiceTool, experimental)

Enable VoiceTool, accept the restart prompt, then join a voice channel. One ghost button appears after the headset control and before Settings in the account panel. There is no arrow or extra menu. Click to request Ghost; click again to restore the current normal voice flags. Actual microphone and headset controls remain native Discord controls. Ghost does not automatically unmute or undeafen local audio.

The outgoing gateway voice-state copy reports selfMute=true and selfDeaf=true while Ghost is requested; media-engine state and server permissions are unchanged. The account-panel mute/headset icons display the reported flags after a matching current-user/current-session server acknowledgement. The Ghost tooltip reports actual local microphone/audio state. Pending requests time out after five seconds. Disconnects, channel/socket changes, logout and plugin stop clear Ghost; stop and normal deactivation attempt restoration using the latest local flags. Ghost is never saved as active in settings.

This is a requested experimental client modification, not certified hidden-audio behavior. The patches were checked against Discord Canary's public web.460ec5f2eb74e503.js on 9 October 2026. Mocked lifecycle/gateway tests verify that outgoing flags and local state are separated; they cannot prove how the current voice server transports audio. [Discord's gateway documentation](https://docs.discord.com/developers/events/gateway-events#update-voice-state) documents mute/deaf flags for applications, not compatibility certification for modified desktop clients.

Before claiming success, use two accounts in a private test channel: check both visible icons on the observer, audio reception and transmission, real native mute/deafen, Ghost off, channel change, reconnect and server mute/deafen. If the server prevents audio, stop the test; no permission bypass is implemented. Do not label this feature working until that test passes.

## Message and attachment search

Typing two or more characters in Find or Start a Conversation leaves Discord's people list intact and shows matches from conversations already loaded locally. The history button searches accessible DMs on demand; selecting a channel scopes the search, including server channels. Each pass retrieves at most 25 messages per chat, reports progress/errors/indexing, and can be cancelled. Discord may rate-limit or return partial history. Search uses the current Discord client session and its REST API; EqyCord has no message-history service. Results are rechecked against current channel access when shown. The in-memory index is limited to 20,000 messages and 16 MB of text, is account-scoped, and clears at logout/disconnect/plugin shutdown.

Right-click a message for RelatedMessages. It extracts distinctive words, searches history and ranks matches by word overlap; it is not semantic or AI search. AttachmentSearch begins from a message context menu. It finds files by filename and extracted text. On Windows, click “Leggi testo” to download only a Discord CDN attachment (10 MB maximum); text documents are read locally, image OCR reads the image, and PDF OCR reads the first five pages. OCR needs an installed Windows language. Extracted text remains in the bounded memory index and is never uploaded to an AI service.

## VoiceReplay

Set the retained duration and transcription language in the plugin settings. Open Voice Replay from the chat bar, acknowledge that you have informed participants and have consent, then explicitly start it in a voice channel. On Windows desktop, Electron loopback captures PC playback, which can include other computer applications; it does not separately capture your microphone. The buffer holds short audio segments in memory, and can play or transcribe the last 30 seconds through five minutes on request. Whisper runs locally. Transcription can take time and make mistakes; there are no live subtitles or reliable speaker labels. During playback, capture pauses to avoid recording the replay itself. The buffer clears on stop, voice change, logout, disconnect and plugin shutdown. Do not capture unrelated private audio.

The optional Windows x64 CPU runtime is Whisper.cpp b5454 with the multilingual tiny model. Its pinned checksums, MIT notices and runtime metadata ship under dist/vendor/voice-replay. The package must include their notices and corresponding source.

## Restart behavior

Upstream's plugin manager applies plugins without source patches immediately. Plugins with patches, including Ghost, require a restart; the plugin page shows a restart banner and prompts when leaving. Settings marked restartNeeded also prompt. There is no blanket forced restart for every live setting.

## Backup compatibility and Cloud

Export retains the Vencord shape: { settings: { ... }, quickCss: "..." }. Only the suggested filename uses EqyCord. Plugin names, options, theme links and unknown plugin settings are retained. Invalid envelopes, invalid plugin containers and prototype-related keys are rejected before writes. If either persisted write fails, the importer attempts to restore the previous settings and CSS; storage failures during recovery can still require restoring an exported backup.

A backup contains settings, not executable plugin code. The specific JSON referenced in the previous chat was not exposed as an attachment to this session; compatibility tests use a synthetic Vencord fixture, not that private file. The old EqyAutoTranslate/EqyVoiceTools preference names migrate to their new names. Unknown plugin settings remain preserved.

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
- Whisper.cpp and the included model are MIT-licensed; release, model revision, hashes and notices ship with the runtime. OCR uses Windows APIs and installed language packs.
- Vencord Installer is a separate upstream project; its license/notices and corresponding v1.4.2 source must accompany a bundled binary. The wrapper is EqyCord GPL-3.0-or-later code.
- Browser extension icons are original Vencord assets retained with upstream credit. Extension identity/homepage and Firefox identifier distinguish this fork. Internal Vencord filenames/global names are intentional API compatibility choices.
- Provide corresponding source and the full LICENSE with compiled builds. This development branch is not a tested public release. See TESTING.md for executed checks and outstanding runtime tests.
