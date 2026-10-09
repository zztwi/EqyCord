# Validation record — 9 October 2026

Environment: Windows, Node.js 24.19.0, pnpm 11.25.0. package.json retains upstream's pnpm 11.9.0 declaration; the local runtime supplied 11.25.0. Frozen-lockfile install succeeded without changing the lockfile.

## Current UI and feature checks

- Seven added tests cover link/duplicate matching, date/type filters, translation queue deduplication and cancellation, real TranslationPeek send hooks with mocked Discord/fetch boundaries, legacy migration, account changes, VoiceFocus restore/manual overrides, SmartPaste formatting and static voice/QuietMode patch matches.
- Live Google transport smoke: generic English "Hello, how are you?" detected as en and translated to Italian; "Come stai?" detected as it and retained. No private message was used or sent in Discord.
- Browser UI fixture renders the real EqyCord SearchDialog and CSS using React, with mocked Discord Modal/message-service boundaries. Filter/result, outgoing translation and SmartPaste screens were inspected; one Close footer button, scrollable result list, no horizontal overflow and no browser errors. This does not certify the native Discord Modal layout.
- First-party visible UI, settings, notices, language labels and native extraction errors are English. Discord itself and unmodified upstream plugins retain their own locale/content.

## Executed checks

- pnpm install --frozen-lockfile: passed.
- Initial pnpm test: failed on EqyAutoTranslate's possibly undefined language. A later run exposed the initial PR's template-quote lint error. Both were fixed.
- pnpm test after the corrections: passed (desktop standalone builds, TypeScript, ESLint, CSS lint, plugin metadata generation and EqyCord tests).
- pnpm build: passed (regular Windows desktop build). Installer fixture tests also passed again against this desktop build.
- pnpm buildWeb: passed; browser bundle, userscript, Chromium and Firefox extension packages generated.
- `pnpm testEqyCord` with `EQYCORD_NATIVE_SMOKE=1` and the public Canary fixture: 39 tests passed, zero failures/skips on Windows. This includes DM-history API mocks, account/permission handling, QuickSwitcher patch parsing, Ghost lifecycle, local PNG and six-page PDF OCR.
- `pnpm install --frozen-lockfile`: passed after adding the new plugins; lockfile unchanged.
- Windows OCR smoke test generated a local PNG (“EqyCord Search test 123”) and a six-page PDF. OCR found the image text and PDF pages 1–5, leaving out page 6 as configured.
- Search patch: one unique QuickSwitcher insertion point in the public Canary Webpack module, patched module parses. Search and pagination tests use a mock REST response; no authenticated Discord DM search was made.
- Live Google provider smoke test using the actual upstream Translate utility and a generic test string: Hello, world! -> Italian Ciao mondo! passed. Discord/native boundaries were mocked; this does not validate a live send or DeepL/Kagi.
- Automated plugin preservation: all 418 files and 185 original definitions retained; original copyright and authors checked against upstream base 718c867256a9d181edc7a534afb296b9bb41ab58.
- Actual plugin hooks executed with mocked Discord boundaries: approval, cancel, close, modal-manager close callback, plugin stop, changed draft, provider failure, conflicting translators, Ghost outgoing flags, current-user/current-session acknowledgement, native-state preservation, cancellation, channel/connection change, stop, timeout and failed socket.
- Ghost account-panel and gateway patches checked against the public Canary web.460ec5f2eb74e503.js fetched on 9 October 2026: each match is unique; patched factories parse as JavaScript. This is a static compatibility check, not a live voice test. Repeat with EQYCORD_DISCORD_ASSETS pointing to locally extracted gateway.txt and panel.txt; default CI uses authored synthetic fixtures and does not fetch Discord code.
- Translation workflow: identical output still previews; timeout, empty output, rejected modal, stale approval, DeepL English/Portuguese mapping tested.
- Real offline import/export functions executed with mocked storage: unknown-plugin round trip and restoration after a failing CSS write passed. The previous user's JSON was unavailable; a synthetic fixture was used.
- Pinned VencordInstallerCli.exe v1.4.2 executed on a synthetic legacy Windows installation. Install, loader verification, backup hash, foreign-mod refusal, tamper refusal and uninstall/byte-for-byte restoration passed. Original fixture SHA256: 64b08e60c59ba183a22c53b4a5b240ead62783370be4bc5c8ae03afc1aa59d98. The fixture is not a running Discord installation.
- Installed Stable app-1.0.9261: recognized, already patched by an existing mod, left unchanged. Canary app-1.0.1217: EqyCord f32ee8fd installed and loader/build hashes verified during the user-requested live trial. PTB is not installed here.
- User reported that AutoTranslate's confirmation preview works in the running client after enabling translateOnSend and disabling upstream autoTranslate. No observer account was used; this is user-reported UI validation, not a full two-account send test. User subsequently preferred immediate translation.

