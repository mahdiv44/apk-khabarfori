# اجرای نهایی روی VPS

این محیط به شبکه VPS دسترسی route ندارد؛ بنابراین اجرای SSH از اینجا انجام نشده است. روی کامپیوتر شما که اتصال SSH دارد، سورس را به `/root/projects/khabarfori` منتقل کنید و پروژه قبلی `ejrabot` را دست‌نخورده نگه دارید.

در Git Bash از پوشه پروژه:

```bash
scp -i /path/to/ejrabot_mobinhost_ed25519 -P 22 -r . root@5.102.37.53:/root/projects/khabarfori
ssh -i /path/to/ejrabot_mobinhost_ed25519 -p 22 root@5.102.37.53
cd /root/projects/khabarfori
cp deploy/vps/.env.vps.example .env.vps
nano .env.vps
bash deploy/vps/install.sh
```

در `.env.vps` دامنه‌ای که به IP سرور اشاره می‌کند، رمز PostgreSQL، JWT_SECRET و رمز مدیر را قرار دهید. کلید خصوصی، `.env.vps` و هر فایل session را هرگز در Git یا ZIP قرار ندهید. پس از اجرای موفق، این بررسی را انجام دهید:

```bash
docker compose --env-file .env.vps -f compose.vps.yaml ps
curl -fsS https://DOMAIN/api/v1/health
```

خروجی سلامت باید `status` برابر `ok` و `service` برابر `KhabarFori` داشته باشد. سپس APK را با `API_URL=https://DOMAIN/api/v1` دوباره از GitHub Actions بسازید؛ APK قبلی به API شبیه‌ساز اشاره می‌کند.

پیش از استقرار، اگر سرور تولید دیگری دارد، پورت‌های 80 و 443، فضای دیسک و سرویس‌های فعال را بررسی کنید. این compose پورت PostgreSQL و API را روی میزبان منتشر نمی‌کند. بعد از ورود، رمزهای root و VNC که قبلاً در گفتگو آمده‌اند را تغییر دهید.
