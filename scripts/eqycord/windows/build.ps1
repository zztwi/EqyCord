# EqyCord contributors, 2026. SPDX-License-Identifier: GPL-3.0-or-later
$ErrorActionPreference = 'Stop'
$repo = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../..'))
$build = (& git -C $repo rev-parse --short=8 HEAD).Trim()
$work = Join-Path $repo "work/windows-setup-$build"
$payload = Join-Path $work 'payload'
if (Test-Path -LiteralPath $work) { throw 'Build output already exists. Use a fresh commit or a fresh build output directory.' }
New-Item -ItemType Directory -Path $payload -Force | Out-Null
foreach ($folder in @('dist/Installer', 'runtime', 'licenses', 'source', 'scripts/eqycord')) {
    New-Item -ItemType Directory -Path (Join-Path $payload $folder) -Force | Out-Null
}

# Pin the official Node Windows x64 archive. It is used only by the setup,
# never installed globally and never added to PATH.
$runtimeZip = Join-Path $work 'node-v22.14.0-win-x64.zip'
Invoke-WebRequest -Uri 'https://nodejs.org/dist/v22.14.0/node-v22.14.0-win-x64.zip' -OutFile $runtimeZip
$runtimeHash = '55b639295920b219bb2acbcfa00f90393a2789095b7323f79475c9f34795f217'
if ((Get-FileHash -LiteralPath $runtimeZip -Algorithm SHA256).Hash.ToLower() -ne $runtimeHash) { throw 'Node runtime checksum mismatch.' }
Expand-Archive -LiteralPath $runtimeZip -DestinationPath (Join-Path $work 'node')
$runtimeRoot = Join-Path $work 'node/node-v22.14.0-win-x64'
Copy-Item -LiteralPath (Join-Path $runtimeRoot 'node.exe') -Destination (Join-Path $payload 'runtime/node.exe')
Copy-Item -LiteralPath (Join-Path $runtimeRoot 'LICENSE') -Destination (Join-Path $payload 'licenses/NODE-LICENSE.txt')

& node --input-type=module -e 'import {ensureInstaller} from "./scripts/eqycord/installer.mjs"; await ensureInstaller();'
if ($LASTEXITCODE -ne 0) { throw 'Pinned upstream installer verification failed.' }
Copy-Item -LiteralPath (Join-Path $repo 'dist/Installer/VencordInstallerCli.exe') -Destination (Join-Path $payload 'dist/Installer/VencordInstallerCli.exe')
Get-ChildItem -LiteralPath (Join-Path $repo 'dist') -File | Where-Object { $_.Name -match '\.(js|css)$|\.LEGAL\.txt$' } | ForEach-Object {
    Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $payload 'dist')
}
Copy-Item -LiteralPath (Join-Path $repo 'scripts/eqycord/installer.mjs') -Destination (Join-Path $payload 'scripts/eqycord/installer.mjs')
foreach ($file in @('LICENSE', 'EQYCORD.md', 'BADGES.md', 'PLUGIN-AUDIT.md', 'WINDOWS-INSTALLER.md')) {
    Copy-Item -LiteralPath (Join-Path $repo $file) -Destination $payload
}
& git -C $repo archive --format=zip "--output=$(Join-Path $payload "source/EqyCord-$build.zip")" HEAD
if ($LASTEXITCODE -ne 0) { throw 'Could not archive matching source.' }
Invoke-WebRequest -Uri 'https://codeload.github.com/Vencord/Installer/zip/refs/tags/v1.4.2' -OutFile (Join-Path $payload 'source/Vencord-Installer-v1.4.2.zip')
Copy-Item -LiteralPath (Join-Path $repo 'LICENSE') -Destination (Join-Path $payload 'licenses/VENCORD-INSTALLER-GPL.txt')
@{
    EqyCordCommit = (& git -C $repo rev-parse HEAD).Trim()
    NodeVersion = '22.14.0'
    NodeArchiveSHA256 = $runtimeHash
    InstallerVersion = 'v1.4.2'
    InstallerBinarySHA256 = '15268aba25625797bf562187dd87ddadf42882e079c7b6192880ad3e83353ef5'
    Platform = 'Windows x64'
    Signing = 'Unsigned; no signing certificate configured'
} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $payload 'BUILD-INFO.json') -Encoding utf8

$files = @{}
Get-ChildItem -LiteralPath $payload -File -Recurse | ForEach-Object {
    $name = [IO.Path]::GetRelativePath($payload, $_.FullName).Replace('\', '/')
    $files[$name] = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLower()
}
@{ Build = $build; Files = $files } | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $payload 'manifest.json') -Encoding utf8
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = Join-Path $work 'payload.zip'
[IO.Compression.ZipFile]::CreateFromDirectory($payload, $archive)
$compiler = Join-Path $env:WINDIR 'Microsoft.NET/Framework64/v4.0.30319/csc.exe'
$output = Join-Path $work 'EqyCord-Setup.exe'
& $compiler /nologo /target:winexe /platform:x64 /optimize+ "/out:$output" "/resource:$archive,EqyCord.Payload" /r:System.Windows.Forms.dll /r:System.Drawing.dll /r:System.IO.Compression.dll /r:System.IO.Compression.FileSystem.dll /r:System.Web.Extensions.dll (Join-Path $PSScriptRoot 'Setup.cs')
if ($LASTEXITCODE -ne 0) { throw 'Windows setup compilation failed.' }
Write-Output $output
