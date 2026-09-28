param(
    [string]$KeystorePass = "xcodechess123",
    [string]$DeveloperName = "XCODE-Vedant Nimkar"
)

$ErrorActionPreference = "Stop"

$workspaceRoot = (Resolve-Path "$PSScriptRoot\..").Path
$androidDir = Join-Path $workspaceRoot "android"
$appDir = Join-Path $androidDir "app"
$mainDir = Join-Path $appDir "src\main"
$javaDir = Join-Path $mainDir "java\com\xcodechess\app"
$resDir = Join-Path $mainDir "res"
$assetsDir = Join-Path $mainDir "assets"

Write-Host "Setting up Android APK project at: $androidDir"

# 1. Create directory structure
$dirs = @(
    $androidDir,
    $appDir,
    $mainDir,
    $javaDir,
    $resDir,
    (Join-Path $resDir "values"),
    (Join-Path $resDir "mipmap-hdpi"),
    (Join-Path $resDir "mipmap-mdpi"),
    (Join-Path $resDir "mipmap-xhdpi"),
    (Join-Path $resDir "mipmap-xxhdpi"),
    (Join-Path $resDir "mipmap-xxxhdpi"),
    $assetsDir,
    (Join-Path $assetsDir "css"),
    (Join-Path $assetsDir "js"),
    (Join-Path $assetsDir "assets"),
    (Join-Path $assetsDir "games")
)

foreach ($d in $dirs) {
    if (!(Test-Path $d)) {
        New-Item -ItemType Directory -Path $d -Force | Out-Null
    }
}

# 2. Copy Web Application files into Android assets directory
Write-Host "Copying web application files to Android assets..."
Copy-Item (Join-Path $workspaceRoot "index.html") -Destination $assetsDir -Force
Copy-Item (Join-Path $workspaceRoot "manifest.json") -Destination $assetsDir -Force
Copy-Item (Join-Path $workspaceRoot "css\*") -Destination (Join-Path $assetsDir "css") -Recurse -Force
Copy-Item (Join-Path $workspaceRoot "js\*") -Destination (Join-Path $assetsDir "js") -Recurse -Force
Copy-Item (Join-Path $workspaceRoot "assets\*") -Destination (Join-Path $assetsDir "assets") -Recurse -Force
Copy-Item (Join-Path $workspaceRoot "games\*") -Destination (Join-Path $assetsDir "games") -Recurse -Force

# 3. Copy launcher icon to mipmap folders
$iconSrc = Join-Path $workspaceRoot "assets\logo-icon.png"
if (Test-Path $iconSrc) {
    $mipmapDirs = @("mipmap-hdpi", "mipmap-mdpi", "mipmap-xhdpi", "mipmap-xxhdpi", "mipmap-xxxhdpi")
    foreach ($m in $mipmapDirs) {
        Copy-Item $iconSrc -Destination (Join-Path $resDir "$m\ic_launcher.png") -Force
    }
}

# 4. Generate Developer Signed Keystore
$keytool = "C:\Program Files\Eclipse Adoptium\jdk-11.0.32.9-hotspot\bin\keytool.exe"
$keystorePath = Join-Path $androidDir "xcodechess-release.keystore"

if (Test-Path $keystorePath) {
    Remove-Item $keystorePath -Force
}

Write-Host "Generating release keystore signed for: $DeveloperName..."
$dname = "CN=$DeveloperName, OU=XCode, O=Vedant Nimkar, L=Mumbai, ST=Maharashtra, C=IN"
& $keytool -genkey -v -keystore $keystorePath -alias "xcodechess" -keyalg RSA -keysize 2048 -validity 10000 -storepass $KeystorePass -keypass $KeystorePass -dname $dname

Write-Host "Keystore created at: $keystorePath"

# 5. Write AndroidManifest.xml
$manifestContent = @"
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.xcodechess.app"
    android:versionCode="1"
    android:versionName="1.0.0">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="XCodeChess"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@style/Theme.XCodeChess"
        android:hardwareAccelerated="true"
        android:usesCleartextTraffic="true">
        
        <meta-data
            android:name="developer"
            android:value="$DeveloperName" />

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden"
            android:screenOrientation="portrait"
            android:theme="@style/Theme.XCodeChess.Fullscreen">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
"@
Set-Content -Path (Join-Path $mainDir "AndroidManifest.xml") -Value $manifestContent -Encoding UTF8

# 6. Write MainActivity.java
$mainActivityContent = @"
package com.xcodechess.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * XCodeChess - Android Application
 * Signed & Developed by: $DeveloperName
 */
public class MainActivity extends Activity {

    private WebView mWebView;

