#!/usr/bin/env bash
# [ops] daily at 03:15 from cron, or by hand. Prunes past RETENTION_KEEP.
#
# Point-in-time backup of everything on the VM that cannot be rebuilt: the
# database and the Strapi upload volume.
#
#   bash infrastructure/vm/scripts/ops/backup.sh
#   BACKUP_DIR=/var/backups/rdp RETENTION_KEEP=30 ./backup.sh     # cron form
#
# Not backed up, deliberately:
#   tilecache  - regenerable; nginx refetches on a miss.
#   certs      - certbot owns these on the host, outside the stack.
#   cmsdata    - the import-export plugin's own dumps, derived from the db.
#
# Everything streams to this script's stdout and is redirected here, so there
# are no bind mounts and the whole thing works unchanged against a remote
# daemon (DOCKER_CONTEXT=rdp), writing to whichever machine invoked it.
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
: "${POSTGRES_USER:?set in .env.prod}"
: "${POSTGRES_DB:?set in .env.prod}"

BACKUP_DIR="${BACKUP_DIR:-./backups}"
MEDIA_VOLUME="${MEDIA_VOLUME:-rdp-prod_media}"
ALPINE_IMAGE="${ALPINE_IMAGE:-alpine:3.21}"
# Count-based, not age-based: a stack that stops producing backups should not
# also quietly delete the ones it has.
RETENTION_KEEP="${RETENTION_KEEP:-14}"

stamp=$(date -u +%Y%m%dT%H%M%SZ)
# Built under .partial and renamed only on success, so an interrupted or
# failed run can never leave something that looks like a usable backup.
work="${BACKUP_DIR}/.partial-${stamp}"
dest="${BACKUP_DIR}/${stamp}"
mkdir -p "$work"
trap 'rm -rf "$work"' EXIT

echo "Dumping ${POSTGRES_DB}..."
$COMPOSE exec -T db pg_dump --format=custom --no-owner --no-privileges \
  -U "$POSTGRES_USER" -d "$POSTGRES_DB" > "${work}/db.dump"

echo "Archiving the upload volume..."
docker run --rm -v "${MEDIA_VOLUME}:/media:ro" "$ALPINE_IMAGE" \
  tar -czf - -C /media . > "${work}/media.tar.gz"

# A manifest makes a backup auditable without restoring it: if the file count
# drops to zero one night, that is visible here.
{
  echo "created      $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "database     ${POSTGRES_DB}"
  echo "db_bytes     $(wc -c < "${work}/db.dump")"
  echo "media_bytes  $(wc -c < "${work}/media.tar.gz")"
  echo "media_files  $(tar -tzf "${work}/media.tar.gz" | grep -vc '/$')"
} > "${work}/manifest.txt"

mv "$work" "$dest"
trap - EXIT
echo "Backup complete: ${dest}"
sed 's/^/  /' "${dest}/manifest.txt"

# Prune only complete backups, and only after this one succeeded.
mapfile -t old < <(find "$BACKUP_DIR" -maxdepth 1 -mindepth 1 -type d \
  -name '[0-9]*Z' -printf '%f\n' | sort | head -n "-${RETENTION_KEEP}")
for dir in "${old[@]:-}"; do
  [ -n "$dir" ] || continue
  echo "Pruning old backup ${dir}"
  rm -rf "${BACKUP_DIR:?}/${dir}"
done
