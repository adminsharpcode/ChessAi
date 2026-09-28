Add-Type -AssemblyName System.Drawing

$srcPath = Join-Path $PSScriptRoot "..\assets\logo.png"
$fullSrc = (Resolve-Path $srcPath).Path
$srcBmp = New-Object System.Drawing.Bitmap($fullSrc)

$w = $srcBmp.Width
$h = $srcBmp.Height
Write-Host "Source image: ${w}x${h}"

# Find bounding box of dark pixels (mark)
$minX = $w
$maxX = 0
$minY = $h
$maxY = 0

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $c = $srcBmp.GetPixel($x, $y)
        # Check if dark (the emblem is black/near black)
        if ($c.R -lt 100 -and $c.G -lt 100 -and $c.B -lt 100) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

Write-Host "Emblem bounding box: minX=$minX, maxX=$maxX, minY=$minY, maxY=$maxY"
$markW = ($maxX - $minX) + 1
$markH = ($maxY - $minY) + 1
Write-Host "Mark dimensions: ${markW}x${markH}"

# Add padding
$pad = 20
$cropX = [Math]::Max(0, $minX - $pad)
$cropY = [Math]::Max(0, $minY - $pad)
$cropW = [Math]::Min($w - $cropX, $markW + ($pad * 2))
$cropH = [Math]::Min($h - $cropY, $markH + ($pad * 2))

# 1. Create transparent dark mark (black with transparency)
# Background in source is light grey/white (~240-250)
$outDark = New-Object System.Drawing.Bitmap($cropW, $cropH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$outWhite = New-Object System.Drawing.Bitmap($cropW, $cropH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($y = 0; $y -lt $cropH; $y++) {
    for ($x = 0; $x -lt $cropW; $x++) {
        $c = $srcBmp.GetPixel($cropX + $x, $cropY + $y)
        $avg = ($c.R + $c.G + $c.B) / 3.0
        
        # In the source, the background is light (~240..255) and mark is dark (~0..30)
        # Calculate alpha based on inverted darkness
        if ($avg -lt 220) {
            # Normalize darkness from [30..210] to alpha [255..0]
            $alpha = [int][Math]::Min(255, [Math]::Max(0, (230 - $avg) * 1.4))
            if ($alpha -gt 5) {
                # Dark version (pure black mark with antialiased alpha)
                $outDark.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 0, 0, 0))
                # White version (pure white mark with antialiased alpha)
                $outWhite.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, 255, 255, 255))
            } else {
                $outDark.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
                $outWhite.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            }
        } else {
            $outDark.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            $outWhite.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
    }
}

$destDark = Join-Path $PSScriptRoot "..\assets\logo-mark-dark.png"
$destWhite = Join-Path $PSScriptRoot "..\assets\logo-mark-white.png"
$outDark.Save($destDark, [System.Drawing.Imaging.ImageFormat]::Png)
$outWhite.Save($destWhite, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Saved logo-mark-dark.png and logo-mark-white.png"

# 2. Create square icon / badge (512x512) for App Icon & PWA
$iconSize = 512
$badge = New-Object System.Drawing.Bitmap($iconSize, $iconSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($badge)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Background: dark card style with subtle gradient or rounded square
$rect = New-Object System.Drawing.Rectangle(0, 0, $iconSize, $iconSize)
$brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 30, 29, 26))
$g.FillRectangle($brush, $rect)

# Draw white emblem centered
$scale = [Math]::Min(($iconSize * 0.75) / $cropW, ($iconSize * 0.75) / $cropH)
$dw = [int]($cropW * $scale)
$dh = [int]($cropH * $scale)
$dx = [int](($iconSize - $dw) / 2)
$dy = [int](($iconSize - $dh) / 2)

$g.DrawImage($outWhite, $dx, $dy, $dw, $dh)

$destBadge = Join-Path $PSScriptRoot "..\assets\logo-icon.png"
$badge.Save($destBadge, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Saved logo-icon.png (512x512)"

# 3. Create 64x64 favicon
$favSize = 64
$favBmp = New-Object System.Drawing.Bitmap($favSize, $favSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gFav = [System.Drawing.Graphics]::FromImage($favBmp)
$gFav.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$gFav.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

$favScale = [Math]::Min(($favSize * 0.85) / $cropW, ($favSize * 0.85) / $cropH)
$fdw = [int]($cropW * $favScale)
$fdh = [int]($cropH * $favScale)
$fdx = [int](($favSize - $fdw) / 2)
$fdy = [int](($favSize - $fdh) / 2)
$gFav.DrawImage($outWhite, $fdx, $fdy, $fdw, $fdh)

$destFav = Join-Path $PSScriptRoot "..\assets\favicon.png"
$favBmp.Save($destFav, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Saved favicon.png"

# Cleanup
$g.Dispose()
$gFav.Dispose()
$badge.Dispose()
$favBmp.Dispose()
$outDark.Dispose()
$outWhite.Dispose()
$srcBmp.Dispose()
Write-Host "All logo assets generated successfully!"
