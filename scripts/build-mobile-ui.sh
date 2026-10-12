#!/usr/bin/env bash
set -euo pipefail
release_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export PATH="/opt/flutter/bin:$PATH"
export ANDROID_HOME="${ANDROID_HOME:-/opt/android-sdk}"
cd "$release_dir/mobile"
# Keep the current Android project and signing configuration.
if [[ ! -f android/gradlew ]]; then
 flutter create --platforms=android --project-name khabarfori /tmp/khabarfori-ui-bootstrap-$$
 bootstrap="/tmp/khabarfori-ui-bootstrap-$$/android"
 cp "$bootstrap/gradlew" android/gradlew
 cp "$bootstrap/gradlew.bat" android/gradlew.bat
 cp "$bootstrap/gradle/wrapper/gradle-wrapper.jar" android/gradle/wrapper/gradle-wrapper.jar
fi
chmod +x android/gradlew
flutter pub get
flutter analyze --no-fatal-infos
flutter test
flutter build apk --debug --dart-define=API_URL=https://khabarfori.5-102-37-53.sslip.io/api/v1 --dart-define=PUBLIC_WEB_URL=https://khabarfori.5-102-37-53.sslip.io
ls -lh build/app/outputs/flutter-apk/app-debug.apk
