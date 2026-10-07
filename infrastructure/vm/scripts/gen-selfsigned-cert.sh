#!/usr/bin/env bash
# Write a throwaway certificate pair into OUT_DIR, under the two names nginx
# expects. Used locally, and as the first step on a VM with no certificate
# yet: nginx will not start without one, so nothing serves the ACME challenge
# that would earn it a real one. certbot's deploy hook overwrites both files
# on first issuance -- it copies them in, never bind-mounts certbot's live
# directory; see cert-deploy-hook.sh.
set -euo pipefail

: "${SERVER_NAME:=localhost}"
: "${OUT_DIR:?set OUT_DIR}"

mkdir -p "$OUT_DIR"
openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
  -keyout "${OUT_DIR}/privkey.pem" \
  -out    "${OUT_DIR}/fullchain.pem" \
  -subj   "/CN=${SERVER_NAME}" \
  -addext "subjectAltName=DNS:${SERVER_NAME},DNS:localhost,DNS:alias.localhost,IP:127.0.0.1"

echo "Wrote ${OUT_DIR}/fullchain.pem and ${OUT_DIR}/privkey.pem"
