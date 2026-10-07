# Runbook: Global Rangelands Data Platform

For whoever is on the end of *"the site is down"*. Procedures only: what to
type, what to expect, what it means when you get something else.

The reasoning behind every decision here lives in [`README.md`](./README.md),
which is written for whoever changes the stack. This file is written for
whoever has to keep it running, and assumes no knowledge of how it was built.

Covers the single-VM Docker Compose deployment ([GRASS-384](https://vizzuality.atlassian.net/browse/GRASS-384)).
Five containers on one host: `nginx`, `client`, `cms`, `tiler`, `db`. A sixth,
the image registry, runs beside them in its own compose project (§8), so
`docker ps` shows six while `rdp ps` shows five.

> **Status — read once.** Every procedure here has been run and measured, but
> on a local rehearsal stack, not on the ILRI VM: the machine has refused all
> connections since the September resize and the stack has never been stood up
> on it. Expect the commands to behave as described; expect the paths
> (`/opt/rdp`, `/var/backups/rdp`) to be conventions that whoever installs it
> confirms or changes. Two things are not merely unverified but **not set up
> at all** — certificate renewal (§5) and scheduled backups (§4.1).

---

## 0. Set up the session

Everything below assumes these two lines, run once per login:

    cd /opt/rdp
    rdp() { docker compose -f docker-compose.prod.yml --env-file .env.prod "$@"; }

`/opt/rdp` is wherever the checkout lives; adjust if it is elsewhere. The
`rdp` function only saves typing; the scripts build the same command
internally and need no setup.

**Run these on the box, over SSH.** A `docker context` pointed at the VM
looks like it should work and does not: four services bind-mount a path from
the repo (`nginx.conf`, the template directory, `healthcheck.js`), and compose
resolves those to absolute paths on *your* machine before handing them to the
remote daemon. Docker does not error on a missing bind source: it creates an
empty directory and mounts that, so nginx gets a directory where its
configuration file should be. The stack fails in a way that points nowhere
near the cause.

A context is still fine for read-only inspection (`ps`, `logs`, `stats`),
which is most of §1:

    docker context create rdp-vm --docker host=ssh://<user>@<vm-address>
    docker --context rdp-vm compose -f docker-compose.prod.yml ps

Anything that starts a container (§2, §3, §7.1) belongs on the box.

---

## 1. Is it down?

One command, and it is the whole of first-line triage:

    rdp ps

| What you see | What it means | Go to |
|---|---|---|
| all five `(healthy)` | the stack is fine; look at DNS, the firewall, or the certificate | §1.1, then §5 |
| **`nginx (unhealthy)`, the other four healthy** | **the most common failure.** nginx is holding a dead upstream address | **§7.1** |
| `client`, `cms` or `tiler` unhealthy | that one service is failing | §7.2 |
| `db (unhealthy)` | fix this first; the others fail as a consequence | §7.3 |
| a container restarting, or missing from the list | it is crashing and being restarted forever | §7.4 |
| any command fails with *no space left on device* | the disk is full; Postgres stops writing before anything else fails | §6 |

`nginx (unhealthy)` deserves the emphasis: it is checked *through* itself, so
it is the only line that reports whether the **site** works rather than
whether a **process** is running. Everything else can be green while every
page returns 502.

### 1.1 Second-line check: the four routes

The same checks a release runs. Run them from the box:

    for p in /en /en/map /cms/admin /cms/_health; do
      printf '%-14s %s\n' "$p" "$(curl -sk -o /dev/null -w '%{http_code}' --max-time 20 https://127.0.0.1$p)"
    done

Expected, exactly:

    /en            200
    /en/map        200
    /cms/admin     200
    /cms/_health   204

`-k` skips certificate verification on purpose: you are connecting to
`127.0.0.1` and the certificate is issued for the public name. To test the
certificate itself, see §5.

If these four pass from the box but the site is unreachable from outside, the
stack is not the problem: check DNS, the Linode firewall, and §5.

### 1.2 What is actually in the logs

    rdp logs --tail 50 nginx
    rdp logs --tail 50 client
    rdp logs --since 15m cms

Logs are capped at 10 MB × 3 files per service, so there is no need to clear
them and no risk of them filling the disk. That also means **older entries
are already gone**, so do not expect to investigate something from last week.

---

## 2. Deploy a new version

    git pull
    bash infrastructure/vm/scripts/release.sh

That is the whole procedure. It takes roughly three minutes and does six
things in an order that matters:

| | Step | If it fails here |
|---|---|---|
| 1 | build the three images | a code or dependency problem — nothing has changed on the running site |
| 2 | check the images carry no config files | §2.1 |
| 3 | push them to the registry on `127.0.0.1:5000` | registry down — `docker compose -f docker-compose.registry.yml up -d` |
| 4 | start the new containers | §7.4 |
| 5 | reload nginx | §7.1 |
| 6 | smoke-test the four routes through nginx | **the site may be broken; roll back, §3** |

**Steps 1 to 3 change nothing that users can see.** A failure before step 4 is
safe: the old containers are still serving. From step 4 onward, a failure
means the live site is affected, and the script prints the exact rollback
command before it exits.

A release is tagged `<utc-timestamp>-<git-sha>`. If the checkout has
uncommitted changes to anything that ends up in an image, the tag gains a
`-dirty` suffix and the script warns you. A `-dirty` release cannot be
rebuilt from git later, so avoid it outside an emergency.

### 2.1 "RELEASE STOPPED: images failed hygiene"

An image is carrying a `.env` file it should not have. Almost always because
a `.env` or `.env.local` was left in `client/` or `cms/` and got copied into
the build. Delete it and build again.

Do **not** reach for `ALLOW_UNCLEAN_IMAGES=1` here. That override exists for
rollbacks (§3), not for new builds.

---

## 3. Roll back

What is running right now:

    rdp ps --format '{{.Image}}'

What you can roll back to:

    curl -s http://127.0.0.1:5000/v2/rdp-client/tags/list \
      | tr ',' '\n' | grep -oE '[0-9]{8}T[0-9]{6}Z-[a-f0-9]+(-dirty)?' | sort -r

Newest first. Then:

    RELEASE_TAG=<tag> SKIP_BUILD=1 bash infrastructure/vm/scripts/release.sh

This pulls that tag from the registry, deploys it, reloads nginx and
smoke-tests it, exactly as a release does. Two or three minutes.

### 3.1 If the rollback stops on image hygiene

A tag from before the configuration cleanup will fail the hygiene check
(§2.1), because those images genuinely do carry an env file. Refusing an
emergency rollback is worse than the thing being prevented, so:

    ALLOW_UNCLEAN_IMAGES=1 RELEASE_TAG=<tag> SKIP_BUILD=1 \
      bash infrastructure/vm/scripts/release.sh

On this stack the baked file is inert, because compose supplies every value and
those take precedence, so the risk is a stale copy of configuration sitting
in a layer, not a live misconfiguration. **Roll forward to a clean tag once
the incident is over.**

### 3.2 What a rollback does not undo

Only the three application images. It does **not** restore the database. If
the bad release changed content types, Strapi has already altered the schema
on boot and rolling the image back does not reverse it. Added columns are
harmless; a removed field's data is not. If content or data is wrong rather
than the code, you want §4.

---

## 4. Backups

### 4.1 Take one now

    bash infrastructure/vm/scripts/backup.sh

Writes `./backups/<timestamp>/` containing `db.dump`, `media.tar.gz` and
`manifest.txt`. Safe to run at any time against the live stack; nothing is
stopped. The directory is assembled under a `.partial-` name and renamed only
on success, so anything you can see is complete.

**Not yet scheduled.** The cron entry to install is in **Backups** in the
README; until it is in place, backups only happen when someone runs the
command above. Once installed, check it is actually running:

    ls -lt /var/backups/rdp | head -5
    tail -20 /var/log/rdp-backup.log

### 4.2 Check a backup is good without restoring it

    cat /var/backups/rdp/<timestamp>/manifest.txt

Row counts and media file counts. Compare against the previous night: a sharp
drop means something went wrong upstream of the backup.

To actually prove one restores, into throwaway containers that never touch
the live stack:

    BACKUP=/var/backups/rdp/<timestamp> \
      bash infrastructure/vm/scripts/verify-backup.sh

Four checks, takes a minute or two. Worth doing monthly and **essential
before relying on a backup in an incident**.

### 4.3 Restore (destructive)

> **Read this before running it.** It drops the database and empties the
> upload volume. There is no undo. Take a fresh backup first (§4.1) even if
> the current state is broken: it is the only way back to it.

    BACKUP=/var/backups/rdp/<timestamp> \
      bash infrastructure/vm/scripts/restore-backup.sh

Both halves are restored together, always. Restoring only the database would
leave content rows pointing at images that are no longer on disk.

Afterwards, confirm with §1 and §1.1.

---

## 5. The TLS certificate

Check what is actually being served, not what is on disk:

    echo | openssl s_client -connect <public-name>:443 -servername <public-name> 2>/dev/null \
      | openssl x509 -noout -dates -subject

Renewal is meant to be automatic: certbot runs on the **host**, not in a
container, and renews roughly 30 days before expiry.

> **Not yet set up.** Issuance and renewal are phase-2 work and have never run
> against the real VM. Follow **TLS → On the VM** in the README to set them
> up, and verify with `certbot renew --dry-run` rather than waiting to find
> out. §5.1 is the failure this most often ships with.

### 5.1 The certificate renewed but the site still serves the old one

The container reads the certificate at startup. A new file on disk changes
nothing until nginx rereads it:

    rdp exec nginx nginx -s reload

If this happens at all, the renewal deploy hook is missing or wrong. It must
be:

    --deploy-hook 'docker compose -f docker-compose.prod.yml exec nginx nginx -s reload'

Without it certbot reloads a host nginx that does not exist, exits
successfully, and the container keeps serving an expiring certificate until
someone notices.

### 5.2 The certificate has expired

    certbot renew --force-renewal
    rdp exec nginx nginx -s reload

Then re-run the check above and confirm the dates moved.

If issuance itself fails, the ACME challenge path is the usual cause. It must
not redirect:

    curl -s -o /dev/null -w '%{http_code}\n' \
      http://<public-name>/.well-known/acme-challenge/probe

Expect `404`. A `301` means validation will fail.

---

## 6. Disk filling up

    df -h /
    docker system df

Reclaim in this order, safest and usually largest first:

    docker builder prune -f            # build cache. Rebuilt on demand. Often tens of GB.
    docker image prune -a -f           # images no containers use. Still in the registry.
    bash infrastructure/vm/scripts/registry-gc.sh     # old release tags; keeps the newest 10

**None of those three run on a schedule.** The backup in §4.1 is the only
job this stack installs, so the build cache, the unused images and the old
release tags all accumulate until someone runs the commands above. (The
host's own timers, certbot and the firewall blocklist, are a separate thing
and reclaim nothing.)

`registry-gc.sh` accepts `KEEP=5 DRY_RUN=1` to show what it would remove
without removing it. Run the dry run first. It only ever deletes tags
matching the release timestamp format, but seeing the list costs nothing.

Container logs do not need clearing; they are capped (§1.2).

**Never delete** the `rdp-prod_pgdata` or `rdp-prod_media` volumes. See §8.

---

## 7. Known failure modes

### 7.1 Every route returns 502, but all services report healthy

**The signature failure of this stack.** nginx resolves the address of each
service once, at startup. A container recreated by a deploy, a restart
or a reboot can come back on a different address, and nginx keeps
sending traffic to the old one.

    rdp exec nginx nginx -s reload

Instant, no downtime, no container restart. The site is back immediately.

This is the one case where `rdp ps` used to lie: all three upstreams report
healthy because they *are* healthy; nginx just is not talking to them.
nginx's own healthcheck now catches it and marks nginx unhealthy within about
75 seconds, which is why §1 leads with that line.

`release.sh` does this reload automatically on every deploy. You should only
meet this after a manual `docker compose` command or a reboot.

### 7.2 One of client / cms / tiler is unhealthy

    rdp logs --tail 100 <service>
    rdp restart <service>
    rdp exec nginx nginx -s reload      # the restart may have moved it; see §7.1

If it will not start, the usual causes are a missing value in `.env.prod` or
an unreachable database. Check §7.3 first, then compare `.env.prod` against
`.env.prod.example` for a variable that was added and never filled in.

If it started failing immediately after a deploy, roll back (§3) rather than
debugging it live.

### 7.3 The database is unhealthy

    rdp logs --tail 100 db
    df -h /

Postgres stops accepting writes when the disk is full, and that is the most
common cause here, so go to §6. If the disk is fine, the log will say why. Do
not delete the `pgdata` volume to "reset" it; that is the one irreversible
mistake available in this runbook.

### 7.4 A container is restarting in a loop

    rdp ps -a
    rdp logs --tail 100 <service>

Every service is `restart: unless-stopped`, so a crashing container retries
forever. The logs repeat the same failure each time, so read one cycle, not
the tail.

### 7.5 The map is blank, but the page loads

The Mapbox token. It is **baked into the browser bundle at build time**, so
checking or changing it in `.env.prod` on a running container does nothing:
it needs a rebuild and a release (§2).

Two causes, in order of likelihood:

- The site is being served on a hostname the token's allowed list does not
  include. Matching is exact on scheme, host and port. Add the name in the
  Mapbox account, wait a couple of minutes.
- The token is wrong or revoked.

Browser console will show `401` or `403` on `api.mapbox.com` requests. See
**Mapbox token** in the README for how to test a restriction properly;
testing it against a style URL rather than a tile URL gives a meaningless
pass.

### 7.6 Map tiles are slow or missing

Tiles are cached by nginx for a week. A cold cache means every tile goes to
Google Earth Engine, which is slow and metered.

    rdp logs --tail 50 tiler

With the tiler stopped, a tile that is already cached still returns `200` and
an uncached one returns `504`. So the map keeps working where people have
already been, and fails visibly elsewhere. A map that is blank *everywhere*,
including places that worked a minute ago, is §7.5 instead.

---

## 8. Where the data lives

    docker system df -v | grep '^rdp-prod_'

| Volume | Holds | If you lose it |
|---|---|---|
| `rdp-prod_pgdata` | **the database**, all content | **Unrecoverable** except from a backup |
| `rdp-prod_media` | **uploaded images and files** | **Unrecoverable** except from a backup |
| `rdp-prod_cmsdata` | the CMS plugin's own exports | regenerated from the database |
| `rdp-prod_tilecache` | cached map tiles | refetched on demand; only a slowdown |
| `rdp-prod_certs` | the TLS certificate | reissued by certbot |

ACME challenge files are **not** in a volume. nginx serves them from
`/var/www/certbot` on the host, bind-mounted, because certbot runs on the
host and cannot write into a Docker volume. The directory is normally empty:
a challenge exists for a few seconds during validation and is then deleted.

Only the first two are irreplaceable, and §4 is the only thing protecting
them. Everything else on this machine can be rebuilt from the git repository.

The registry, which holds the images you roll back to, lives in a
**separate** compose project, `rdp-registry`. That is deliberate:
`docker compose down -v` on the application is a documented way to rebuild
from scratch, and if the registry shared the project that teardown would also
destroy every rollback target.

---

## 9. Not covered, and who decides

Open items that an operator cannot resolve alone:

- **No monitoring or alerting.** Nothing pages anyone. The first signal that
  the site is down is a person noticing. Who should be alerted, and how, is
  an ILRI decision.
- **Backups are on the same disk as the data they protect.** That is not a
  backup against disk loss. Where off-box copies go, who can read them and
  how long they are kept is an ILRI decision, and it determines the retention
  setting in §4.
- **The cutover date, and what happens to `/atlas`.** The canonical domain is
  settled (`www.rangelandsdata.org`, with the other three names redirecting
  to it), but DNS still points at the old host, repointing it is ILRI's to do,
  and nobody has decided whether the archived Rangelands Atlas keeps answering
  on `/atlas`. See **Domain states** in the README.
- **`restore-backup.sh` has not been run against the real stack**, only
  against throwaway containers (§4.2). Exercise it once, deliberately,
  before you need it.

For anything in this file that does not match what the machine is doing, the
README is the reference, and it explains why each choice was made.
