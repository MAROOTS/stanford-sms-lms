#!/bin/bash
set -euo pipefail
cd /root/stanfordos

echo "==> git pull"
git fetch origin
git reset --hard origin/master

CHANGED=$(git diff --name-only HEAD@{1} HEAD 2>/dev/null || true)

need_backend=0
need_frontend=0
need_caddy=0

echo "$CHANGED" | grep -qE '^schoolbackend/|^docker-compose\.yaml$' && need_backend=1 || true
echo "$CHANGED" | grep -qE '^schoolfrontend/' && need_frontend=1 || true
echo "$CHANGED" | grep -qE '^Caddyfile$|^docker-compose\.yaml$' && need_caddy=1 || true

# first deploy / empty diff → rebuild everything
if [ -z "$CHANGED" ]; then
  need_backend=1
  need_frontend=1
  need_caddy=1
fi

if [ "$need_frontend" -eq 1 ]; then
  echo "==> build frontend"
  docker run --rm -v "$PWD/schoolfrontend:/app" -w /app \
    -e VITE_ROOT_DOMAIN=stanfordos.co.ke \
    -e VITE_API_URL= \
    node:22-bookworm \
    sh -c "npm ci && npm run build"
  need_caddy=1
fi

if [ "$need_backend" -eq 1 ]; then
  echo "==> rebuild backend"
  docker compose up -d --build backend
fi

if [ "$need_caddy" -eq 1 ]; then
  echo "==> reload caddy"
  docker compose up -d --force-recreate caddy
fi

echo "==> status"
docker compose ps
echo "Deploy finished $(date -Is)"