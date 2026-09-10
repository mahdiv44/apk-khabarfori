#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
flutter create --platforms=android --org=com.khabarfori --project-name=khabarfori .
python3 - <<'PY_NATIVE'
from pathlib import Path
import shutil
manifest = Path('android/app/src/main/AndroidManifest.xml')
xml = manifest.read_text()
for permission in ['android.permission.INTERNET', 'android.permission.POST_NOTIFICATIONS']:
    if permission not in xml:
        xml = xml.replace('<application', '<uses-permission android:name="' + permission + '"/>\n    <application', 1)
xml = xml.replace('android:label="khabarfori"', 'android:label="KhabarFori"')
manifest.write_text(xml)
# Keep the source-provided logo unchanged; Android scales this resource.
icon=Path('android/app/src/main/res/drawable-nodpi')
icon.mkdir(parents=True,exist_ok=True)
shutil.copy('assets/brand/khabarfoori-icon.png',icon/'khabarfoori_icon.png')
manifest.write_text(xml.replace('@mipmap/ic_launcher','@drawable/khabarfoori_icon'))
PY_NATIVE
flutter pub get
flutter analyze
flutter test
