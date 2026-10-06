#!/usr/bin/env bash
# Measures the tile cache under a realistic pan/zoom load, and checks what
# happens to it when the tiler goes away.
#
#   bash infrastructure/vm/scripts/load-tile-cache.sh
#   GRID=6 ZOOMS="5 6 7" CONCURRENCY=12 ./load-tile-cache.sh
#
# COSTS MONEY. Every cold tile is an Earth Engine call against a metered
# quota, so the defaults are deliberately modest (2 zooms x GRID^2 tiles) and
# the warm pass reuses the same URLs rather than generating new ones. Raise
# GRID only when you mean to.
#
# The tiles cover East Africa, where the rangelands layers actually have data;
# an empty ocean tile compresses to a few hundred bytes and would make the
# cache look far smaller than it will be.
set -euo pipefail

cd "$(dirname "$0")/../../.."
COMPOSE="${COMPOSE:-docker compose -f docker-compose.prod.yml --env-file .env.prod}"
BASE="${BASE:-https://127.0.0.1}"
TILESET="${TILESET:-anthropogenic_biomes}"
ZOOMS="${ZOOMS:-5 6}"
GRID="${GRID:-4}"
CONCURRENCY="${CONCURRENCY:-8}"
NONCE="${NONCE:-$(date +%s%N)}"

work=$(mktemp -d); trap 'rm -rf "$work"' EXIT
pass=0; fail=0
ok()  { echo "  PASS  $*"; pass=$((pass + 1)); }
bad() { echo "  FAIL  $*"; fail=$((fail + 1)); }

# Centre on East Africa (lon 35, lat 0) and walk a GRID x GRID block from there.
urls() {
  local z x y cx cy
  for z in $ZOOMS; do
    cx=$(awk -v z="$z" 'BEGIN{printf "%d", (35+180)/360 * 2^z}')
    cy=$(awk -v z="$z" 'BEGIN{printf "%d", 2^z/2}')
    for ((x = cx; x < cx + GRID; x++)); do
      for ((y = cy; y < cy + GRID; y++)); do
        echo "${BASE}/functions/eet/${z}/${x}/${y}?tileset=${TILESET}&run=${NONCE}"
      done
    done
  done
}

# One tile -> one line: cache-status  http-code  seconds  bytes
# Done in a helper so each line is emitted whole; parsing a shared interleaved
# stream under -P would mix responses together.
fetch_one() {
  local out cache
  out=$(curl -sk -o /dev/null -D - \
          -w '\n%{http_code}\t%{time_total}\t%{size_download}' "$1" 2>/dev/null)
  cache=$(printf '%s' "$out" | awk 'tolower($1)=="x-cache-status:"{print $2}' | tr -d '\r')
  printf '%s\t%s\n' "${cache:-NONE}" "$(printf '%s' "$out" | tail -1)"
}
export -f fetch_one

fetch_all() {
  xargs -P "$CONCURRENCY" -I{} bash -c 'fetch_one "$@"' _ {}
}

# mawk on Ubuntu has no asort, so percentiles come from sort(1).
percentile() { # <file> <column> <fraction>
  local n idx
  n=$(wc -l < "$1"); [ "$n" -gt 0 ] || { echo "0"; return; }
  idx=$(awk -v n="$n" -v f="$3" 'BEGIN{i=int(n*f); print (i<1?1:i)}')
  cut -f"$2" "$1" | sort -n | sed -n "${idx}p"
}

summarise() { # <file> <label>
  local n bytes mean med p95
  n=$(wc -l < "$1")
  [ "$n" -gt 0 ] || { echo "  no samples"; return; }
  bytes=$(awk -F'\t' '{b+=$4} END{print b+0}' "$1")
  mean=$(awk -F'\t' -v n="$n" '{b+=$4} END{printf "%d", b/n}' "$1")
  med=$(percentile "$1" 3 0.5)
  p95=$(percentile "$1" 3 0.95)
  printf '  %-5s n=%d  median=%ss  p95=%ss  bytes=%d  mean_tile=%db\n' \
         "$2" "$n" "$med" "$p95" "$bytes" "$mean"
  cut -f1 "$1" | sort | uniq -c | awk '{printf "         %-10s %s\n", $2, $1}'
}

