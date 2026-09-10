#!/usr/bin/env python3
"""Run on the VPS; credentials stay in its private .env.vps file."""
import getpass
import os
from pathlib import Path
import re
import secrets

root = Path(__file__).resolve().parents[2]
target = root / '.env.vps'
if target.exists():
    raise SystemExit('.env.vps already exists; preserving existing database credentials.')
domain = input('Application domain pointing to this VPS (no https://): ').strip().lower()
if len(domain)>253 or not re.fullmatch(r'(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}', domain):
    raise SystemExit('Enter a valid domain you control, not an IP address.')
email = input('Administrator email (login alias will be admin): ').strip().lower()
if not re.fullmatch(r'[A-Za-z0-9._+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', email):
    raise SystemExit('Invalid administrator email.')
password = getpass.getpass('New application admin password, 16-72 characters: ')
if not re.fullmatch(r'[A-Za-z0-9!@#%^*_.+\-]{16,72}', password):
    raise SystemExit('Use 16-72 letters, numbers or !@#%^*_.+- characters.')
if getpass.getpass('Repeat application admin password: ') != password:
    raise SystemExit('Passwords do not match.')
values = {'APP_DOMAIN':domain, 'ADMIN_EMAIL':email, 'ADMIN_PASSWORD':password,
          'POSTGRES_PASSWORD':secrets.token_hex(32), 'JWT_SECRET':secrets.token_hex(48)}
fd = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
with os.fdopen(fd, 'w') as handle:
    handle.write(''.join(f"{key}=\'{value}\'\n" for key,value in values.items()))
print('Configuration saved. Admin username: admin. Password was not printed.')
