#!/usr/bin/env bash
# Bootstrap everything GitHub Actions needs to build and push images to the
# VM's registry: the keypair, the restricted account on the host, the seven
# settings in the `vm` environment, and a credential record for the password
# manager. The Mapbox token is the one thing it does not set -- see "Setting
# the build values" in infrastructure/vm/README.md.
#
#   DEPLOY_USER=ksanchez VM_HOST=139.162.197.186 \
#     bash infrastructure/vm/scripts/setup-ci-access.sh
#
# Run it from a workstation that can already SSH to the VM as a sudoer and
# is logged in to `gh`. Idempotent: an existing key is reused, and the
# host-side script re-applies cleanly.
#
# Deliberately NOT Terraform, though infrastructure/base already manages
# repository secrets through modules/github_values. Three reasons:
#
#   - That module writes `plaintext_value`, and its state lives in
#     gs://rangelands-tf-state -- a Vizzuality bucket. This key reaches
#     ILRI's production host, so putting it there creates exactly the
#     dependency the migration removes, and forces a rotation at handover.
#   - Terraform has no provider for this machine. It would own one half of
#     a keypair and never see the other, so `plan` reports no changes while
#     Ansible has reverted the account and CI access is dead. Use
#     verify-ci-access.sh for that; it checks the half Terraform cannot.
#   - It is a one-time bootstrap, not a lifecycle. These values change when
#     the key rotates or the host moves, both rare and both deliberate.
set -euo pipefail

VM_HOST="${VM_HOST:?set VM_HOST to the VM address}"
DEPLOY_USER="${DEPLOY_USER:?set DEPLOY_USER to your sudo account on the VM}"
CI_USER="${CI_USER:-rdpci}"
CI_KEY="${CI_KEY:-${HOME}/.ssh/rdpci}"
RECORD="${RECORD:-${HOME}/grass-384-ci-access.txt}"
GH_ENV="${GH_ENV:-vm}"
REPO_DIR="${REPO_DIR:-/opt/rdp}"

command -v gh >/dev/null || { echo "gh is required" >&2; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "run \`gh auth login\` first" >&2; exit 1; }

# 1. The keypair. Generated here, never on the VM: the private half has to
# reach GitHub, and a key that was never on the host cannot be read off it
# by anyone who later gets in.
if [ -f "$CI_KEY" ]; then
  echo "reusing existing key ${CI_KEY}"
else
  ssh-keygen -t ed25519 -N '' -C "github-actions-registry-push (GRASS-384)" -f "$CI_KEY"
  echo "generated ${CI_KEY}"
fi
chmod 600 "$CI_KEY"

# 2. The host side. The pubkey goes over as a file rather than inline: a
# wrapped line pasted into a terminal has already cost one confusing failure.
scp -q "${CI_KEY}.pub" "${DEPLOY_USER}@${VM_HOST}:/tmp/${CI_USER}.pub"
# shellcheck disable=SC2029
ssh -o ConnectTimeout=20 "${DEPLOY_USER}@${VM_HOST}" \
  "sudo CI_PUBKEY_FILE=/tmp/${CI_USER}.pub CI_USER=${CI_USER} \
     bash ${REPO_DIR}/infrastructure/vm/scripts/setup-ci-registry-access.sh \
   && rm -f /tmp/${CI_USER}.pub"

# 3. The host key, pinned. Captured now and shown as a fingerprint so it can
# be compared against the host out of band -- the workflow trusts this line
# and nothing else, which is what stops a release pushing images at an
# impostor.
host_key=$(ssh-keyscan -t ecdsa -T 20 "$VM_HOST" 2>/dev/null | grep -v '^#' | head -1)
[ -n "$host_key" ] || { echo "could not read the host key from ${VM_HOST}" >&2; exit 1; }
echo
echo "host key fingerprint, confirm this against the VM:"
printf '%s\n' "$host_key" | ssh-keygen -lf - | sed 's/^/  /'
echo

# 4. The settings, in the `vm` environment rather than at repository level.
# main.yml -- the staging deploy to GCP -- serialises the whole secrets
# context with toJSON(secrets), so a repository-level key for ILRI's host is
# handed to a job that has no business with it. An environment secret is
# visible only to jobs that declare that environment, and generate-release
# .yml is the only one that does. The key goes in over stdin, never rendered.
gh api -X PUT "repos/:owner/:repo/environments/${GH_ENV}" --silent
gh secret   set VM_REGISTRY_SSH_KEY --env "$GH_ENV" < "$CI_KEY"
gh variable set VM_REGISTRY_HOST    --env "$GH_ENV" --body "$VM_HOST"
gh variable set VM_REGISTRY_USER    --env "$GH_ENV" --body "$CI_USER"
gh variable set VM_SSH_HOST_KEY     --env "$GH_ENV" --body "$host_key"
echo "set 1 secret and 3 variables in the '${GH_ENV}' environment"

