# EqyCord

EqyCord is an independent, unofficial Discord client modification. It is not affiliated with Discord, Vencord, or Equicord. Client modifications may conflict with [Discord's Terms](https://discord.com/terms).

## Plugin inventory

EqyCord retains all 185 standard Vencord plugin definitions and imports all 200 Equicord plugin definitions from Equicord source commit `51eab49cce4566e51f65f29cc0eaae50efdd48d4`, together with the API modules they require. The imported plugin source has no duplicate plugin names in the retained Vencord inventory.

The plugin origin filter has three first-party choices: **Vencord**, **EqyCord**, and **Community**. Imported Equicord modules are grouped under **EqyCord** in the plugin list. Their original authors, copyright notices, and GPL license headers are preserved in the source and plugin details; the EqyCord origin label does not change authorship.

The earlier EqyCord prototype plugins have been removed, including the Ghost voice control, translation, search, and voice utility plugins. Standard Vencord plugins remain available. Platform-specific plugin exclusions still apply.

## Settings and backups

EqyCord keeps the existing plugin cards, toggles, dependency handling, and settings controls, and adds the origin filter. Other settings sections keep their EqyCord identity while using the original compatible Vencord APIs.

Backup import/export keeps the Vencord JSON shape: `{ settings: { ... }, quickCss: "..." }`. Import validates the envelope and rejects prototype-related keys while preserving unknown plugin settings for compatibility. A backup contains settings, not plugin code.

Automatic updates are disabled for this fork until an EqyCord release channel is available. The Updater page does not replace this build with an upstream release.

## Windows install and restore

The Windows launcher supports Stable, PTB, and Canary only when the installed client layout is compatible. It requires Node.js 22 or later and the selected Discord client to be fully closed. The installer checks the Discord archive and its backup, refuses foreign modifications, and supports restoring the original archive. Keep the EqyCord package in the same folder after installation because the loader points to its `dist` directory.

## Source and credits

EqyCord is distributed under GPL-3.0-or-later. The Vencord and Equicord source files retain their original copyright notices, authors, license text, and required notices. The complete source and root license are included with the package. EqyCord is not endorsed by either project.