#!/usr/bin/env bash
# Runs migrate-media-from-gcs.mjs inside a Node container with the upload
# volume mounted. Needs only Docker on the host -- no Node, no gcloud.
#
# The script is piped in on stdin rather than bind-mounted, and the only mount
# is a named volume, so this works unchanged against a remote daemon:
#
#   docker context create rdp --docker host=ssh://user@vm
#   DOCKER_CONTEXT=rdp ./migrate-media-from-gcs.sh
set -euo pipefail

VOLUME="${VOLUME:-rdp-prod_media}"
NODE_IMAGE="${NODE_IMAGE:-node:22-alpine}"

exec docker run --rm -i \
  -v "${VOLUME}:/uploads" \
  -e "BUCKET=${BUCKET:-rdp-staging-media}" \
  -e MEDIA_DIR=/uploads \
  "$NODE_IMAGE" \
  node --input-type=module < "$(dirname "$0")/migrate-media-from-gcs.mjs"
