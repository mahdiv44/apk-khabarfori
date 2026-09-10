#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
python3 - <<'PY'
import os,urllib.parse,urllib.request,json
for key in ['API_URL','PUBLIC_WEB_URL']:
    value=os.environ.get(key,'')
    parsed=urllib.parse.urlsplit(value)
    if parsed.scheme!='https' or not parsed.hostname or parsed.username or parsed.password or parsed.query or parsed.fragment:
        raise SystemExit(key+' must be a valid HTTPS URL without credentials, query or fragment')
url=os.environ['API_URL'].rstrip('/')
if not url.endswith('/api/v1'):
    raise SystemExit('API_URL must end in /api/v1 and point to deployed NestJS, not the review website')
try:
    with urllib.request.urlopen(url+'/health',timeout=15) as response:
        data=json.load(response)
    if data.get('status')!='ok' or data.get('service')!='KhabarFori':
        raise ValueError('Unexpected readiness response')
except Exception as error:
    raise SystemExit('KhabarFori API is not ready; refusing to build an app pointing at an unavailable server: '+str(error))
PY
bash bootstrap.sh
if [[ "${BUILD_MODE:-review}" == "release" ]]; then
  python3 configure-signing.py
  trap 'rm -f android/app/khabarfori-upload.jks' EXIT
  flutter build apk --release --dart-define="API_URL=${API_URL}" --dart-define="PUBLIC_WEB_URL=${PUBLIC_WEB_URL}"
else
  flutter build apk --debug --dart-define="API_URL=${API_URL}" --dart-define="PUBLIC_WEB_URL=${PUBLIC_WEB_URL}"
fi
