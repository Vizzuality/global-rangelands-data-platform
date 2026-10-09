#!/usr/bin/env bash
# [checks] any time. Read-only.
#
# Prove that CI's path to the image registry still works, using the same
# restricted account, the same pinned host key and the same forward that
# .github/workflows/generate-release.yml uses.
#
#   bash infrastructure/vm/scripts/checks/verify-ci-access.sh
#
# Run it from a workstation, not the VM. Reads the non-secret settings back
# from the repository with `gh`; override any of them in the environment.
# CI_KEY is the private half, which GitHub cannot give back -- see below.
#
# This is the check the RUNBOOK points at when a release fails at the tunnel
# step, because the thing that breaks it is rarely the workflow. The host is
# Ansible-managed from outside, so the account, the authorized_keys entry and
# the sshd Match block can all be reverted without anyone touching this repo.
#
# WHAT IT CANNOT PROVE: that the key in GitHub's secret store is the one
# installed on the VM. Secrets are write-only -- the API returns a name and
# two timestamps, never a value -- so a local check can only test the key it
# is given. If this passes and a release still fails to authenticate, the
# secret is stale: re-run setup-ci-access.sh.
set -euo pipefail

CI_KEY="${CI_KEY:-${HOME}/.ssh/rdpci}"
GH_ENV="${GH_ENV:-vm}"
# These live in the `vm` environment, not at repository level, so that no
# other workflow's toJSON(secrets) can see them -- see setup-ci-access.sh.
gh_var() { gh api "repos/:owner/:repo/environments/${GH_ENV}/variables/$1" -q .value 2>/dev/null || true; }
VM_REGISTRY_HOST="${VM_REGISTRY_HOST:-$(gh_var VM_REGISTRY_HOST)}"
VM_REGISTRY_USER="${VM_REGISTRY_USER:-$(gh_var VM_REGISTRY_USER)}"
VM_SSH_HOST_KEY="${VM_SSH_HOST_KEY:-$(gh_var VM_SSH_HOST_KEY)}"
PORT="${PORT:-5055}"

for v in VM_REGISTRY_HOST VM_REGISTRY_USER VM_SSH_HOST_KEY; do
  [ -n "${!v}" ] || { echo "missing ${v}: set it, or check \`gh variable list\`" >&2; exit 1; }
done
[ -r "$CI_KEY" ] || { echo "no private key at ${CI_KEY}; set CI_KEY=<path>" >&2; exit 1; }

tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
printf '%s\n' "$VM_SSH_HOST_KEY" > "${tmp}/known_hosts"
sock="${tmp}/cm"
SSH=(ssh -i "$CI_KEY" -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes
     -o UserKnownHostsFile="${tmp}/known_hosts" -o ConnectTimeout=15
     -o BatchMode=yes)

fail=0
ok()   { printf '  ok   %s\n' "$1"; }
bad()  { printf '  FAIL %s\n' "$1"; fail=$((fail + 1)); }

echo "verifying ${VM_REGISTRY_USER}@${VM_REGISTRY_HOST}"
echo

# 1. The forward, and a request through it. Opening the forward proves
# nothing on its own: `ssh -f -N -L` returns 0 and binds the local port even
# when the far side refuses the channel, because permitopen is enforced at
# channel open, not at session setup. Only a request that traverses it does.
if "${SSH[@]}" -M -S "$sock" -f -N -L "127.0.0.1:${PORT}:127.0.0.1:5000" \
     "${VM_REGISTRY_USER}@${VM_REGISTRY_HOST}" 2>"${tmp}/ssh.err"; then
  if curl -sf --max-time 20 "http://127.0.0.1:${PORT}/v2/" >/dev/null; then
    ok "registry answers through the tunnel"
    repos=$(curl -sf --max-time 20 "http://127.0.0.1:${PORT}/v2/_catalog" || true)
    printf '       %s\n' "${repos:-<no catalog>}"
  else
    bad "tunnel opened but the registry did not answer -- is rdp-registry up?"
  fi
  "${SSH[@]}" -S "$sock" -O exit "${VM_REGISTRY_USER}@${VM_REGISTRY_HOST}" 2>/dev/null || true
else
  bad "could not open the forward"
  sed 's/^/       /' "${tmp}/ssh.err"
fi

# 2. The restrictions, which are the reason this key is safe to hand to a
# third party. A regression here is silent: pushing images keeps working.
if "${SSH[@]}" "${VM_REGISTRY_USER}@${VM_REGISTRY_HOST}" 'id' >/dev/null 2>&1; then
  bad "command execution is ALLOWED -- the forced command is missing"
else
  ok "command execution refused"
fi

# ExitOnForwardFailure, and no -f. Without it ssh forks and returns 0 even
# though the server refused the forward -- the same trap as the tunnel above,
# which this check fell into and reported a false FAIL against a correctly
# configured host. Refused exits 255 at once; allowed stays up until timeout.
# `|| rc=$?` and not a bare call: refusal is the PASS here, and under set -e
# a bare non-zero command would abort the script mid-run instead.
rc=0
timeout 20 "${SSH[@]}" -o ExitOnForwardFailure=yes -N \
  -R "127.0.0.1:5999:127.0.0.1:22" \
  "${VM_REGISTRY_USER}@${VM_REGISTRY_HOST}" >/dev/null 2>&1 || rc=$?
case $rc in
  124|0) bad "remote forwarding is ALLOWED -- this key could impersonate the registry" ;;
  *)     ok "remote forwarding refused" ;;
esac

# permitopen is enforced when the channel opens, not at session setup, so the
# forward appears to succeed either way and only a connection through it
# tells you anything. Read the first bytes rather than speaking HTTP: sshd
# answers with an "SSH-2.0-..." banner, so curl fails here whether or not the
# forward was permitted -- which made the original form of this check pass
# against a host with no restriction at all.
sock2="${tmp}/cm2"
if "${SSH[@]}" -M -S "$sock2" -f -N -L "127.0.0.1:5998:127.0.0.1:22" \
     "${VM_REGISTRY_USER}@${VM_REGISTRY_HOST}" 2>/dev/null; then
  banner=$(timeout 8 bash -c 'exec 3<>/dev/tcp/127.0.0.1/5998 && head -c 4 <&3' 2>/dev/null || true)
  if [ "$banner" = "SSH-" ]; then
    bad "forwarding to port 22 WORKED -- permitopen is not limiting the target"
  else
    ok "forwarding to anything but the registry refused"
  fi
  "${SSH[@]}" -S "$sock2" -O exit "${VM_REGISTRY_USER}@${VM_REGISTRY_HOST}" 2>/dev/null || true
else
  ok "forwarding to anything but the registry refused (channel never opened)"
fi

echo
if [ "$fail" -ne 0 ]; then
  echo "CI ACCESS BROKEN: ${fail} check(s). The host is Ansible-managed; see"
  echo "RUNBOOK section 9. Re-apply with setup-ci-registry-access.sh on the VM."
  exit 1
fi
echo "CI access intact. This does not prove GitHub holds the matching key;"
echo "only a dispatched run does."
