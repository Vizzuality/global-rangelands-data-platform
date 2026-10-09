#!/usr/bin/env bash
# [ops] once per release. Restarts containers. Prints a rollback command
# on failure; it does not roll back for you.
#
# Put a release onto this box: pull, verify, start, reload nginx, smoke-test.
#
# Deploy a version generate-release.yml already built and pushed into this
# machine's registry. Check out the matching tag first, so the bind-mounted
# nginx config comes from the same tree as the images:
#
#   git checkout v1.2.0
#   RELEASE_TAG=v1.2.0 SKIP_BUILD=1 bash .../deploy-release.sh
#
# Rolling back is the same command naming an older tag. With no RELEASE_TAG it
# BUILDS here and pushes what it builds -- the fallback for when GitHub is
# unreachable.
#
# Each step exists because leaving it out has already cost time:
#
#   - Image hygiene runs BEFORE the push. Once a layer carrying an env file
#     is in a registry, deleting the tag does not recall what was pulled.
#   - nginx is reloaded AFTER the containers come up. Recreated containers
#     get new IPs and nginx caches its upstream resolution from startup, so
#     without this every route 502s while all five services report healthy.
#   - The smoke test runs last and through nginx, not against the containers,
#     because the 502 above is invisible to a container health check.
#
# Run this ON the VM. The compose file bind-mounts nginx.conf, the template
# directory and healthcheck.js from the repo; over a remote context those
# paths do not exist and Docker mounts an empty directory instead of erroring.
# DOCKER_CONTEXT is honoured for inspection, not for deploys.
set -euo pipefail

# scripts/<group>/ is four levels down from the repo root. The guard is
# here because a moved script would otherwise run against the wrong
# directory and fail somewhere further on, or quietly do nothing.
cd "$(dirname "$0")/../../../.."
[ -f docker-compose.prod.yml ] || { echo "ERROR: $PWD is not the repo root" >&2; exit 1; }
ENV_FILE="${ENV_FILE:-.env.prod}"
COMPOSE="${COMPOSE:-docker compose -f docker-compose.prod.yml --env-file ${ENV_FILE}}"
export IMAGE_PREFIX="${IMAGE_PREFIX:-127.0.0.1:5000/}"
SERVICES="${SERVICES:-cms client tiler}"
BASE="${BASE:-https://127.0.0.1}"
SKIP_BUILD="${SKIP_BUILD:-0}"
SKIP_PUSH="${SKIP_PUSH:-0}"

# Only paths that end up in an image count as dirty. terraform.tfvars and
# notes in the repo root do not change what is built.
BUILD_PATHS="client cms cloud_functions docker-compose.prod.yml"

if [ -z "${RELEASE_TAG:-}" ]; then
  stamp=$(date -u +%Y%m%dT%H%M%SZ)
  sha=$(git rev-parse --short HEAD)
  # shellcheck disable=SC2086
  if [ -n "$(git status --porcelain -- $BUILD_PATHS)" ]; then
    echo "WARNING: uncommitted changes under: ${BUILD_PATHS}"
    echo "         tagging -dirty; this release is not reproducible from git."
    RELEASE_TAG="${stamp}-${sha}-dirty"
  else
    RELEASE_TAG="${stamp}-${sha}"
  fi
fi
export IMAGE_TAG="$RELEASE_TAG"

# Captured before anything changes, so the rollback hint at the end is real.
# Only a tag that is IN THE REGISTRY is offered -- a bare `:local` is a build
# that exists on one machine, so suggesting it would hand over a command that
# cannot work. Two shapes qualify: a release version from .github/workflows/
# generate-release.yml, and a stamped tag from an ad-hoc run of this script.
previous=$($COMPOSE ps --format '{{.Image}}' 2>/dev/null \
           | grep -oE 'rdp-client:[^ ]+' | cut -d: -f2 | head -1 || true)
case "$previous" in
  [0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]T[0-9][0-9][0-9][0-9][0-9][0-9]Z-*) ;;
  v[0-9]*) ;;
  *) previous="" ;;
esac

echo "=============================================="
echo " release ${IMAGE_TAG}"
echo " registry ${IMAGE_PREFIX:-<none>}"
echo " context  ${DOCKER_CONTEXT:-default}"
echo "=============================================="

