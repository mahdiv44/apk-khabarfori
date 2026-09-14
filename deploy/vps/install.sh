#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../.."
test -f .env.vps || { echo 'Copy deploy/vps/.env.vps.example to .env.vps and fill every value first.'; exit 1; }
chmod 600 .env.vps
docker compose --env-file .env.vps -f compose.vps.yaml config --quiet
docker compose --env-file .env.vps -f compose.vps.yaml up -d --build
docker compose --env-file .env.vps -f compose.vps.yaml ps
