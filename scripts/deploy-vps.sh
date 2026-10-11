#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
command -v docker >/dev/null || { echo 'Install Docker Engine and Compose v2 first.' >&2; exit 1; }
[[ -f .env && -f backend/.env ]] || { echo 'Run python3 scripts/configure-vps.py first.' >&2; exit 1; }
# Requires Compose >=2.30 for raw env_file. Uses an isolated project; never touches ejrabot/PM2.
compose=(docker compose -p khabarfori -f compose.yaml -f compose.production.yaml)
"${compose[@]}" config --quiet
"${compose[@]}" build api admin
"${compose[@]}" up -d db
for attempt in {1..60}; do
 if "${compose[@]}" exec -T db pg_isready -U khabarfori >/dev/null 2>&1; then break; fi
 sleep 1
done
"${compose[@]}" exec -T db pg_isready -U khabarfori
umask 077
mkdir -p backups
backup="backups/pre-migration-$(date -u +%Y%m%dT%H%M%SZ).sql"
"${compose[@]}" exec -T db pg_dump -U khabarfori --clean --if-exists khabarfori > "$backup"
[[ -s "$backup" ]]
"${compose[@]}" run --rm migrate
"${compose[@]}" run --rm --no-deps api npm run db:seed
"${compose[@]}" up -d api admin gateway
for attempt in {1..60}; do
 if curl --fail --silent http://127.0.0.1:4000/api/v1/health >/dev/null; then
  echo 'API database health passed. Verify HTTPS and sign in using your configured domain.'
  exit 0
 fi
 sleep 2
done
echo 'API health check failed; inspect docker compose logs. Database backup is retained.' >&2
exit 1