mapfile -t ALL < <(urls)
echo "Tiles per pass: ${#ALL[@]}  (zooms: ${ZOOMS}, grid: ${GRID}x${GRID}, tileset: ${TILESET})"
echo

echo "== pass 1: cold =="
printf '%s\n' "${ALL[@]}" | fetch_all > "$work/cold.tsv"
summarise "$work/cold.tsv" cold
cold_miss=$(awk -F'\t' '$1=="MISS"' "$work/cold.tsv" | wc -l)
cold_200=$(awk -F'\t' '$2=="200"' "$work/cold.tsv" | wc -l)
if [ "$cold_200" -eq "${#ALL[@]}" ]; then
  ok "every cold tile returned 200"
else
  bad "only ${cold_200}/${#ALL[@]} cold tiles returned 200"
fi

echo
echo "== pass 2: warm =="
printf '%s\n' "${ALL[@]}" | fetch_all > "$work/warm.tsv"
summarise "$work/warm.tsv" warm
warm_hit=$(awk -F'\t' '$1=="HIT"' "$work/warm.tsv" | wc -l)
echo "  hit ratio: ${warm_hit}/${#ALL[@]} on the second pass (cold pass had ${cold_miss} MISS)"
if [ "$warm_hit" -eq "${#ALL[@]}" ]; then
  ok "every tile served from cache on the second pass"
else
  bad "${warm_hit}/${#ALL[@]} hits — some tiles were not retained"
fi

cold_med=$(awk -F'\t' '{s+=$3; n++} END{printf "%.3f", s/n}' "$work/cold.tsv")
warm_med=$(awk -F'\t' '{s+=$3; n++} END{printf "%.3f", s/n}' "$work/warm.tsv")
echo "  mean latency: cold ${cold_med}s -> warm ${warm_med}s"

echo
echo "== cache sizing, projected from measured tile sizes =="
mean_tile=$(awk -F'\t' '{b+=$4; n++} END{printf "%d", b/n}' "$work/cold.tsv")
[ "$mean_tile" -gt 0 ] || mean_tile=1
# nginx documents roughly 8000 keys per megabyte of keys_zone.
keys_capacity=$((100 * 8000))
bytes_capacity=$((30 * 1024 * 1024 * 1024))
by_bytes=$((bytes_capacity / mean_tile))
# The two ceilings cross at this mean tile size; below it the key zone binds,
# above it max_size does.
crossover=$((bytes_capacity / keys_capacity))
echo "  mean tile on this sample:  ${mean_tile} bytes"
echo "  max_size=30g would hold:   ${by_bytes} tiles at that size"
echo "  keys_zone=100m indexes:    ${keys_capacity} keys"
echo "  the two limits cross at a mean tile of ${crossover} bytes"
if [ "$by_bytes" -gt "$keys_capacity" ]; then
  echo "  => keys_zone binds first: the cache tops out near ${keys_capacity} tiles"
  echo "     (~$((keys_capacity * mean_tile / 1024 / 1024)) MB), well under max_size."
else
  echo "  => max_size binds first: the cache tops out near ${by_bytes} tiles."
fi

echo
echo "== resilience: cached tiles while the tiler is down =="
warm_url="${ALL[0]}"
cold_url="${BASE}/functions/eet/8/150/128?tileset=${TILESET}&run=${NONCE}-down"
$COMPOSE stop tiler > /dev/null 2>&1
trap '$COMPOSE start tiler > /dev/null 2>&1; rm -rf "$work"' EXIT
sleep 1
down_warm=$(curl -sk -o /dev/null -w '%{http_code}' "$warm_url")
down_cold=$(curl -sk -o /dev/null -w '%{http_code}' "$cold_url")
$COMPOSE start tiler > /dev/null 2>&1
trap 'rm -rf "$work"' EXIT
echo "  already-cached tile: HTTP ${down_warm}"
echo "  uncached tile:       HTTP ${down_cold}"
if [ "$down_warm" = "200" ]; then
  ok "cached tiles keep serving through a tiler outage"
else
  bad "cached tile returned ${down_warm} with the tiler down"
fi
if [ "$down_cold" != "200" ]; then
  ok "uncached tiles fail honestly (${down_cold}) rather than serving something wrong"
else
  bad "uncached tile returned 200 with the tiler stopped"
fi

echo
echo "load: ${pass} passed, ${fail} failed"
[ "$fail" -eq 0 ]
