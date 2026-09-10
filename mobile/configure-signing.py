"""Configure a generated Flutter Android runner for the owner's release key."""
import os,base64
from pathlib import Path
for key in ['ANDROID_KEYSTORE_BASE64','ANDROID_STORE_PASSWORD','ANDROID_KEY_ALIAS','ANDROID_KEY_PASSWORD']:
    if not os.environ.get(key):
        raise SystemExit('Missing release signing secret: '+key)
source=Path('android/app/build.gradle.kts')
text=source.read_text()
old='signingConfig = signingConfigs.getByName("debug")'
new='signingConfig = signingConfigs.getByName("release")'
if old not in text:
    raise SystemExit('Flutter Gradle template differs. Review signing configuration before release; no fallback to debug signing.')
block='''
    signingConfigs {
        create("release") {
            keyAlias = System.getenv("ANDROID_KEY_ALIAS")
            keyPassword = System.getenv("ANDROID_KEY_PASSWORD")
            storePassword = System.getenv("ANDROID_STORE_PASSWORD")
            storeFile = file("khabarfori-upload.jks")
        }
    }
'''
if text.count('android {')!=1:
    raise SystemExit('Unexpected Gradle android block')
text=text.replace('android {','android {'+block,1).replace(old,new)
key=Path('android/app/khabarfori-upload.jks')
key.write_bytes(base64.b64decode(os.environ['ANDROID_KEYSTORE_BASE64'],validate=True))
key.chmod(0o600)
source.write_text(text)
