#!/usr/bin/env bash
# [ops] manual, nothing schedules it. Deletes images: DRY_RUN=1 first.
#
# Retention and garbage collection for the VM image registry.
#
#   bash infrastructure/vm/scripts/ops/registry-gc.sh            # keep 10 per repo
#   KEEP=5 DRY_RUN=1 ./registry-gc.sh                        # show what would go
#
# Two steps, and both are needed. Deleting a manifest only unlinks the tag;
# the blobs stay on disk until garbage-collect runs, so a retention policy
# without the second step reclaims nothing.
#
# Tags are expected to sort chronologically -- see the release convention in
# the README, <utc-stamp>-<short-sha>. A bare git sha would sort by hex and
# this would delete essentially at random, so tags that do not match the
# stamped shape are left alone rather than guessed at.
set -euo pipefail

REGISTRY="${REGISTRY:-http://127.0.0.1:5000}"
KEEP="${KEEP:-10}"
DRY_RUN="${DRY_RUN:-0}"
REGISTRY_COMPOSE="${REGISTRY_COMPOSE:-docker compose -f docker-compose.registry.yml}"
REGISTRY_VOLUME="${REGISTRY_VOLUME:-rdp-registry_registrydata}"
REGISTRY_IMAGE="${REGISTRY_IMAGE:-registry:2}"
MANIFEST_ACCEPT="application/vnd.docker.distribution.manifest.v2+json,application/vnd.oci.image.manifest.v1+json,application/vnd.oci.image.index.v1+json"

# scripts/<group>/ is four levels down from the repo root. The guard is
# here because a moved script would otherwise run against the wrong
# directory and fail somewhere further on, or quietly do nothing.
cd "$(dirname "$0")/../../../.."
[ -f docker-compose.prod.yml ] || { echo "ERROR: $PWD is not the repo root" >&2; exit 1; }

# The registry's JSON is a flat list of strings we generate ourselves, so a
# character-class split is enough and avoids depending on jq being installed.
json_list() { tr -d '[]{}"' | tr ',' '\n' | sed 's/^ *//; s/ *$//' | grep -v '^$' || true; }

repos=$(curl -sf "${REGISTRY}/v2/_catalog" | sed 's/.*"repositories"://' | json_list)
[ -n "$repos" ] || { echo "registry at ${REGISTRY} has no repositories"; exit 0; }

deleted=0
for repo in $repos; do
  all_tags=$(curl -sf "${REGISTRY}/v2/${repo}/tags/list" | sed 's/.*"tags"://' | json_list | sort || true)
  tags=$(printf '%s\n' "$all_tags" | grep -E '^[0-9]{8}T[0-9]{6}Z-' || true)
  total=$(printf '%s\n' "$tags" | grep -c . || true)
  [ "$total" -gt "$KEEP" ] || { echo "${repo}: ${total} stamped tag(s), keeping all"; continue; }

  drop=$(printf '%s\n' "$tags" | head -n "-${KEEP}")
  # Everything that is NOT being dropped, which is not the same as the newest
  # KEEP stamped tags: release tags (v1.2.0) do not match the stamped shape, so
  # they never enter `drop`, but they DO point at manifests. Leaving them out
  # of the protected set is how a release gets deleted as collateral -- the
  # delete below is by digest and unlinks every tag on it.
  keep=$(comm -23 <(printf '%s\n' "$all_tags" | grep -v '^$' | sort) \
                  <(printf '%s\n' "$drop" | grep -v '^$' | sort))
  echo "${repo}: ${total} stamped tag(s), dropping $(printf '%s\n' "$drop" | grep -c .)" \
       "(protecting $(printf '%s\n' "$keep" | grep -c .))"

  digest_of() {
    curl -sfI -H "Accept: ${MANIFEST_ACCEPT}" "${REGISTRY}/v2/${repo}/manifests/$1" \
      | awk 'tolower($1)=="docker-content-digest:"{print $2}' | tr -d '\r'
  }

  # A manifest delete is by digest, and unlinks every tag pointing at it. Two
  # releases that produce an identical image share a digest, so deleting the
  # old one would silently take the kept one with it.
  kept_digests=""
  for tag in $keep; do kept_digests="${kept_digests} $(digest_of "$tag")"; done

  for tag in $drop; do
    digest=$(digest_of "$tag")
    if [ -z "$digest" ]; then
      echo "  ${tag}: no digest returned, skipping"
      continue
    fi
    case " ${kept_digests} " in
      *" ${digest} "*)
        echo "  ${tag}: shares a digest with a kept tag, leaving it"
        continue
        ;;
    esac
    if [ "$DRY_RUN" = "1" ]; then
      echo "  would delete ${tag} (${digest})"
    else
      curl -sf -X DELETE "${REGISTRY}/v2/${repo}/manifests/${digest}" > /dev/null \
        && { echo "  deleted ${tag}"; deleted=$((deleted + 1)); } \
        || echo "  ${tag}: delete failed (is REGISTRY_STORAGE_DELETE_ENABLED set?)"
    fi
  done
done

if [ "$DRY_RUN" = "1" ]; then
  echo "dry run: nothing deleted, no collection run"
  exit 0
fi

before=$(docker run --rm -v "${REGISTRY_VOLUME}:/d:ro" "$REGISTRY_IMAGE" du -sh /d | cut -f1)

# Stopped, not running. garbage-collect walks the blob store deciding what is
# unreferenced; a push landing mid-walk can have its freshly uploaded blob
# collected before the manifest that references it exists.
echo "Stopping the registry for collection..."
$REGISTRY_COMPOSE stop registry > /dev/null
docker run --rm -v "${REGISTRY_VOLUME}:/var/lib/registry" "$REGISTRY_IMAGE" \
  registry garbage-collect --delete-untagged /etc/docker/registry/config.yml 2>&1 \
  | tail -3
$REGISTRY_COMPOSE start registry > /dev/null
echo "Registry back up."

after=$(docker run --rm -v "${REGISTRY_VOLUME}:/d:ro" "$REGISTRY_IMAGE" du -sh /d | cut -f1)
echo "manifests deleted: ${deleted}   registry size: ${before} -> ${after}"
