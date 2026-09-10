#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
umask 077
mkdir -p backups
file="backups/khabarfori-$(date -u +%Y%m%dT%H%M%SZ).dump"
docker compose --env-file .env.vps -f compose.vps.yaml exec -T db pg_dump -U khabarfori -d khabarfori -Fc > "$file.partial"
mv "$file.partial" "$file"
printf 'Database backup: %s\n' "$file"
