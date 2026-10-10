# EqyCord Windows setup

Share **EqyCord-Setup.exe**. It contains the tested client build, a private Node.js runtime, the checksum-pinned upstream Vencord patcher CLI, licenses, and matching EqyCord and patcher source archives. It does not contain user settings, account data, tokens, or Discord archives.

## Install

Windows 10/11 x64 with .NET Framework 4.8 and a normal desktop Discord installation is required. Stable, PTB, and Canary are offered subject to compatibility. Microsoft Store and other layouts are not supported.

1. Close the chosen Discord client completely, including its tray icon.
2. Open EqyCord-Setup.exe and choose Stable, PTB, or Canary.
3. Click Install, then open Discord after the success message.

The setup does not install Node globally and does not require a terminal or administrator rights for normal per-user Discord installations. Files are kept in `%LOCALAPPDATA%/EqyCord/builds/<commit>`. The downloaded setup can be deleted after installation; keep the installed build folder.

Existing client mods are not overwritten. Uninstall them using their own installer first. To update this EqyCord setup installation, close Discord, uninstall the old build, then install the new one. Automatic client updates can invalidate a patch and may require reinstalling.

## Verify and restore

Verify checks the patch, original backup, and installed client files. Uninstall restores the exact original Discord archive and checks its hash; it preserves settings and source files. The setup discovers its owned installation from Discord metadata, including an older app directory after Discord updates. Unknown, modified, or foreign patches are refused.

This setup does not claim ownership of the developer's existing Desktop package or a legacy loader lacking `.eqycord-install.json`. Those must be restored with their original installer.

## Distribution and visibility

The Staff and Creator badge assignments are bundled for IDs 380070146317877249 and 1306071807815712828. Clients running this build can display them; older builds and normal Discord do not. No hosted badge service is configured.

The executable is unsigned: Windows may show an unknown-publisher or SmartScreen warning. Do not tell recipients to disable their security software. Distribute the original file and its SHA-256 checksum. No public download page is automatically created by building the executable.

EqyCord is an unofficial mod and may conflict with Discord's Terms. Original Vencord/Equicord source credits and GPL-3.0-or-later notices remain included. Node's license and the patcher's source/license are included separately.

## Build and validation

Build the standalone desktop client, commit the exact source, then run `scripts/eqycord/windows/build.ps1` in PowerShell 7 from the repository. The Windows compiler and private Node runtime are pinned in that script. The embedded payload has a manifest of file hashes; extraction refuses traversal, directory links, or changed existing files.

The `--extract-only <directory>` argument is for package tests and does not patch Discord. Test extraction, bundled-runtime install/verify/uninstall on an isolated fixture, changed-file refusal, and the user interface separately. A passing fixture test does not establish every plugin's runtime compatibility on another machine.
