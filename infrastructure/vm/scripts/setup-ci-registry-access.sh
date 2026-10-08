#!/usr/bin/env bash
# Grants GitHub Actions exactly one capability on this host: forward a TCP
# connection to the image registry on 127.0.0.1:5000. Nothing else.
#
#   sudo bash infrastructure/vm/scripts/setup-ci-registry-access.sh
#
# Reads the public key from /tmp/rdpci.pub by default (CI_PUBKEY_FILE=<path>).
# CI_PUBKEY=<key> works too, but a long inline key gets mangled by terminal
# wrapping -- that has already cost one confusing failure. Idempotent.
#
# Why a dedicated account rather than a restricted key on the deploy user:
# the deploy user has passwordless sudo and is in the `docker` group, which
# is root-equivalent. The key for this lives in GitHub's secret store, so the
# question is not "will the restriction hold" but "what happens if it does
# not". Here the answer is an account with no shell, no sudo, no docker and
# no group membership. Defence in depth, because the restriction syntax is
# easy to get subtly wrong:
#
#   `restrict` alone does NOT prevent command execution. It disables pty,
#   agent, X11, user-rc and forwarding, but `ssh host 'cat /etc/shadow'`
#   still runs. The forced command is what closes that, and with `ssh -N` no
#   session channel is opened, so the forced command never fires and the
#   tunnel is unaffected.
set -euo pipefail

CI_PUBKEY_FILE="${CI_PUBKEY_FILE:-/tmp/rdpci.pub}"
if [ -z "${CI_PUBKEY:-}" ]; then
  [ -r "$CI_PUBKEY_FILE" ] || {
    echo "no key: set CI_PUBKEY, or put the public key at ${CI_PUBKEY_FILE}" >&2
    exit 1
  }
  # Only the first line, and trimmed: a trailing newline or a stray second
  # line would corrupt the authorized_keys entry.
  CI_PUBKEY=$(head -1 "$CI_PUBKEY_FILE" | tr -d '\r' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
  echo "read key from ${CI_PUBKEY_FILE}"
fi
[ -n "$CI_PUBKEY" ] || { echo "public key is empty" >&2; exit 1; }
CI_USER="${CI_USER:-rdpci}"
REGISTRY_ENDPOINT="${REGISTRY_ENDPOINT:-127.0.0.1:5000}"

[ "$(id -u)" -eq 0 ] || { echo "run with sudo" >&2; exit 1; }

case "$CI_PUBKEY" in
  ssh-ed25519\ *|ssh-rsa\ *|ecdsa-*) ;;
  *) echo "CI_PUBKEY does not look like a public key line" >&2; exit 1 ;;
esac
case "$CI_PUBKEY" in
  *PRIVATE*) echo "that is a PRIVATE key. Stop." >&2; exit 1 ;;
esac

# --no-create-home would leave nowhere for authorized_keys; a home with no
# shell is the combination we want.
if ! id -u "$CI_USER" >/dev/null 2>&1; then
  useradd --system --create-home --shell /usr/sbin/nologin \
          --comment "GitHub Actions registry push (GRASS-384)" "$CI_USER"
  echo "created ${CI_USER} (system account, nologin)"
else
  echo "${CI_USER} already exists"
fi

# Explicitly NOT in docker, NOT in sudo. Assert rather than assume, in case
# the account predates this script.
for g in docker sudo adm; do
  if id -nG "$CI_USER" | tr ' ' '\n' | grep -qx "$g"; then
    gpasswd -d "$CI_USER" "$g" >/dev/null
    echo "removed ${CI_USER} from ${g}"
  fi
done
passwd -l "$CI_USER" >/dev/null 2>&1 || true   # no password login, ever

home=$(getent passwd "$CI_USER" | cut -d: -f6)
install -d -m 700 -o "$CI_USER" -g "$CI_USER" "${home}/.ssh"
printf 'command="/bin/false",restrict,port-forwarding,permitopen="%s" %s\n' \
  "$REGISTRY_ENDPOINT" "$CI_PUBKEY" > "${home}/.ssh/authorized_keys"
chown "$CI_USER:$CI_USER" "${home}/.ssh/authorized_keys"
chmod 600 "${home}/.ssh/authorized_keys"
echo "installed restricted key for ${CI_USER}"

# sshd here has an AllowUsers allowlist; a new account cannot log in until it
# is on it, and the failures would feed Fail2Ban.
if grep -qE '^\s*AllowUsers' /etc/ssh/sshd_config; then
  if ! grep -E '^\s*AllowUsers' /etc/ssh/sshd_config | grep -qw "$CI_USER"; then
    cp -a /etc/ssh/sshd_config "/etc/ssh/sshd_config.bak.$(date -u +%Y%m%dT%H%M%SZ)"
    sed -i -E "s/^(\s*AllowUsers.*)$/\1 ${CI_USER}/" /etc/ssh/sshd_config
    echo "added ${CI_USER} to AllowUsers (backup written)"
  else
    echo "${CI_USER} already in AllowUsers"
  fi
fi

# permitopen governs where -L and -D may connect TO. It says nothing about
# -R, which binds a LISTENER on this host -- and that was accepted when
# tested. It matters concretely: if the registry container is ever stopped,
# a holder of this key could bind 127.0.0.1:5000 itself and serve poisoned
# images to the next deploy. A key for pushing images could become the
# registry.
#
# AllowTcpForwarding local permits -L and -D and denies -R, which is exactly
# the shape wanted. No authorized_keys option expresses it, so it goes here.
# Match blocks run to the next Match or EOF, so this is appended last.
if ! grep -qE "^Match User ${CI_USER}([[:space:]]|$)" /etc/ssh/sshd_config; then
  cp -a /etc/ssh/sshd_config "/etc/ssh/sshd_config.bak.match.$(date -u +%Y%m%dT%H%M%SZ)"
  {
    echo ""
    echo "# GRASS-384: CI pushes images to the local registry and does nothing else."
    echo "Match User ${CI_USER}"
    echo "    AllowTcpForwarding local"
    echo "    X11Forwarding no"
    echo "    AllowAgentForwarding no"
    echo "    PermitTTY no"
  } >> /etc/ssh/sshd_config
  echo "added Match block denying remote forwarding for ${CI_USER}"
else
  echo "Match block for ${CI_USER} already present"
fi

# Validate before reloading: a bad sshd_config that is never reloaded is
# recoverable, one that is reloaded can lock everyone out.
sshd -t
systemctl reload ssh 2>/dev/null || systemctl reload sshd
echo "sshd config valid, reloaded"

echo
echo "--- resulting account ---"
id "$CI_USER"
getent passwd "$CI_USER" | awk -F: '{print "  shell: "$7"  home: "$6}'
echo "  sudo: $(sudo -l -U "$CI_USER" 2>&1 | grep -ci 'may run' || true) entries"
echo "--- authorized_keys ---"
sed 's/\(AAAA[A-Za-z0-9+/]\{12\}\)[^ ]*/\1.../' "${home}/.ssh/authorized_keys"
