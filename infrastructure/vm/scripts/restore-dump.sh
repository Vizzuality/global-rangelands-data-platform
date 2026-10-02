#!/usr/bin/env bash
# Restores a custom-format dump into the running db container.
# Destructive: drops and recreates the target database.
set -euo pipefail

: "${DUMP:?set DUMP to a .dump path}"
: "${POSTGRES_USER:?}"
: "${POSTGRES_DB:?}"
COMPOSE="${COMPOSE:-docker compose -f docker-compose.prod.yml --env-file .env.prod}"

[ -f "$DUMP" ] || { echo "ERROR: no such dump: $DUMP" >&2; exit 1; }

echo "Stopping cms so it releases its connections..."
$COMPOSE stop cms

echo "Recreating ${POSTGRES_DB}..."
# WITH (FORCE) needs PG13+ and terminates lingering connections; stopping cms
# first is belt and braces, because config-sync holds a pool open.
$COMPOSE exec -T db psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d postgres -c \
  "DROP DATABASE IF EXISTS \"${POSTGRES_DB}\" WITH (FORCE);"
$COMPOSE exec -T db psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d postgres -c \
  "CREATE DATABASE \"${POSTGRES_DB}\" OWNER \"${POSTGRES_USER}\";"

echo "Restoring $DUMP ..."
# pg_restore runs inside the container so no host client version is involved.
$COMPOSE exec -T db pg_restore --no-owner --no-privileges --verbose \
  -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$DUMP"

echo "Starting cms..."
$COMPOSE start cms
echo "Done. config-sync import runs on boot; watch the logs."
