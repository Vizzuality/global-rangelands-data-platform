#!/usr/bin/env bash
# Restores a backup produced by backup.sh, in place, over the running stack.
# Destructive: drops the database and empties the upload volume first.
#
#   BACKUP=./backups/20260101T000000Z bash infrastructure/vm/scripts/restore-backup.sh
#
# Restoring only the database would leave the uploads out of step with the
# files table -- rows pointing at files that are not there. Both halves come
# from the same backup directory for that reason.
set -euo pipefail

cd "$(dirname "$0")/../../.."
COMPOSE="${COMPOSE:-docker compose -f docker-compose.prod.yml --env-file .env.prod}"
set -a
# shellcheck source=/dev/null
. ./.env.prod
set +a
: "${POSTGRES_USER:?set in .env.prod}"
: "${POSTGRES_DB:?set in .env.prod}"
: "${BACKUP:?set BACKUP to a backup directory}"

MEDIA_VOLUME="${MEDIA_VOLUME:-rdp-prod_media}"
ALPINE_IMAGE="${ALPINE_IMAGE:-alpine:3.21}"

[ -f "${BACKUP}/db.dump" ]       || { echo "ERROR: no db.dump in ${BACKUP}" >&2; exit 1; }
[ -f "${BACKUP}/media.tar.gz" ]  || { echo "ERROR: no media.tar.gz in ${BACKUP}" >&2; exit 1; }

# Fail before touching anything if either artefact is corrupt.
echo "Checking the backup is readable..."
docker run --rm -i "$ALPINE_IMAGE" tar -tzf - < "${BACKUP}/media.tar.gz" > /dev/null
echo "  ok"

echo "Stopping cms so it releases its connections..."
$COMPOSE stop cms

echo "Recreating ${POSTGRES_DB}..."
$COMPOSE exec -T db psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d postgres -c \
  "DROP DATABASE IF EXISTS \"${POSTGRES_DB}\" WITH (FORCE);"
$COMPOSE exec -T db psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d postgres -c \
  "CREATE DATABASE \"${POSTGRES_DB}\" OWNER \"${POSTGRES_USER}\";"

echo "Restoring the database..."
$COMPOSE exec -T db pg_restore --no-owner --no-privileges \
  -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "${BACKUP}/db.dump"

# Replace rather than merge: a merge would leave files deleted since the
# backup still present, which is not the state the backup describes. tar runs
# as root and the archive records uid 1001, so ownership is restored with it.
echo "Replacing the upload volume..."
docker run --rm -i -v "${MEDIA_VOLUME}:/media" "$ALPINE_IMAGE" \
  sh -c 'find /media -mindepth 1 -delete && tar -xzf - -C /media' \
  < "${BACKUP}/media.tar.gz"

echo "Starting cms..."
$COMPOSE start cms

# Without this every /cms/ route 502s while all five containers report
# healthy. nginx resolves its upstreams once at startup and caches the
# addresses, and the cms container restarted above may come back on a
# different one -- the failure mode in RUNBOOK section 7.1, which this
# script was itself creating. Measured during the 2026-10-08 rehearsal:
# /en and /en/map stayed 200 while /cms/admin and /cms/_health returned
# 502 until the reload.
echo "Reloading nginx so it re-resolves cms..."
$COMPOSE exec -T nginx nginx -s reload
sleep 2

echo "Restored from ${BACKUP}. config-sync import runs on boot; watch the logs."
