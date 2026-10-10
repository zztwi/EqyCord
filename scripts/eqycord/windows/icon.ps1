# EqyCord contributors, 2026. SPDX-License-Identifier: GPL-3.0-or-later
param([Parameter(Mandatory)][string]$Output)
Add-Type -AssemblyName System.Drawing
$images = @()
foreach ($size in @(16, 32, 48, 256)) {
    $bitmap = [Drawing.Bitmap]::new($size, $size)
    $graphics = [Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.Clear([Drawing.Color]::Transparent)
    $path = [Drawing.Drawing2D.GraphicsPath]::new()
    $radius = $size * 0.48
    $edge = $size - 1
    $path.AddArc(0, 0, $radius, $radius, 180, 90)
    $path.AddArc($edge-$radius, 0, $radius, $radius, 270, 90)
    $path.AddArc($edge-$radius, $edge-$radius, $radius, $radius, 0, 90)
    $path.AddArc(0, $edge-$radius, $radius, $radius, 90, 90)
    $path.CloseFigure()
    $fill = [Drawing.SolidBrush]::new([Drawing.Color]::FromArgb(39, 40, 43))
    $graphics.FillPath($fill, $path)
    $pen = [Drawing.Pen]::new([Drawing.Color]::White, [single]($size * 0.08))
    $pen.StartCap = [Drawing.Drawing2D.LineCap]::Round
    $pen.EndCap = [Drawing.Drawing2D.LineCap]::Round
    $graphics.DrawLine($pen, [single]($size*.65), [single]($size*.28), [single]($size*.35), [single]($size*.28))
    $graphics.DrawLine($pen, [single]($size*.35), [single]($size*.28), [single]($size*.35), [single]($size*.72))
    $graphics.DrawLine($pen, [single]($size*.35), [single]($size*.72), [single]($size*.65), [single]($size*.72))
    $graphics.DrawLine($pen, [single]($size*.35), [single]($size*.50), [single]($size*.60), [single]($size*.50))
    $stream = [IO.MemoryStream]::new()
    $bitmap.Save($stream, [Drawing.Imaging.ImageFormat]::Png)
    $images += ,@{Size=$size; Bytes=$stream.ToArray()}
    $stream.Dispose(); $pen.Dispose(); $fill.Dispose(); $path.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
}
$outputStream = [IO.File]::Create($Output)
$writer = [IO.BinaryWriter]::new($outputStream)
try {
    $writer.Write([uint16]0); $writer.Write([uint16]1); $writer.Write([uint16]$images.Count)
    $offset = 6 + 16 * $images.Count
    foreach ($image in $images) {
        $dimension = if ($image.Size -eq 256) { 0 } else { $image.Size }
        $writer.Write([byte]$dimension); $writer.Write([byte]$dimension); $writer.Write([byte]0); $writer.Write([byte]0)
        $writer.Write([uint16]1); $writer.Write([uint16]32); $writer.Write([uint32]$image.Bytes.Length); $writer.Write([uint32]$offset)
        $offset += $image.Bytes.Length
    }
    foreach ($image in $images) { $writer.Write([byte[]]$image.Bytes) }
} finally { $writer.Dispose(); $outputStream.Dispose() }
