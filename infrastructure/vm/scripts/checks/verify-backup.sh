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
LIVE_ROWS="$(mktemp)"
RESTORED_ROWS="$(mktemp)"
cleanup() {
  docker rm -f "$SCRATCH_DB"      > /dev/null 2>&1 || true
  docker volume rm "$SCRATCH_VOL" > /dev/null 2>&1 || true
  rm -f "$LIVE_ROWS" "$RESTORED_ROWS"
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

# Row counts for EVERY public table, rather than three named ones. A hand-
# picked list quietly stops testing what it names as soon as a content type is
# renamed: `stories` became `features` in 2026-09, and because the same literal
# was interpolated into both sides, the query failed on both and `set -e`
# aborted the drill before it printed anything. Counting whatever is actually
# there also catches a table the restore dropped outright, which naming three
# never could.
#
# query_to_xml is the portable way to count a table whose name is only known at
# runtime. It needs a libxml-enabled Postgres, which postgres:16-alpine is;
# confirmed against the VM on 2026-10-09.
ROW_SQL="select relname || '=' || (xpath('/row/c/text()',
           query_to_xml(format('select count(*) as c from public.%I', relname),
                        false, true, '')))[1]::text
         from pg_stat_user_tables where schemaname = 'public' order by relname;"
tally() { awk -F= '{n += $2} END {printf "%d tables, %d rows", NR, n}' "$1"; }

echo "== the live stack, for comparison =="
$COMPOSE exec -T db psql -tAq -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "$ROW_SQL" \
  | sed '/^$/d' > "$LIVE_ROWS"
live_rows="$(tally "$LIVE_ROWS")"
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
docker exec "$SCRATCH_DB" psql -tAq -U postgres -d verify -c "$ROW_SQL" 2>/dev/null \
  | sed '/^$/d' > "$RESTORED_ROWS" || true
restored_rows="$(tally "$RESTORED_ROWS")"
echo "  restored db ${restored_rows}"
if diff -q "$LIVE_ROWS" "$RESTORED_ROWS" > /dev/null 2>&1; then
  ok "every table matches the live database (${live_rows})"
else
  bad "row counts differ: live [${live_rows}] vs restored [${restored_rows}]"
  # Name the tables, so a benign difference can be told from a lost one. A
  # backup taken before someone touched the admin legitimately differs in
  # strapi_history_versions; a missing content table does not.
  diff "$LIVE_ROWS" "$RESTORED_ROWS" | grep -E '^[<>]' | sed 's/^/        /' | head -20
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
