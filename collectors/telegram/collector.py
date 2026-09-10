"""Read only AkhbareFori; publish one bounded ranking snapshot every five minutes."""
import asyncio
from datetime import datetime, timedelta, timezone
import json
import os
import sys
import urllib.request
from telethon import TelegramClient, errors

CHANNEL = 'AkhbareFori'

def entry(message):
    counts = getattr(message, 'reactions', None)
    reactions = sum(r.count for r in counts.results) if counts is not None else None
    return {'id': message.id, 'excerpt': (message.message or '')[:280],
            'publishedAt': message.date.isoformat(), 'reactions': reactions,
            'forwards': getattr(message, 'forwards', None), 'views': getattr(message, 'views', None)}

def publish(payload):
    token = os.environ['TELEGRAM_INGEST_TOKEN']
    if len(token) < 32:
        raise RuntimeError('Missing ingestion token')
    # Fixed internal service, not a URL read from Telegram or user content.
    request = urllib.request.Request('http://api:4000/api/v1/social/telegram/snapshot',
        data=json.dumps(payload).encode(), method='POST',
        headers={'Content-Type':'application/json','X-Khabarfori-Collector':token})
    # Refuse redirects so the ingestion credential cannot leave this service.
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, req, fp, code, msg, headers, newurl):
            return None
    with urllib.request.build_opener(NoRedirect).open(request, timeout=20) as response:
        if response.status != 201:
            raise RuntimeError('Snapshot rejected')

async def collect(client):
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(hours=24)
    scanned, missing, complete, items = 0, 0, True, []
    async for message in client.iter_messages(CHANNEL, limit=1000, wait_time=1):
        scanned += 1
        if message.date < cutoff:
            break
        if not message.message:
            continue
        item = entry(message)
        if item['reactions'] is None or item['forwards'] is None:
            missing += 1
            continue
        items.append(item)
    else:
        complete = scanned < 1000
    items.sort(key=lambda i: (i['reactions']+i['forwards'],i['publishedAt'],i['id']),reverse=True)
    await asyncio.to_thread(publish, {'capturedAt':now.isoformat(), 'complete':complete,
        'scanned':scanned,'missingMetrics':missing,'items':items[:100]})
    print(f'Snapshot stored: {len(items[:100])} posts; scanned={scanned}; complete={complete}',flush=True)

async def main():
    os.umask(0o077)
    client = TelegramClient('/session/akhbarefori',int(os.environ['TELEGRAM_API_ID']),
                            os.environ['TELEGRAM_API_HASH'],receive_updates=False)
    if '--login' in sys.argv:
        # Run interactively yourself on the VPS. Codes/passwords are never sent to the backend.
        await client.start()
        await client.disconnect()
        print('Telegram session saved locally on the VPS.')
        return
    await client.connect()
    try:
        if not await client.is_user_authorized():
            raise RuntimeError('Authorize the session with --login first')
        while True:
            delay = 300
            try:
                await collect(client)
            except errors.FloodWaitError as error:
                delay = max(delay,error.seconds+5)
                print('Telegram requested a pause; waiting before retry.',flush=True)
            except Exception as error:
                # Do not log response bodies, phone numbers, session data or credentials.
                print('Sync failed: '+type(error).__name__,flush=True)
            await asyncio.sleep(delay)
    finally:
        await client.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
