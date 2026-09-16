#!/bin/bash
set -euo pipefail

ROOT=/root/stanfordos
BACKUP_DIR="$ROOT/backups"
KEEP_DAYS=14
STAMP=$(date -u +%Y%m%dT%H%M%SZ)

cd "$ROOT"
mkdir -p "$BACKUP_DIR"

# Load DB_USERNAME etc. without exporting the whole file into the world
set -a
# shellcheck disable=SC1091
source "$ROOT/.env"
set +a

# --- Postgres (custom format, good for pg_restore) ---
docker compose exec -T postgres \
  pg_dump -U "$DB_USERNAME" -d school_db --no-owner --format=custom \
  > "$BACKUP_DIR/school_db_${STAMP}.dump"

# --- MinIO data (logos, photos, uploads) ---
MINIO_VOL=$(docker volume ls -q | grep -E 'stanfordos.*minio' | head -1)
if [ -n "$MINIO_VOL" ]; then
  docker run --rm \
    -v "${MINIO_VOL}:/data:ro" \
    -v "$BACKUP_DIR:/backup" \
    alpine tar czf "/backup/minio_${STAMP}.tar.gz" -C /data .
fi

# Keep last KEEP_DAYS days
find "$BACKUP_DIR" -type f \( -name 'school_db_*.dump' -o -name 'minio_*.tar.gz' \) -mtime +"$KEEP_DAYS" -delete

echo "$(date -Is) backup ok  $STAMP"