#!/usr/bin/env bash
# certbot --deploy-hook: publish a renewed certificate into the nginx
# container. Runs as root, once per successful issuance or renewal, with
# RENEWED_LINEAGE set by certbot to /etc/letsencrypt/live/<name>.
#
# Without this, renewal is a no-op that reports success: certbot writes a new
# file, reloads a host nginx that does not exist, and exits 0 while the
# container serves the old certificate until something restarts it. It
# surfaces as an expired-certificate warning months later.
#
# Two details the obvious implementation gets wrong:
#
#   - RENEWED_LINEAGE holds RELATIVE symlinks into ../../archive/, so the
#     WHOLE of /etc/letsencrypt must be mounted or the links dangle and the
#     copy fails; `cp -L` then reads through them. The mount POINT is
#     irrelevant to that (measured, the tree works at /le) -- it is
#     /etc/letsencrypt here because RENEWED_LINEAGE is an absolute host path
#     used verbatim inside the container.
#   - `exec -T`: a deploy hook has no TTY, and without -T the reload fails.
set -euo pipefail

: "${RENEWED_LINEAGE:?must be run by certbot --deploy-hook}"
PROJECT_DIR="${PROJECT_DIR:-/opt/rdp}"
CERTS_VOLUME="${CERTS_VOLUME:-rdp-prod_certs}"

docker run --rm \
  -v "${CERTS_VOLUME}:/certs" \
  -v /etc/letsencrypt:/etc/letsencrypt:ro \
  alpine:3 sh -c \
  "cp -L '${RENEWED_LINEAGE}/fullchain.pem' '${RENEWED_LINEAGE}/privkey.pem' /certs/"

docker compose -f "${PROJECT_DIR}/docker-compose.prod.yml" \
  --env-file "${PROJECT_DIR}/.env.prod" exec -T nginx nginx -s reload

echo "cert-deploy-hook: published $(basename "${RENEWED_LINEAGE}") and reloaded nginx"
