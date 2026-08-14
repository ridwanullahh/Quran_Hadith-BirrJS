#!/bin/bash
# BirrStack Native Android Build Script
# BismiLLAH Ar-Rahman Ar-Raheem.
# This script builds an Android APK from the web build.
# Requires: Android SDK, JDK 17, Gradle

set -e
APP_NAME="QuranHadith"
PACKAGE="com.birrstack.quranhadith"
VERSION="1.0.0"
VERSION_CODE="1"

echo "BismiLLAH. Building Android APK for $APP_NAME..."

# Check prerequisites
if ! command -v java &> /dev/null; then
  echo "Error: Java not found. Install JDK 17."
  exit 1
fi

if [ ! -d "$ANDROID_HOME" ]; then
  echo "Error: ANDROID_HOME not set. Install Android SDK."
  exit 1
fi

# Copy web build to Android assets
echo "Copying web build..."
rm -rf app/src/main/assets/www/*
cp -r ../../dist/* app/src/main/assets/www/

# Build with Gradle
echo "Building APK..."
chmod +x gradlew
./gradlew assembleRelease

# Copy APK to assets folder
APK_PATH="app/build/outputs/apk/release/app-release-unsigned.apk"
if [ -f "$APK_PATH" ]; then
  cp "$APK_PATH" "../../../../$APP_NAME-$VERSION.apk"
  echo "APK built: $APP_NAME-$VERSION.apk"
  echo "Note: APK is unsigned. Sign with:"
  echo "  jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore $APP_NAME-$VERSION.apk alias_name"
else
  echo "Error: APK build failed."
  exit 1
fi

echo "Done. AlhamduliLLAH."
