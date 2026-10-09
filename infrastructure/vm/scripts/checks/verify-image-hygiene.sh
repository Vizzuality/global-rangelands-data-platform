#!/usr/bin/env bash
# [checks] any time, and in CI. Read-only.
#
# Fails if a VM image carries configuration it should be given at runtime.
#
#   bash infrastructure/vm/scripts/checks/verify-image-hygiene.sh
#   IMAGE_PREFIX=127.0.0.1:5000/ IMAGE_TAG=20260101T000000Z-abc1234 ./verify-image-hygiene.sh
#
# The VM gets every secret from compose's `environment:` block, so nothing
# secret belongs in an image. Two ways one gets in anyway:
#
#   1. `COPY . .` picks up a .env left in the build context. Whoever builds
#      decides what ships, which is not a property you want.
#   2. A value passed as a build arg and restated as ENV persists into the
#      image and shows up in `docker inspect` and `docker history`.
#
# Run this before pushing to any registry. Cloud Run images are a separate
# case and deliberately out of scope -- that deployment has no runtime env
# channel and depends on the baked file (see GRASS-392).
set -euo pipefail

IMAGE_PREFIX="${IMAGE_PREFIX:-}"
IMAGE_TAG="${IMAGE_TAG:-local}"
SERVICES="${SERVICES:-cms client tiler}"

# Names that must never appear in an image's environment with a real value.
SECRET_KEYS="APP_KEYS JWT_SECRET ADMIN_JWT_SECRET API_TOKEN_SALT TRANSFER_TOKEN_SALT DATABASE_PASSWORD DATABASE_URL TRANSIFEX_TOKEN TRANSIFEX_SECRET"

pass=0; fail=0
ok()  { echo "  PASS  $*"; pass=$((pass + 1)); }
bad() { echo "  FAIL  $*"; fail=$((fail + 1)); }

for svc in $SERVICES; do
  image="${IMAGE_PREFIX}rdp-${svc}:${IMAGE_TAG}"
  echo "== ${image} =="
  if ! docker image inspect "$image" > /dev/null 2>&1; then
    bad "image not present locally"
    continue
  fi

  # An empty file is fine: client/Dockerfile.prod touches .env.local so the
  # runner's COPY has something to take on a clean checkout.
  sizes=$(docker run --rm --entrypoint sh "$image" -c \
    'for f in /app/.env /app/.env.local; do [ -f "$f" ] && printf "%s=%s\n" "$f" "$(wc -c < "$f")"; done' 2>/dev/null || true)
  nonempty=$(printf '%s\n' "$sizes" | awk -F= '$2 > 0 {print $1" ("$2" bytes)"}' | tr '\n' ' ')
  if [ -z "$nonempty" ]; then
    ok "no env file with content"
  else
    bad "carries env file content: ${nonempty}"
  fi

  env_json=$(docker image inspect "$image" --format '{{range .Config.Env}}{{println .}}{{end}}')
  leaked=""
  for key in $SECRET_KEYS; do
    value=$(printf '%s\n' "$env_json" | sed -n "s/^${key}=//p" | head -1)
    # A deliberate build placeholder is not a leak; anything else is.
    case "$value" in
      ""|build-only-placeholder) ;;
      *) leaked="${leaked} ${key}" ;;
    esac
  done
  if [ -z "$leaked" ]; then
    ok "no secret-named variable baked into the image environment"
  else
    bad "image environment carries:${leaked}"
  fi
done

echo
echo "image hygiene: ${pass} passed, ${fail} failed"
[ "$fail" -eq 0 ]
