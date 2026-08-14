# Native Build Assets — Quran & Hadith

> BismiLLAH Ar-Rahman Ar-Raheem.

This directory contains the native build configuration for the Quran & Hadith app.

## Android APK

### Prerequisites
- Android SDK (API 34)
- JDK 17
- Gradle 8.1+

### Build
```bash
cd assets/native/android
./build.sh
```

The APK will be generated at the repo root: `QuranHadith-1.0.0.apk`

### Manual Build
1. Copy the web build: `cp -r dist/* assets/native/android/app/src/main/assets/www/`
2. Open `assets/native/android/` in Android Studio
3. Build → Build APK

## Windows EXE

### Prerequisites
- .NET 6 SDK
- WebView2 Runtime (pre-installed on Windows 11)

### Build
```powershell
cd assets\native\windows
.\build.ps1
```

The EXE will be generated at `assets/native/QuranHadith-1.0.0.exe`

## iOS / macOS

iOS and macOS builds require a macOS host with Xcode. The web build can be
wrapped in a WKWebView shell using the same pattern as Android.

1. Create a new Xcode project (iOS App)
2. Add a WKWebView to the main view
3. Copy `dist/` contents to the app bundle
4. Load `index.html` from the bundle
