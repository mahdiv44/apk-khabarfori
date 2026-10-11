#!/usr/bin/env python3
"""Generate isolated deployment configuration; never prints credentials."""
from pathlib import Path
import secrets, re, getpass, os
os.umask(0o077)
root=Path(__file__).resolve().parents[1]
if (root/'.env').exists() or (root/'backend/.env').exists() or (root/'.env.vps').exists():
    raise SystemExit('Existing configuration preserved. Edit it manually instead.')
domain=input('HTTPS domain (DNS must point at the VPS): ').strip()
if not re.fullmatch(r'(?=.{1,253}$)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}',domain) or '.' not in domain:
    raise SystemExit('Invalid domain')
email=input('Initial admin email: ').strip().lower()
if not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+',email):raise SystemExit('Invalid email')
password=getpass.getpass('Initial admin password (16+ ASCII letters/digits/symbols): ')
if len(password)<16 or len(password.encode())>72 or any(c in password for c in '\r\n\x00') or not password.isascii():raise SystemExit('Invalid password')
# Compose raw env format prevents interpolation of $ and quote characters in passwords.
pg=secrets.token_hex(24)
ingest=secrets.token_hex(32)
(root/'.env').write_text(f'POSTGRES_PASSWORD={pg}\nAPP_DOMAIN={domain}\nCOMPOSE_PROJECT_NAME=khabarfori\nTELEGRAM_INGEST_TOKEN={ingest}\n')
values={'DATABASE_URL':f'postgresql://khabarfori:{pg}@db:5432/khabarfori','DIRECT_URL':f'postgresql://khabarfori:{pg}@db:5432/khabarfori','JWT_SECRET':secrets.token_hex(48),'ADMIN_EMAIL':email,'ADMIN_PASSWORD':password,'PORT':'4000','CORS_ORIGINS':f'https://{domain}','ENABLE_API_DOCS':'false','SEED_DEMO':'false','WEBAUTHN_ORIGIN':f'https://{domain}','WEBAUTHN_RP_ID':domain,'TELEGRAM_INGEST_TOKEN':ingest,'NEWS_FEED_URLS':'','NEWS_IMPORT_AUTHOR_ID':'','NEWS_AUTO_PUBLISH':'false'}
(root/'backend/.env').write_text(''.join(f'{k}={v}\n' for k,v in values.items()))
print('Configuration created with mode 0600. No services have been changed.')
