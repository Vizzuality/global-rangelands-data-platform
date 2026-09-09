#!/usr/bin/env bash
# Self-signed cert for local verification only. On the VM these two filenames
# are certbot's live directory instead, bind-mounted read-only.
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
