# EqyCord development build

EqyCord is an independent, unofficial Discord client modification based on [Vencord](https://github.com/Vendicated/Vencord). It is not affiliated with Discord or endorsed by Vencord's maintainers. Client modifications can violate [Discord's terms](https://discord.com/terms).

## What is implemented

- EqyCord settings identity across Plugins, Themes, Updater, Cloud and Backup & Restore. Internal Vencord keys and APIs remain compatible.
- Plugin cards show only By Vencord / By EqyCord / By Community. Individual original authors, source and license remain in plugin details and source headers. First-party plugin author display name is 0009cx0, as supplied by the owner; id 0 avoids inventing a Discord account ID.
- Independent Origin: All/Vencord/EqyCord/Community filter, combinable with Show All/Enabled/Disabled/Favorites/New/API/UserPlugins, search and Tags. Toggle, dependency and settings cards remain upstream implementations.
- Every one of the 418 upstream plugin files at base commit 718c867256a9d181edc7a534afb296b9bb41ab58 is retained. The regression test checks 185 upstream plugin definitions and their original author/copyright declarations. Platform-specific exclusions are unchanged: a desktop-only plugin cannot run in a browser.
- Eleven first-party plugins: TranslationPeek, DuplicateFinder, SmartPaste, AttachmentPreview, VoiceFocus, QuietMode, VoiceTool, MessageSearch, RelatedMessages, AttachmentSearch and VoiceReplay. All new plugins are opt-in. Existing Translate/AutoTranslate enablement and language preferences migrate to TranslationPeek; outgoing translation starts off. The retired Translate and AutoTranslate entries are disabled and hidden in the plugin UI; their source and original credits remain.

- MessageSearch keeps people results in Find or Start a Conversation and adds matches from locally loaded conversations. Its button searches DM history on demand. RelatedMessages ranks cached/history messages by shared words, not AI semantics. AttachmentSearch locates files by name or extracted text; Windows reads text/images/PDFs locally.
- VoiceReplay adds a voice-panel control with 30-second, 1-, 2- and 5-minute durations. It captures PC playback only after an explicit start and consent acknowledgement, then offers playback or local Whisper transcription. It does not capture the microphone separately or provide live captions/speaker identification. Its rolling buffer is memory-only and clears on stop, voice-channel changes, logout and disconnect.
- Automatic updating is disabled in all fork builds until an EqyCord release channel is validated. The Updater page explains how to rebuild from source. It will not download a Vencord release over this fork, including after importing autoUpdate=true from a backup.

## Translation Peek

Enable TranslationPeek and choose **Choose Your Language** in its settings. Incoming Translation automatically renders a plain translation below visible messages from other people. The original message stays intact. Messages detected as already in your language, your own messages and plain URL-only messages are skipped. Automatic translation is limited to messages rendered in the client, rather than a background crawl of all conversations.

The translation icon is placed before Discord's gift/GIF/sticker controls. A red slash means outgoing translation is off. Click it to open a small panel with **Translate outgoing messages** and **Send In**; right-click toggles outgoing translation directly. This control does not disable the plugin or incoming translations. When enabled, pressing Enter translates then sends without a confirmation popup. Failure, a changed account/draft/target, disabling outgoing translation or plugin shutdown cancels the send. Incoming and outgoing queues are separate so visible history does not delay sending.

Text is shared with Google Translate, using transport derived from upstream Translate. Requests time out after 15 seconds once started. Incoming requests are queued, deduplicated, bounded and cached in memory, with up to 300 cached results. Changing account, disconnecting or stopping clears the queues and cached text. Translation failures expose a Retry action. Google availability and translation accuracy are not guaranteed. DeepL/Kagi are retained in upstream source but are not exposed in this replacement plugin.

## Additional chat and voice tools

- **DuplicateFinder:** right-click a message with a link or attachment and choose Find duplicates. Searches loaded, accessible messages for the same URL or uploaded attachment reference. Tracking parameters are removed when comparing links; meaningful query parameters remain. It does not compute file hashes or prove separately uploaded files have identical contents.
- **SmartPaste:** right-click the message composer. Edit pasted text, clean whitespace, wrap code safely or attach a text file. Insert into draft and file upload prompt never automatically send. A changed chat, account or draft prevents overwriting it.
- **AttachmentPreview:** right-click a message and choose Preview attachment. Images/videos appear inline; supported text files and image/PDF OCR can be read locally through AttachmentSearch. PDF preview is extracted text from the first five pages, not a full document-layout viewer. Browser builds support image/video display; Windows is required for local extraction.
- **VoiceFocus:** use the focus icon beside voice controls or Focus on this voice in a participant menu. Other participants are reduced to the configured fraction of their original local volume; the selected participant is unchanged. New participants are included. Leaving/changing voice, losing the focused participant, disconnecting or stopping restores this plugin's changes. Manual volume overrides are preserved. It never changes other users' volume settings.
- **QuietMode:** the bell beside voice controls suppresses Discord sounds and notifications locally. It uses Discord's existing sound/notification suppression gates without changing streamer mode settings. Voice playback and microphone controls are unaffected. Leaving voice or stopping restores normal notification behavior.

The shared VoicePanelAPI adds compact controls beside the native account-panel voice buttons. VoiceReplay is placed in this panel rather than beside the connection timer; this insertion point was checked against the current public Canary asset. A restart may be needed when enabling plugins that depend on source patches.

## Ghost (VoiceTool, experimental)

Enable VoiceTool, accept the restart prompt, then join a voice channel. One ghost button appears after the headset control and before Settings in the account panel. There is no arrow or extra menu. Click to request Ghost; click again to restore the current normal voice flags. Actual microphone and headset controls remain native Discord controls. Ghost does not automatically unmute or undeafen local audio.

The outgoing gateway voice-state copy reports selfMute=true and selfDeaf=true while Ghost is requested; media-engine state and server permissions are unchanged. The account-panel mute/headset icons display the reported flags after a matching current-user/current-session server acknowledgement. The Ghost tooltip reports actual local microphone/audio state. Pending requests time out after five seconds. Disconnects, channel/socket changes, logout and plugin stop clear Ghost; stop and normal deactivation attempt restoration using the latest local flags. Ghost is never saved as active in settings.

This is a requested experimental client modification, not certified hidden-audio behavior. The patches were checked against Discord Canary's public web.460ec5f2eb74e503.js on 9 October 2026. Mocked lifecycle/gateway tests verify that outgoing flags and local state are separated; they cannot prove how the current voice server transports audio. [Discord's gateway documentation](https://docs.discord.com/developers/events/gateway-events#update-voice-state) documents mute/deaf flags for applications, not compatibility certification for modified desktop clients.

Before claiming success, use two accounts in a private test channel: check both visible icons on the observer, audio reception and transmission, real native mute/deafen, Ghost off, channel change, reconnect and server mute/deafen. If the server prevents audio, stop the test; no permission bypass is implemented. Do not label this feature working until that test passes.

## Message and attachment search

The first-party interface is in English regardless of Discord locale. Search panels use Discord's Modal component, with one Close footer action and a primary Search action. Results use plain message rows with avatars, authors, timestamps, highlighted terms and a themed right-side scrollbar. Filters collapse after searching and can be reopened. Show context fetches nearby messages only when clicked, checks current permissions/account, and does not persist them outside the memory index. Quick filters support channel, author, attachment/link type and dates; dates currently filter retrieved results rather than narrowing the remote query. Link search includes URLs and titles already present in message embeds; it does not fetch external webpages.

Typing two or more characters in Find or Start a Conversation leaves Discord's people list intact and shows matches from conversations already loaded locally. The Search action searches accessible DMs on demand; selecting a channel scopes the search, including server channels. Each pass retrieves at most 25 messages per chat, reports progress/errors/indexing, and can be cancelled. Discord may rate-limit or return partial history. Search uses the current Discord client session and its REST API; EqyCord has no message-history service. Results are rechecked against current channel access when shown. The in-memory index is limited to 20,000 messages and 16 MB of text, is account-scoped, and clears at logout/disconnect/plugin shutdown.

Right-click a message for RelatedMessages. It extracts distinctive words, searches history and ranks matches by word overlap; it is not semantic or AI search. AttachmentSearch begins from a message context menu. It finds files by filename and extracted text. On Windows, click **Read text** to download only a Discord CDN attachment (10 MB maximum); text documents are read locally, image OCR reads the image, and PDF OCR reads the first five pages. OCR needs an installed Windows language. Extracted text remains in the bounded memory index and is never uploaded to an AI service.

## VoiceReplay

Set the retained duration and transcription language in the plugin settings. Open Voice Replay from its circular-arrow icon beside the voice controls, acknowledge that you have informed participants and have consent, then explicitly start it in a voice channel. On Windows desktop, Electron loopback captures PC playback, which can include other computer applications; it does not separately capture your microphone. The buffer holds short audio segments in memory, and can play or transcribe the last 30 seconds through five minutes on request. Whisper runs locally. Transcription can take time and make mistakes; there are no live subtitles or reliable speaker labels. During playback, capture pauses to avoid recording the replay itself. The buffer clears on stop, voice change, logout, disconnect and plugin shutdown. Do not capture unrelated private audio.

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
- EqyCord contributions: provenance/filter UI, fork presentation, translation, search/context UI, chat utilities, Voice Tools, backup validation, Windows wrapper and regression tests. The collective author uses id 0 to avoid inventing a Discord account.
- Translate providers and original Translate code remain credited to their Vencord authors. Existing dependency licenses and generated LEGAL files must accompany distributions.
- Whisper.cpp and the included model are MIT-licensed; release, model revision, hashes and notices ship with the runtime. OCR uses Windows APIs and installed language packs.
- Vencord Installer is a separate upstream project; its license/notices and corresponding v1.4.2 source must accompany a bundled binary. The wrapper is EqyCord GPL-3.0-or-later code.
- Browser extension icons are original Vencord assets retained with upstream credit. Extension identity/homepage and Firefox identifier distinguish this fork. Internal Vencord filenames/global names are intentional API compatibility choices.
- Provide corresponding source and the full LICENSE with compiled builds. This development branch is not a tested public release. See TESTING.md for executed checks and outstanding runtime tests.
