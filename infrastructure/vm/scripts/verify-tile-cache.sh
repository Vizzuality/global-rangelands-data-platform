#!/usr/bin/env bash
# Verifies the nginx tile cache: MISS then HIT, and request collapsing.
set -euo pipefail

BASE="${BASE:-https://127.0.0.1}"
TILE="${TILE:-/functions/eet/7/64/63?tileset=anthropogenic_biomes}"
COMPOSE="${COMPOSE:-docker compose -f docker-compose.prod.yml --env-file .env.prod}"
CURL="curl -sk"

status() {
  $CURL -o /dev/null -D - "$1" 2>/dev/null \
    | awk 'tolower($1)=="x-cache-status:"{print $2}' | tr -d '\r'
}

# A unique query param so each run starts cold regardless of prior state. That
# a changed param yields a MISS is itself the proof that the query string is
# part of the cache key.
nonce() { printf '&cachetest=%s' "$(date +%s%N)"; }

echo "--- 1. cold then warm ---"
URL="${BASE}${TILE}$(nonce)"
first=$(status "$URL");  echo "first  request: ${first:-<none>}"
second=$(status "$URL"); echo "second request: ${second:-<none>}"

[ "$first" = "MISS" ] || { echo "FAIL: expected MISS first, got '${first}'" >&2; exit 1; }
[ "$second" = "HIT" ] || { echo "FAIL: expected HIT second, got '${second}'" >&2; exit 1; }
echo "PASS: cache stores and serves"

echo "--- 2. request collapsing (proxy_cache_lock) ---"
URL2="${BASE}${TILE}$(nonce)-lock"

# src/index.ts logs "<logId> - Obtained tile URL on <url>" once per upstream fetch.
count_upstream() { $COMPOSE logs tiler 2>/dev/null | grep -c 'Obtained tile URL' || true; }

before=$(count_upstream)
for _ in $(seq 1 10); do $CURL -o /dev/null "$URL2" & done
wait || true
sleep 2
after=$(count_upstream)
delta=$(( after - before ))

echo "10 concurrent cold requests -> ${delta} upstream tile fetches"
if [ "$delta" -le 2 ]; then
  echo "PASS: requests collapsed"
else
  echo "FAIL: ${delta} upstream calls for one tile — proxy_cache_lock not effective" >&2
  exit 1
fi
