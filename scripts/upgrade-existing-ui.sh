#!/usr/bin/env bash
set -euo pipefail
umask 077
release_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
base=/root/projects/apk-khabarfori
previous="${KF_PREVIOUS_OVERRIDE:-/root/projects/khabarfori-ui-20261012-121112/deploy-existing-ui.json}"
test -f "$previous"
test -f "$base/.env.vps"
test -f "$release_dir/backend/prisma/migrations/202610120001_editorial_ui/migration.sql"
available=$(df -Pk "$base" | awk 'NR==2 {print $4}')
if (( available < 4194304 )); then echo 'STOP: At least 4 GiB free space is required before building.'; exit 1; fi
stamp=$(date +%Y%m%d-%H%M%S)
backup_dir="/root/backups/khabarfori-ui-$stamp"
mkdir -p "$backup_dir"
cp -p "$previous" "$backup_dir/previous-override.json"
cp -p "$base/compose.vps.yaml" "$backup_dir/compose.vps.yaml"
cp -p "$base/.env.vps" "$backup_dir/.env.vps"
cp -p "$base/deploy/vps/Caddyfile" "$backup_dir/Caddyfile"
for service in api admin; do
 docker image tag "$(docker inspect -f '{{.Image}}' "khabarfori-$service-1")" "khabarfori-$service:before-ui-$stamp"
done
export KF_UI_RELEASE="$release_dir" KF_UI_PREVIOUS="$previous" KF_UI_TAG="ui-$stamp"
python3 - <<'PY'
import json,os
from pathlib import Path
root=Path(os.environ['KF_UI_RELEASE'])
config=json.loads(Path(os.environ['KF_UI_PREVIOUS']).read_text())
services=config.setdefault('services',{})
for name in ('api','migrate','seed'):
    service=services.setdefault(name,{})
    service['image']='khabarfori-api:'+os.environ['KF_UI_TAG']
    service['build']={'context':str(root/'backend'),'dockerfile':'Dockerfile'}
env=services['api'].setdefault('environment',{})
env['NEWS_FEED_URLS']='https://www.khabarfoori.com/fa/feeds/'
env['NEWS_POPULAR_FEED_URLS']='https://www.khabarfoori.com/fa/feeds/?p=ZGF0ZVJhbmdlJTVCc3RhcnQlNUQ9LTIxNjAwJm9yZGVyPWhpdHM%2C'
admin=services.setdefault('admin',{})
admin['image']='khabarfori-admin:'+os.environ['KF_UI_TAG']
admin['build']={'context':str(root),'dockerfile':'production/Dockerfile.admin'}
(root/'deploy-existing-ui.json').write_text(json.dumps(config,indent=2))
PY
dc(){ docker compose -p khabarfori --env-file "$base/.env.vps" -f "$base/compose.vps.yaml" -f "$release_dir/deploy-existing-ui.json" "$@"; }
dc config --quiet
dc build api
docker builder prune --force
dc build admin
docker builder prune --force
# Fresh database snapshot immediately before the schema change.
docker exec khabarfori-db-1 sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$backup_dir/database.dump"
test -s "$backup_dir/database.dump"
docker exec -i khabarfori-db-1 pg_restore --list < "$backup_dir/database.dump" > "$backup_dir/database-index.txt"
dc run --rm --no-deps --pull never migrate
dc run --rm --no-deps --pull never seed
# Validate actual Prisma queries, not just process liveness.
dc run --rm --no-deps --pull never api node -e '
const {PrismaClient}=require("@prisma/client");const {NewsService}=require("./dist/src/news");const db=new PrismaClient();
(async()=>{try{const service=new NewsService(db);await service.list({sort:"latest",limit:1});await service.list({sort:"trending",limit:1});console.log("NEWS_DATABASE_OK");}finally{await db.$disconnect();}})().catch(e=>{console.error(e.message);process.exitCode=1});'

dc up -d --no-deps --no-build --pull never api
ready=0
for attempt in {1..30}; do
 if dc exec -T api node -e "fetch('http://127.0.0.1:4000/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"; then ready=1; break; fi
 sleep 2
done
if (( ready == 0 )); then echo "STOP: API health failed. Rollback images: before-ui-$stamp. Backup: $backup_dir"; exit 1; fi
dc up -d --no-deps --no-build --pull never admin
dc ps
echo "UI_BACKEND_UPDATED; backup=$backup_dir; override=$release_dir/deploy-existing-ui.json"
echo 'Wait for the first news sync, then verify photos and source ranks. Build the new mobile APK separately.'
