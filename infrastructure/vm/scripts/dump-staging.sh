#!/usr/bin/env bash
# Custom-format dump of staging Cloud SQL through the bastion tunnel (see
# README); needs PGPASSWORD set.
#
# PG16 client, not 17: PG17's pg_dump emits `SET transaction_timeout = 0;`,
# which the PG16 restore target rejects. Staging is PG14, and newer client
# against older server is the supported direction.
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
