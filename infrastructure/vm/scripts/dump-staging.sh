#!/usr/bin/env bash
# Fresh custom-format dump of staging Cloud SQL, taken through the bastion tunnel.
#
# Runs pg_dump inside postgres:16-alpine rather than using a host client. The
# version matters: a PG17 pg_dump emits `SET transaction_timeout = 0;`, which
# PostgreSQL 16 does not understand, so the restore into our PG16 target would
# abort. Staging is PG14; a newer client against an older server is supported,
# an older client against a newer one is not, so 16 is the only correct choice.
#
# Requires: an open tunnel to the Cloud SQL instance (see README), and
# PGPASSWORD in the environment.
set -euo pipefail

: "${PGHOST:=127.0.0.1}"
: "${PGPORT:=5432}"
: "${PGUSER:?set PGUSER}"
: "${PGDATABASE:?set PGDATABASE}"
: "${PGPASSWORD:?set PGPASSWORD}"
: "${OUT_DIR:=./dumps}"
: "${PG_IMAGE:=postgres:16-alpine}"

mkdir -p "$OUT_DIR"
stamp=$(date -u +%Y%m%dT%H%M%SZ)
out="${OUT_DIR}/staging-${stamp}.dump"

# --network=host so 127.0.0.1 inside the container is the host's tunnel.
docker run --rm --network=host \
  -e PGPASSWORD \
  -v "$(cd "$OUT_DIR" && pwd):/out" \
  "$PG_IMAGE" \
  pg_dump --format=custom --no-owner --no-privileges --verbose \
          --host="$PGHOST" --port="$PGPORT" \
          --username="$PGUSER" --dbname="$PGDATABASE" \
          --file="/out/$(basename "$out")"

echo "$out"
