# EqyCord (development fork)

EqyCord is an independent, **unofficial** modification of the Discord desktop client
built on [Vencord](https://github.com/Vendicated/Vencord).

This fork **does not replace the copyright notices, licenses, or contributions**
of the Vencord project. Vencord remains the source of its existing plugin
collection; new EqyCord features are documented and identified separately.

## Current status

**Development / not yet built or tested against Discord.** Do not treat the
current Git branch as an installer or a production-ready release.

- The plugin list continues to use Vencord's existing settings, plugin manager,
  search, toggles, theme integration, updater and backup functionality.
- The plugin cards now distinguish original Vencord plugins, original EqyCord
  plugins, and local community plugins.
- The filter menu offers Vencord-only and EqyCord-only views.
- The settings sidebar and first-party landing panel begin using EqyCord branding.
- The original upstream **Translate** plugin is preserved.
- A new optional plugin, **EqyAutoTranslate**, is included in `src/plugins`.

## EqyAutoTranslate

This plugin adds an approval-focused workflow to Vencord's existing Translate
provider:

1. Enable `Translate` and `EqyAutoTranslate`.
2. Keep the original `Translate > Auto Translate` **OFF**, to prevent the
   same message being processed by two automatic translators.
3. In `EqyAutoTranslate` settings, select the destination language.
4. Enable **Translate outgoing messages**. It defaults to off.
5. Write and send a message. The plugin requests a translation using the
   configured provider. If preview is enabled (default), a confirmation
   dialog shows the original and translated text.
6. Approve to send the translated message, or cancel to **not send**.
   Translation failures also cancel the send rather than sending an
   unexpected untranslated message.

Translation can use external services, so do not use it for confidential
messages unless you trust the provider. Settings and provider credentials
are managed by the original Vencord Translate plugin.

This implementation still needs compilation and multi-client validation.

## Compatibility

The fork keeps upstream internal settings keys where necessary (including
`vencord_*` keys), so old Vencord settings exports can remain usable.
That **does not guarantee** migration for removed or renamed upstream plugins
or that all plugins are available on every Discord variant.

The Vencord settings backup JSON stores plugin selections/options; it does
not contain executable plugin code.

## Upstream and credit

- Original project: [Vendicated/Vencord](https://github.com/Vendicated/Vencord)
- EqyCord fork: [zztwi/EqyCord](https://github.com/zztwi/EqyCord)
- License: **GPL-3.0-or-later**. Maintain original file headers and notices.
- EqyCord is not affiliated with Discord or endorsed by Vencord.
- Modifying the Discord client can violate Discord's terms and may put
  your account at risk.

## Development

The existing Vencord build scripts remain in `package.json`.
A local development setup requires a compatible Node.js environment and pnpm.

Before distributing an installer, run the upstream test/build workflow,
check runtime compatibility, review source attribution, and test clean
install/uninstall/restore flows on Stable/PTB/Canary where supported.

Do not enable automatic installation or auto-update against an unverified
fork build.