## Installer follow-up

The user confirmed continuing with a Vencord-style inject after the ToS discussion. No Discord credentials or token are required. Added an interactive Windows launcher and strict argument validation. Added a simulated Discord update test: restore the owned old archive while preserving the newer archive. The f32ee8fd package was then installed on Canary with the user's authorization; Stable was not patched by this session.

## Required before a public release

- Real Discord UI: sidebar panels, toggle/settings cards, responsive origin/status/tag combinations and author/source/license links. Check QuickSwitcher results, context menus and OCR controls in live Canary.
- Authenticated Discord history search: verify the DM history route against the current account on Canary. Mocks validate URL, pagination, abort and rate-limit behavior; public Discord search docs describe guild search.
- TranslationPeek in two accounts: incoming inline display, same-language skipping, outgoing toggle/target, provider success/failure, timeout, plugin disable, attachments/mentions, limits, other transforming plugins and draft preservation. Legacy preview tests remain as regression coverage for the retired source.
- Ghost in two accounts: observer's mute/deaf icons, audio reception/transmission, real native mute/deafen, Ghost off, channel change, reconnect and server restrictions. Hidden-audio behavior is not certified by the mocked/static tests.
- Real clean Windows install/launch/uninstall and Discord update/repair on each available Stable/PTB/Canary channel; unsupported layouts must fail clearly.
- Actual private Vencord backup, theme files and cloud integration with an explicitly authorized account/backend.
- Remote GitHub Actions status must be checked separately; local success does not imply that remote CI ran.

The agent sent no Discord messages, made no voice call and connected no cloud account. The agent installed the earlier EqyCord build on Canary; the user tested its translator UI. Ghost audio compatibility remains unverified. The PR remains draft; no merge is performed. UI slogans were removed, card bylines shortened and first-party author display names changed to 0009cx0; original GPL notices/authorship remain intact.


## Voice panel cleanup

VoiceReplay and VoicePanelAPI are removed. Ghost is the only added account-panel button. VoiceFocus remains in participant menus/settings; QuietMode remains in settings and voice participant menus. Live layout and audio behavior still need user verification. The previous installed build is a42f66bd; consult latest-installation.json for the actual installation state.


Plugin cards and settings use the upstream Vencord components. Custom dialogs use its Modal, Button/TextButton, FormSwitch, headings and Discord TextInput/TextArea/SearchableSelect controls; only result layout and feature content are custom.

## Manual checks for this build

Open Settings > Plugins > Origin: EqyCord. Enable the plugin being tested and restart if prompted.

| Plugin | Action | Expected result |
| --- | --- | --- |
| TranslationPeek | Choose Your Language: Italian; display an English message from someone else. Use the composer translation icon to select Send In: English and enable outgoing translation. | Incoming translation appears below the original. Sending Italian produces English; turning outgoing off preserves the next Italian message. |
| MessageSearch | Type a known word in Find or Start a Conversation; choose Search. Try In, From, Has and date filters. | Readable, scrolling results. Show context expands surrounding messages; Jump to message opens the original. |
| RelatedMessages | Right-click a message > Find related messages. | Messages sharing keywords are listed; results and filters remain readable. |
| AttachmentSearch | Right-click a message > Search attachments; search a filename, then use Read text on a test text/image/PDF file. | Filename matches work; extracted text can be searched on Windows. PDFs are limited to five pages. |
| DuplicateFinder | Share the same test link twice; right-click one > Find duplicates. | The other copy appears. Matching links do not prove identical contents of separate file uploads. |
| SmartPaste | Right-click the composer > Smart Paste; try Clean whitespace or Format as code, then Insert into draft. | Text is formatted and added to the draft without sending. |
| AttachmentPreview | Right-click a message with an attachment > Preview attachment; choose a file. | Image/video preview opens; Read text and Find in file work for supported files on Windows. |
| VoiceFocus | In voice with two other participants, right-click one > Focus on this voice. Then Stop Voice Focus or Open Voice Focus > Restore volumes in settings. | Other voices become quieter locally; restoration preserves any manual volume changes. |
| QuietMode | Enable the plugin, open its settings and turn Quiet Mode on, or use a voice participant menu. Trigger a test notification, then turn it off. | Notification sounds/notifications are suppressed while active. Voice audio is unchanged; leaving voice resets it. |
| VoiceTool | In a test call, toggle Ghost and then turn it off; check with a second account. | Only one added account-panel button is present. Check both clients' icons and actual audio separately; hidden-audio behavior remains unverified. |

VoiceReplay must no longer appear in the plugin list, and no Replay/Focus/Quiet buttons should occupy the bottom account panel. Check that the native settings button is fully visible and clickable.
