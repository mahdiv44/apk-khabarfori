#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
command -v docker >/dev/null || { echo 'Docker Engine and its Compose plugin must be installed first.'; exit 1; }
docker compose version
if [[ ! -f .env.vps ]]; then
  python3 deploy/vps/configure.py
fi
chmod 600 .env.vps
compose=(docker compose --env-file .env.vps -f compose.vps.yaml)
"${compose[@]}" config --quiet
# Existing services on ports 80/443 must be reviewed before first installation.
"${compose[@]}" up -d --build
"${compose[@]}" ps
printf '%s\n' 'Containers started. Verify HTTPS health and administrator login before rebuilding the APK.'
