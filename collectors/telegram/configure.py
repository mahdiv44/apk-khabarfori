import getpass
import os
from pathlib import Path
import re
import secrets
root=Path(__file__).resolve().parents[2]
vps=root/'.env.vps'
target=root/'.env.telegram'
if not vps.exists():
    raise SystemExit('Configure the VPS first: python3 deploy/vps/configure.py')
if target.exists():
    raise SystemExit('.env.telegram already exists; preserving credentials.')
api_id=input('Telegram API ID: ').strip()
api_hash=getpass.getpass('Telegram API hash (hidden): ').strip()
if not api_id.isdigit() or not re.fullmatch('[a-fA-F0-9]{32}',api_hash):
    raise SystemExit('Invalid Telegram application credentials.')
text=vps.read_text()
if 'TELEGRAM_INGEST_TOKEN=' not in text:
    with vps.open('a') as handle:
        handle.write('\nTELEGRAM_INGEST_TOKEN='+secrets.token_hex(32)+'\n')
os.chmod(vps,0o600)
fd=os.open(target,os.O_WRONLY|os.O_CREAT|os.O_EXCL,0o600)
with os.fdopen(fd,'w') as handle:
    handle.write('TELEGRAM_API_ID='+api_id+'\nTELEGRAM_API_HASH='+api_hash+'\n')
print('Configuration saved without printing secrets.')