# A repository-level copy would still be visible to every other workflow and
# would shadow nothing, so it is removed rather than left to rot.
if gh secret list --json name -q '.[].name' | grep -qx VM_REGISTRY_SSH_KEY; then
  gh secret delete VM_REGISTRY_SSH_KEY
  echo "removed the repository-level VM_REGISTRY_SSH_KEY"
fi

# 4b. The build-time values. Access to the registry is useless without them:
# the release workflow filters on ^(TF_)?(VM_)?CLIENT_ENV_ and builds with
# whatever it finds, so a missing one is a wrong image rather than an error.
#
# Set only when absent. This script is re-run to rotate the key, and a
# rotation must not quietly reset NEXT_PUBLIC_URL to the Linode name after
# DNS has moved -- that bakes the wrong origin into the client bundle and
# shows up as a blank map, not as a failure. Pass PUBLIC_URL to change it.
PUBLIC_URL="${PUBLIC_URL:-https://$(printf '%s' "$VM_HOST" | tr '.' '-').ip.linodeusercontent.com}"

have_vars=$(gh variable list --env "$GH_ENV" --json name -q '.[].name')
set_if_absent() {
  if printf '%s\n' "$have_vars" | grep -qx "$1"; then
    echo "  $1 already set, left alone"
  else
    gh variable set "$1" --env "$GH_ENV" --body "$2"
    echo "  $1 = $2"
  fi
}
echo "build-time values:"
set_if_absent VM_CLIENT_ENV_NEXT_PUBLIC_URL      "$PUBLIC_URL"
set_if_absent VM_CLIENT_ENV_NEXT_PUBLIC_API_URL  "/cms/api/"
set_if_absent VM_CLIENT_ENV_CMS_INTERNAL_API_URL "http://cms:1337/api/"

# The Mapbox token is deliberately not set here. It is a secret, so it cannot
# be read back to check, and prompting for one on a terminal puts it in the
# scrollback. See "Setting the build values" in infrastructure/vm/README.md.
if ! gh secret list --env "$GH_ENV" --json name -q '.[].name' \
     | grep -qx VM_CLIENT_ENV_NEXT_PUBLIC_MAPBOX_TOKEN; then
  echo "  VM_CLIENT_ENV_NEXT_PUBLIC_MAPBOX_TOKEN is NOT set. The release"
  echo "  workflow fails its publishable-token check until it is; the"
  echo "  command is in infrastructure/vm/README.md."
fi

# 5. The record. Everything needed to rebuild this by hand, in one 0600 file
# to be moved into the password manager and then deleted. Written to a path,
# not to the terminal: a scrollback buffer is not a secret store.
umask 077
{
  echo "GRASS-384 -- GitHub Actions access to the VM image registry"
  echo "written $(date -u +%Y-%m-%dT%H:%M:%SZ) by $(whoami)@$(hostname)"
  echo
  echo "VM_REGISTRY_HOST  ${VM_HOST}"
  echo "VM_REGISTRY_USER  ${CI_USER}"
  echo "VM_SSH_HOST_KEY   ${host_key}"
  echo
  echo "The account is ${CI_USER} on ${VM_HOST}: no shell, no sudo, not in"
  echo "docker, forced command /bin/false, permitopen 127.0.0.1:5000 only."
  echo "It can forward one TCP port to the registry and do nothing else."
  echo
  echo "VM_REGISTRY_SSH_KEY -- private key, also in the repository secret of"
  echo "the same name, which cannot be read back. This file is the only copy"
  echo "outside ${CI_KEY}."
  echo
  cat "$CI_KEY"
  echo
  echo "public half:"
  cat "${CI_KEY}.pub"
} > "$RECORD"
chmod 600 "$RECORD"
echo "credential record written to ${RECORD} (0600) -- move it to the"
echo "password manager, then shred it. It contains the private key."

# 6. Prove it works rather than assuming it.
echo
CI_KEY="$CI_KEY" VM_REGISTRY_HOST="$VM_HOST" VM_REGISTRY_USER="$CI_USER" \
  VM_SSH_HOST_KEY="$host_key" \
  bash "$(dirname "$0")/verify-ci-access.sh"
