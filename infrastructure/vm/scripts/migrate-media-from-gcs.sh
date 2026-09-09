#!/usr/bin/env bash
# Copies the staging media objects out of GCS onto the local upload volume.
#
# The bucket is public (publicFiles: true in cms/config/plugins.ts), so this
# needs no gcloud credentials -- it works from any machine, including the VM.
#
# Objects are stored one folder per file, <hash><ext>/<hash><ext>. The local
# provider reconstructs paths as uploadPath/<hash><ext> on delete and replace
# (@strapi/provider-upload-local/dist/index.js:96,123,148) and ignores the
# stored url, so files MUST land flat. Preserving the folders would serve reads
# correctly and silently break deletion.
set -euo pipefail

BUCKET="${BUCKET:-rdp-staging-media}"
OUT_DIR="${OUT_DIR:-dumps/media}"
VOLUME="${VOLUME:-rdp-prod_media}"
API="https://storage.googleapis.com/storage/v1/b/${BUCKET}/o"

command -v curl >/dev/null || { echo "curl is required" >&2; exit 1; }
command -v python3 >/dev/null || { echo "python3 is required" >&2; exit 1; }

mkdir -p "$OUT_DIR"

echo "==> listing gs://${BUCKET}"
listing="$(mktemp)"
trap 'rm -f "$listing"' EXIT
token=""
: > "$listing"
while :; do
  page="$(curl -fsS "${API}?fields=items(name,size),nextPageToken&maxResults=1000${token}")"
  printf '%s' "$page" | python3 -c '
import json,sys
for i in json.load(sys.stdin).get("items", []):
    print(i["name"] + "\t" + str(i.get("size", 0)))
' >> "$listing"
  next="$(printf '%s' "$page" | python3 -c 'import json,sys;print(json.load(sys.stdin).get("nextPageToken",""))')"
  [ -n "$next" ] || break
  token="&pageToken=${next}"
done

total=$(wc -l < "$listing")
echo "    ${total} objects"

# Flattening is only safe if basenames are unique. Assert it, do not assume it.
uniq_base=$(awk -F'\t' '{n=$1; sub(/.*\//,"",n); print n}' "$listing" | sort -u | wc -l)
if [ "$uniq_base" -ne "$total" ]; then
  echo "FAIL: ${total} objects but only ${uniq_base} distinct basenames." >&2
  echo "Flattening would overwrite files. Resolve the collisions first:" >&2
  awk -F'\t' '{n=$1; sub(/.*\//,"",n); print n}' "$listing" | sort | uniq -d >&2
  exit 1
fi
echo "    ${uniq_base} distinct basenames, no collisions"

echo "==> downloading into ${OUT_DIR} (flattened)"
downloaded=0
skipped=0
while IFS=$'\t' read -r name size; do
  [ -n "$name" ] || continue
  base="${name##*/}"
  dest="${OUT_DIR}/${base}"
  # Idempotent: re-running only fetches what is missing or the wrong size.
  if [ -f "$dest" ] && [ "$(stat -c%s "$dest")" = "$size" ]; then
    skipped=$((skipped + 1))
    continue
  fi
  # Encode each path segment but keep the separators: object names are
  # user-supplied filenames and may contain spaces or other reserved characters.
  enc=$(python3 -c 'import sys,urllib.parse as u; print(u.quote(sys.argv[1], safe="/"))' "$name")
  curl -fsS -o "$dest" "https://storage.googleapis.com/${BUCKET}/${enc}"
  downloaded=$((downloaded + 1))
done < "$listing"
echo "    downloaded ${downloaded}, already present ${skipped}"

echo "==> verifying sizes against the bucket listing"
bad=0
while IFS=$'\t' read -r name size; do
  [ -n "$name" ] || continue
  dest="${OUT_DIR}/${name##*/}"
  if [ ! -f "$dest" ]; then echo "MISSING: $dest" >&2; bad=$((bad + 1)); continue; fi
  actual=$(stat -c%s "$dest")
  if [ "$actual" != "$size" ]; then
    echo "SIZE MISMATCH: $dest is ${actual}, bucket says ${size}" >&2
    bad=$((bad + 1))
  fi
done < "$listing"
[ "$bad" -eq 0 ] || { echo "FAIL: ${bad} object(s) did not verify" >&2; exit 1; }
echo "    all ${total} objects match the bucket byte counts"

echo "==> loading into volume ${VOLUME}"
docker run --rm -v "${VOLUME}:/m" -v "$(cd "$OUT_DIR" && pwd):/src:ro" alpine \
  sh -c 'cp -f /src/* /m/ && chown -R 1001:1001 /m && ls -1 /m | wc -l'

echo "==> done"