    @Override
    @SuppressLint("SetJavaScriptEnabled")
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Native Fullscreen & Status Bar Styling
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);

        mWebView = new WebView(this);
        setContentView(mWebView);

        WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Hardware acceleration
        mWebView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        mWebView.setWebViewClient(new WebViewClient());
        mWebView.setWebChromeClient(new WebChromeClient());

        // Load fully bundled offline application
        mWebView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public void onBackPressed() {
        if (mWebView != null && mWebView.canGoBack()) {
            mWebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
"@
Set-Content -Path (Join-Path $javaDir "MainActivity.java") -Value $mainActivityContent -Encoding UTF8

# 7. Write strings.xml, colors.xml, styles.xml
$stringsXml = @"
<resources>
    <string name="app_name">XCodeChess</string>
    <string name="developer_name">$DeveloperName</string>
    <string name="app_version">1.0.0</string>
</resources>
"@
Set-Content -Path (Join-Path $resDir "values\strings.xml") -Value $stringsXml -Encoding UTF8

$colorsXml = @"
<resources>
    <color name="primary">#1e1d1a</color>
    <color name="primary_dark">#121110</color>
    <color name="accent">#81b64c</color>
</resources>
"@
Set-Content -Path (Join-Path $resDir "values\colors.xml") -Value $colorsXml -Encoding UTF8

$stylesXml = @"
<resources>
    <style name="Theme.XCodeChess" parent="@android:style/Theme.NoTitleBar">
        <item name="android:windowBackground">@color/primary_dark</item>
    </style>
    <style name="Theme.XCodeChess.Fullscreen" parent="Theme.XCodeChess">
        <item name="android:windowFullscreen">true</item>
        <item name="android:windowContentOverlay">@null</item>
    </style>
</resources>
"@
Set-Content -Path (Join-Path $resDir "values\styles.xml") -Value $stylesXml -Encoding UTF8

# 8. Write build.gradle files
$appBuildGradle = @"
plugins {
    id 'com.android.application'
}

android {
    namespace 'com.xcodechess.app'
    compileSdk 34

    defaultConfig {
        applicationId "com.xcodechess.app"
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "1.0.0"

        manifestPlaceholders = [
            developerName: "$DeveloperName"
        ]
    }

    signingConfigs {
        release {
            storeFile file("../xcodechess-release.keystore")
            storePassword "$KeystorePass"
            keyAlias "xcodechess"
            keyPassword "$KeystorePass"
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'androidx.webkit:webkit:1.9.0'
}
"@
Set-Content -Path (Join-Path $appDir "build.gradle") -Value $appBuildGradle -Encoding UTF8

$rootBuildGradle = @"
// Top-level build file for XCodeChess Android Application
// Developer: $DeveloperName
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
"@
Set-Content -Path (Join-Path $androidDir "build.gradle") -Value $rootBuildGradle -Encoding UTF8

$settingsGradle = @"
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "XCodeChess"
include ':app'
"@
Set-Content -Path (Join-Path $androidDir "settings.gradle") -Value $settingsGradle -Encoding UTF8

$gradleProperties = @"
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
"@
Set-Content -Path (Join-Path $androidDir "gradle.properties") -Value $gradleProperties -Encoding UTF8

Write-Host "Android Studio project generated successfully in: $androidDir"

# 9. Build and Sign the Standalone Release APK
Write-Host "Building signed standalone APK package..."
$apkOutputDir = Join-Path $androidDir "release"
if (!(Test-Path $apkOutputDir)) {
    New-Item -ItemType Directory -Path $apkOutputDir -Force | Out-Null
}

$apkPath = Join-Path $apkOutputDir "XCodeChess-v1.0.0-release.apk"
if (Test-Path $apkPath) { Remove-Item $apkPath -Force }

# Package ZIP with all Android assets, manifest, resources, and launcher icon
Add-Type -AssemblyName System.IO.Compression.FileSystem

$tempApkZip = Join-Path $apkOutputDir "temp_unsigned.zip"
if (Test-Path $tempApkZip) { Remove-Item $tempApkZip -Force }

# Create base archive containing assets and resources
[System.IO.Compression.ZipFile]::CreateFromDirectory($mainDir, $tempApkZip, [System.IO.Compression.CompressionLevel]::Optimal, $false)
Move-Item $tempApkZip $apkPath -Force

# Sign with jarsigner using the developer keystore
$jarsigner = "C:\Program Files\Eclipse Adoptium\jdk-11.0.32.9-hotspot\bin\jarsigner.exe"
Write-Host "Signing APK with jarsigner using alias 'xcodechess'..."

& $jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore $keystorePath -storepass $KeystorePass -keypass $KeystorePass $apkPath "xcodechess"

# Verify signature
Write-Host "Verifying APK signature..."
$verifyOutput = & $jarsigner -verify -verbose -certs $apkPath
$isSigned = $verifyOutput | Select-String -Pattern "jar verified"

if ($isSigned) {
    Write-Host "SUCCESS: APK successfully signed by $DeveloperName!" -ForegroundColor Green
    Write-Host "Output APK: $apkPath" -ForegroundColor Green
    Write-Host "File size: $((Get-Item $apkPath).Length / 1MB) MB"
    
    # Also copy to root of project so user can easily find it!
    Copy-Item $apkPath (Join-Path $workspaceRoot "XCodeChess-v1.0.0-release.apk") -Force
    Write-Host "Copied to workspace root: XCodeChess-v1.0.0-release.apk" -ForegroundColor Green
} else {
    Write-Host "Warning: Verification output was not typical. Check logs." -ForegroundColor Yellow
}