if [ "$SKIP_BUILD" = "1" ]; then
  # A rollback names a tag that lives in the registry, not necessarily on this
  # machine, so fetch it before anything inspects it. Nothing to push after,
  # since the registry is where it came from.
  echo
  echo "-- 1. build: skipped, pulling ${IMAGE_TAG} --"
  # shellcheck disable=SC2086
  $COMPOSE pull $SERVICES
  SKIP_PUSH=1
else
  echo
  echo "-- 1. build --"
  # shellcheck disable=SC2086
  $COMPOSE build $SERVICES
fi

echo
echo "-- 2. image hygiene --"
# Blocking by default: an image carrying an env file should not reach a
# registry or a running stack. But refusing an emergency rollback is worse
# than the thing being prevented -- and a tag predating the STRIP_ENV_FILES
# change will always fail this. The override is deliberately verbose so it
# cannot be used by accident or by habit.
if ! bash infrastructure/vm/scripts/checks/verify-image-hygiene.sh; then
  if [ "${ALLOW_UNCLEAN_IMAGES:-0}" = "1" ]; then
    echo
    echo "  !! proceeding anyway: ALLOW_UNCLEAN_IMAGES=1"
    echo "  !! these images carry configuration they should be given at runtime."
    echo "  !! on this stack compose values take precedence, so the baked file"
    echo "  !! is inert -- but roll forward to a clean tag when the fire is out."
  else
    echo
    echo "RELEASE STOPPED: images failed hygiene."
    echo "If this is an emergency rollback to a tag predating the fix, re-run with"
    echo "  ALLOW_UNCLEAN_IMAGES=1 RELEASE_TAG=${IMAGE_TAG} SKIP_BUILD=1 $0"
    exit 1
  fi
fi

if [ "$SKIP_PUSH" = "1" ] || [ -z "$IMAGE_PREFIX" ]; then
  echo
  echo "-- 3. push: skipped --"
else
  echo
  echo "-- 3. push --"
  # shellcheck disable=SC2086
  $COMPOSE push $SERVICES
fi

echo
echo "-- 4. deploy --"
$COMPOSE up -d --wait

# Record what is running, in the file compose reads by default.
#
# Without this the stack's identity lives only in this shell. IMAGE_TAG
# defaults to `local` in docker-compose.prod.yml, so ANY later compose command
# that does not set it -- `docker compose up -d --force-recreate nginx` to pick
# up a config change, say -- silently re-resolves every service to rdp-*:local
# and recreates the stack from whatever happens to be on the host. That has
# already happened once on the VM: the running containers stopped matching the
# released tag and the box no longer recorded which commit it served.
#
# Written after `up --wait` succeeds, so the file only ever claims a tag the
# stack really came up on.
if [ -f "$ENV_FILE" ]; then
  for pair in "IMAGE_TAG=${IMAGE_TAG}" "IMAGE_PREFIX=${IMAGE_PREFIX}"; do
    key=${pair%%=*}
    if grep -q "^${key}=" "$ENV_FILE"; then
      sed -i "s|^${key}=.*|${pair}|" "$ENV_FILE"
    else
      printf '%s\n' "$pair" >> "$ENV_FILE"
    fi
  done
  # sed -i writes a new inode; this file holds every secret on the box.
  chmod 600 "$ENV_FILE"
  echo "   recorded IMAGE_TAG=${IMAGE_TAG} in ${ENV_FILE}"
fi

echo
echo "-- 5. reload nginx --"
# Without this the stack is healthy and the site is down.
$COMPOSE exec -T nginx nginx -s reload
sleep 2

echo
echo "-- 6. smoke test, through nginx --"
fail=0
check() { # <path> <expected>
  local code
  code=$(curl -sk -o /dev/null -w '%{http_code}' --max-time 20 "${BASE}$1")
  if [ "$code" = "$2" ]; then
    printf '   ok   %-14s %s\n' "$1" "$code"
  else
    printf '   FAIL %-14s %s (expected %s)\n' "$1" "$code" "$2"
    fail=$((fail + 1))
  fi
}
check /en 200
check /en/map 200
check /cms/admin 200
check /cms/_health 204

echo
if [ "$fail" -ne 0 ]; then
  echo "RELEASE FAILED smoke test: ${fail} check(s)"
  [ -n "$previous" ] && echo "roll back with: RELEASE_TAG=${previous} SKIP_BUILD=1 $0"
  exit 1
fi

echo "released ${IMAGE_TAG}"
if [ -n "$previous" ] && [ "$previous" != "$IMAGE_TAG" ]; then
  echo "roll back with: RELEASE_TAG=${previous} SKIP_BUILD=1 $0"
fi
