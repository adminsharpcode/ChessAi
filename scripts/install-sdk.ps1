$sdkDir = "D:\Android\Sdk"
$buildToolsDir = Join-Path $sdkDir "build-tools\34.0.0"
$platformDir = Join-Path $sdkDir "platforms\android-34"
$tempDir = "D:\Android\temp"

if (!(Test-Path $sdkDir)) { New-Item -ItemType Directory -Path $sdkDir -Force | Out-Null }
if (!(Test-Path $tempDir)) { New-Item -ItemType Directory -Path $tempDir -Force | Out-Null }

# 1. Download Build-Tools 34
$btZip = Join-Path $tempDir "build-tools_34.zip"
if (!(Test-Path $buildToolsDir)) {
    Write-Host "Downloading Android Build-Tools 34..."
    curl.exe -L -o $btZip https://dl.google.com/android/repository/build-tools_r34-windows.zip
    Write-Host "Extracting Build-Tools 34..."
    Expand-Archive -Path $btZip -DestinationPath $tempDir -Force
    $extractedBt = Join-Path $tempDir "android-14"
    if (Test-Path $extractedBt) {
        New-Item -ItemType Directory -Path (Split-Path $buildToolsDir) -Force -ErrorAction SilentlyContinue | Out-Null
        Move-Item $extractedBt $buildToolsDir -Force
    }
    Remove-Item $btZip -Force -ErrorAction SilentlyContinue
} else {
    Write-Host "Build-Tools 34 already installed at $buildToolsDir"
}

# 2. Download Platform 34 (android.jar)
$platformZip = Join-Path $tempDir "platform_34.zip"
if (!(Test-Path $platformDir)) {
    Write-Host "Downloading Android Platform 34 (API 34)..."
    curl.exe -L -o $platformZip https://dl.google.com/android/repository/platform-34-ext7_r03.zip
    Write-Host "Extracting Platform 34..."
    Expand-Archive -Path $platformZip -DestinationPath $tempDir -Force
    $extractedPlat = Join-Path $tempDir "android-34"
    if (Test-Path $extractedPlat) {
        New-Item -ItemType Directory -Path (Split-Path $platformDir) -Force -ErrorAction SilentlyContinue | Out-Null
        Move-Item $extractedPlat $platformDir -Force
    }
    Remove-Item $platformZip -Force -ErrorAction SilentlyContinue
} else {
    Write-Host "Platform 34 already installed at $platformDir"
}

# 3. Create local.properties in android directory
$localProps = Join-Path (Resolve-Path "$PSScriptRoot\..\android").Path "local.properties"
Set-Content -Path $localProps -Value "sdk.dir=D\:\\Android\\Sdk" -Encoding ASCII

Write-Host "Android SDK configured successfully in $sdkDir!"
Write-Host "local.properties written to $localProps"
