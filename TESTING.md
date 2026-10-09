# Validation record — 9 October 2026

Environment: Windows, Node.js 24.19.0, pnpm 11.25.0. package.json retains upstream's pnpm 11.9.0 declaration; the local runtime supplied 11.25.0. Frozen-lockfile install succeeded without changing the lockfile.

## Executed checks

- pnpm install --frozen-lockfile: passed.
- Initial pnpm test: failed on EqyAutoTranslate's possibly undefined language. A later run exposed the initial PR's template-quote lint error. Both were fixed.
- pnpm test after the corrections: passed (desktop standalone builds, TypeScript, ESLint, CSS lint, plugin metadata generation and EqyCord tests).
- pnpm build: passed (regular Windows desktop build). Installer fixture tests also passed again against this desktop build.
- pnpm buildWeb: passed; browser bundle, userscript, Chromium and Firefox extension packages generated.
- pnpm testEqyCord: 18 tests passed, zero failures/skips on Windows after adding upstream-preservation coverage.
- Live Google provider smoke test using the actual upstream Translate utility and a generic test string: Hello, world! -> Italian Ciao mondo! passed. Discord/native boundaries were mocked; this does not validate a live send or DeepL/Kagi.
- Automated plugin preservation: all 418 files and 185 original definitions retained; original copyright and authors checked against upstream base 718c867256a9d181edc7a534afb296b9bb41ab58.
- Actual plugin hooks executed with mocked Discord boundaries: approval, cancel, close, modal-manager close callback, plugin stop, changed draft, provider failure, conflicting translators, ordinary voice actions and disconnected/stopped controls.
- Translation workflow: identical output still previews; timeout, empty output, rejected modal, stale approval, DeepL English/Portuguese mapping tested.
- Real offline import/export functions executed with mocked storage: unknown-plugin round trip and restoration after a failing CSS write passed. The previous user's JSON was unavailable; a synthetic fixture was used.
- Pinned VencordInstallerCli.exe v1.4.2 executed on a synthetic legacy Windows installation. Install, loader verification, backup hash, foreign-mod refusal, tamper refusal and uninstall/byte-for-byte restoration passed. Original fixture SHA256: 64b08e60c59ba183a22c53b4a5b240ead62783370be4bc5c8ae03afc1aa59d98. The fixture is not a running Discord installation.
- Read-only preflight on installed Stable app-1.0.9261: recognized, already patched by an existing mod, left unchanged. Canary app-1.0.1217: recognized and unpatched, left unchanged. PTB is not installed here.

## Required before a public release

- Real Discord UI: all six sidebar panels, toggle/settings cards, responsive origin/status/tag combinations and author/source/license links.
- AutoTranslate in two accounts: actual provider success/failure, every modal dismissal, timeout, plugin disable, attachments/mentions, limits, other transforming plugins, repeated sends and retention of the composer draft on cancel.
- Voice Tools in two accounts: normal mute/deafen and server restrictions. No hidden-audio behavior is implemented or certified.
- Real clean Windows install/launch/uninstall and Discord update/repair on each available Stable/PTB/Canary channel; unsupported layouts must fail clearly.
- Actual private Vencord backup, theme files and cloud integration with an explicitly authorized account/backend.
- Remote GitHub Actions status must be checked separately; local success does not imply that remote CI ran.

No messages were sent to Discord users, no voice call was made, no live client was patched, and no cloud account was connected. Runtime compatibility remains unverified. The PR remains draft; no merge is performed.
