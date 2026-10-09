#!/usr/bin/env bash
# [checks] any time. Throwaway containers and volumes only, never the stack.
#
# Proves a backup is restorable, by restoring it -- into throwaway containers
# and volumes, never over the running stack.
#
#   bash infrastructure/vm/scripts/checks/verify-backup.sh              # newest backup
#   BACKUP=./backups/20260101T000000Z ./verify-backup.sh         # a specific one
#
# A backup nobody has restored is a guess, but a drill that damages the live
# stack to prove the point is a bad trade. Restoring into scratch targets and
# comparing the result against the running stack answers the same question --
# is everything in there, and does it come back out -- at no risk.
#
# What this does NOT cover: restore-backup.sh writing over the real stack.
# Exercise that once by hand before the handover.
set -euo pipefail

# scripts/<group>/ is four levels down from the repo root. The guard is
# here because a moved script would otherwise run against the wrong
# directory and fail somewhere further on, or quietly do nothing.
cd "$(dirname "$0")/../../../.."
[ -f docker-compose.prod.yml ] || { echo "ERROR: $PWD is not the repo root" >&2; exit 1; }
COMPOSE="${COMPOSE:-docker compose -f docker-compose.prod.yml --env-file .env.prod}"
set -a
# shellcheck source=/dev/null
. ./.env.prod
set +a
: "${POSTGRES_USER:?}"; : "${POSTGRES_DB:?}"

BACKUP_DIR="${BACKUP_DIR:-./backups}"
BACKUP="${BACKUP:-$(find "$BACKUP_DIR" -maxdepth 1 -mindepth 1 -type d -name '[0-9]*Z' 2>/dev/null | sort | tail -1)}"
PG_IMAGE="${PG_IMAGE:-postgres:16-alpine}"
ALPINE_IMAGE="${ALPINE_IMAGE:-alpine:3.21}"

SCRATCH_DB="rdp-verify-db-$$"
SCRATCH_VOL="rdp-verify-media-$$"
cleanup() {
  docker rm -f "$SCRATCH_DB"      > /dev/null 2>&1 || true
  docker volume rm "$SCRATCH_VOL" > /dev/null 2>&1 || true
}
trap cleanup EXIT

pass=0; fail=0
ok()  { echo "  PASS  $*"; pass=$((pass + 1)); }
bad() { echo "  FAIL  $*"; fail=$((fail + 1)); }

if [ -z "$BACKUP" ] || [ ! -d "$BACKUP" ]; then
  echo "no backup found in ${BACKUP_DIR}" >&2; exit 1
fi
echo "Verifying ${BACKUP}"
echo

echo "== the live stack, for comparison =="
live_rows=$($COMPOSE exec -T db psql -tAq -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c \
  "select 'stories=' || (select count(*) from stories)
       || ' datasets=' || (select count(*) from datasets)
       || ' files=' || (select count(*) from files);")
live_media=$(docker run --rm -v "rdp-prod_media:/m:ro" "$ALPINE_IMAGE" sh -c \
  'printf "files=%s bytes=%s" "$(find /m -type f | wc -l)" "$(find /m -type f -exec cat {} + | wc -c)"')
echo "  db    ${live_rows}"
echo "  media ${live_media}"
echo

echo "== restore the backup into a scratch postgres =="
docker run -d --name "$SCRATCH_DB" -e POSTGRES_PASSWORD=verify "$PG_IMAGE" > /dev/null
for _ in $(seq 1 30); do
  docker exec "$SCRATCH_DB" pg_isready -U postgres > /dev/null 2>&1 && break
  sleep 1
done
docker exec "$SCRATCH_DB" psql -v ON_ERROR_STOP=1 -U postgres -c \
  "CREATE DATABASE verify;" > /dev/null
if docker exec -i "$SCRATCH_DB" pg_restore --no-owner --no-privileges \
     -U postgres -d verify < "${BACKUP}/db.dump" > /dev/null 2>&1; then
  ok "db.dump restored into an empty postgres"
else
  bad "db.dump failed to restore"
fi
restored_rows=$(docker exec "$SCRATCH_DB" psql -tAq -U postgres -d verify -c \
  "select 'stories=' || (select count(*) from stories)
       || ' datasets=' || (select count(*) from datasets)
       || ' files=' || (select count(*) from files);" 2>/dev/null || echo "unreadable")
echo "  restored db ${restored_rows}"
if [ "$restored_rows" = "$live_rows" ]; then
  ok "row counts match the live database"
else
  bad "row counts differ: live [${live_rows}] vs restored [${restored_rows}]"
fi
echo

echo "== extract the media archive into a scratch volume =="
docker volume create "$SCRATCH_VOL" > /dev/null
docker run --rm -i -v "${SCRATCH_VOL}:/m" "$ALPINE_IMAGE" \
  tar -xzf - -C /m < "${BACKUP}/media.tar.gz"
restored_media=$(docker run --rm -v "${SCRATCH_VOL}:/m:ro" "$ALPINE_IMAGE" sh -c \
  'printf "files=%s bytes=%s" "$(find /m -type f | wc -l)" "$(find /m -type f -exec cat {} + | wc -c)"')
echo "  restored media ${restored_media}"
if [ "$restored_media" = "$live_media" ]; then
  ok "media file count and total bytes match the live volume"
else
  bad "media differs: live [${live_media}] vs restored [${restored_media}]"
fi

# Ownership matters: Strapi runs as uid 1001 and cannot write into a volume
# restored as root.
# busybox find has no -printf, so stat does the work.
owner=$(docker run --rm -v "${SCRATCH_VOL}:/m:ro" "$ALPINE_IMAGE" sh -c \
  'find /m -type f -exec stat -c "%u:%g" {} + | sort -u | tr "\n" " "')
echo "  restored ownership ${owner}"
case "$owner" in
  *1001:1001*) ok "uploads restored owned by uid 1001" ;;
  *)           bad "uploads restored with unexpected ownership: ${owner}" ;;
esac

echo
echo "verify: ${pass} passed, ${fail} failed"
[ "$fail" -eq 0 ]
