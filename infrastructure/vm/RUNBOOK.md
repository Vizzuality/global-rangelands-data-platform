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

> **Status: read once.** The stack is running on the ILRI VM
> (`139.162.197.186`) as of 2026-10-07, and the paths below are now real:
> the checkout is at `/opt/rdp`, backups land in `/var/backups/rdp`. All five
> containers are healthy, the certificate is a real Let's Encrypt one, and
> renewal has been dry-run end to end including the deploy hook.
>
> Staging content was restored on the same day: 21 datasets, 44 layers,
> 21 stories, 370 ecoregions, 131 media files (130 real ones and the stray
> `.gitkeep` row staging also carries). Pages render it, server-side
> and in the browser.
>
> Three things remain open, and none of them is a procedure in this file:
>
> - **The CMS admin accounts are all Vizzuality's.** The staging dump carried
>   11 accounts across, every one of them `@vizzuality.com`, every one a
>   Super Admin with a working password, and not one ILRI account among them.
>   Before cutover someone has to decide who should actually hold Super Admin
>   on ILRI's platform, add ILRI accounts, and remove the ones that should
>   not outlive the engagement. This is an access-control decision, not a
>   task, which is why it is here and not in §2.
> - **Backups are on the same disk as the thing they back up.** The nightly
>   job runs and has been verified against real content, but losing the host
>   loses both. The off-box destination is ILRI's decision and sets
>   `RETENTION_KEEP`.
> - **§4.3 (destructive restore) has never been run against a real stack.**
>   §4.2 has, against real content, and passes. Exercise §4.3 by hand once
>   before relying on it.
>
> DNS still points the four production domains at a different host, so
> nothing here is serving the public yet.

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

GitHub Actions builds the images; this box only deploys them. **Generate
release** (Actions → Run workflow, from `staging`, with a version like
`v1.2.0`) runs the tests, builds `cms`, `client` and `tiler`, refuses to push
anything that fails the hygiene check, pushes into this machine's own
registry through an SSH tunnel, then fast-forwards `main` and tags it. It
deploys nothing; that is this section.

On the box, with the version from the run summary:

    cd /opt/rdp
    git fetch origin --tags && git checkout v1.2.0
    RELEASE_TAG=v1.2.0 SKIP_BUILD=1 bash infrastructure/vm/scripts/deploy-release.sh

No registry argument: the images are already in this machine's own registry,
and `deploy-release.sh` defaults to it.

**The checkout has to move as well as the images.** `nginx.conf`, the
template directory and `healthcheck.js` are bind-mounted out of the repo, so
a stale checkout pairs new images with old configuration, a mismatch that
produces a confusing failure rather than an obvious one.
The version is the same string in both commands precisely so this cannot be
got wrong.

> A run dispatched with an **empty** version is a build, not a release: it
> moves no branch and creates no git tag, and its images carry a
> `<utc-stamp>-<short-sha>` tag instead. To deploy one of those you must
> check out the matching commit by hand (`git checkout <sha>`), because
> nothing in git points at it. Prefer a real release for anything that stays
> on the box.

`deploy-release.sh` records `IMAGE_TAG` and `IMAGE_PREFIX` into `.env.prod` once the
stack is up, so a later `docker compose` command that does not set them
resolves the same images rather than falling back to `rdp-*:local`. To see
what this box believes it is running:

    grep -E '^IMAGE_(TAG|PREFIX)=' /opt/rdp/.env.prod
    rdp ps --format '{{.Service}}\t{{.Image}}'

Those two must agree. If they do not, someone ran compose without the tag and
the stack is not what git says it is. Re-run the deploy above for the version
you intend.

| | Step | If it fails here |
|---|---|---|
| 1 | pull the three images from `127.0.0.1:5000` | registry down: `docker compose -f docker-compose.registry.yml up -d`; or the tag does not exist, check the run summary |
| 2 | check the images carry no config files | §2.1 |
| 3 | push (skipped: they came from the registry) | |
| 4 | start the new containers | §7.4 |
| 5 | reload nginx | §7.1 |
| 6 | smoke-test the four routes through nginx | **the site may be broken; roll back, §3** |

### 2.0 Building here instead

`deploy-release.sh` with no arguments still builds locally and pushes to the
loopback registry on `127.0.0.1:5000`, which is what rollback tags live in:

    bash infrastructure/vm/scripts/deploy-release.sh

Use it when GitHub is unreachable or you are testing an unmerged change.
Expect roughly ten minutes: this box has four cores and is also serving the
site, which is the whole reason the build moved to CI.

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

### 2.2 The release workflow failed at the tunnel or the push

Check the host side before the workflow. This box was Ansible-managed from
`masita.server.com` until ILRI exempted it on 2026-10-09, and nothing in that
playbook ever knew the `rdpci` account exists. If the exemption lapses, the
account, its `authorized_keys` entry and the `Match User` block can all be
reverted without anyone touching the repository. From a
workstation with the CI key:

    bash infrastructure/vm/scripts/verify-ci-access.sh

It opens the same forward with the same pinned host key, makes a request
through it, and asserts the restrictions still hold. If it passes and the
release still cannot authenticate, the repository secret is stale rather
than the host: re-run `setup-ci-access.sh`. Nothing can compare the two
directly, because `VM_REGISTRY_SSH_KEY` cannot be read back.

If it fails on the request but the forward opened, the registry itself is
down: `docker compose -f docker-compose.registry.yml up -d`.

---

## 3. Roll back

What is running right now:

    rdp ps --format '{{.Image}}'

What you can roll back to:

    curl -s http://127.0.0.1:5000/v2/rdp-client/tags/list \
      | tr ',' '\n' | grep -oE '[0-9]{8}T[0-9]{6}Z-[a-f0-9]+(-dirty)?' | sort -r

Newest first. Then:

    RELEASE_TAG=<tag> SKIP_BUILD=1 bash infrastructure/vm/scripts/deploy-release.sh

This pulls that tag from the registry, deploys it, reloads nginx and
smoke-tests it, exactly as a release does. Two or three minutes.

### 3.1 If the rollback stops on image hygiene

A tag from before the configuration cleanup will fail the hygiene check
(§2.1), because those images genuinely do carry an env file. Refusing an
emergency rollback is worse than the thing being prevented, so:

    ALLOW_UNCLEAN_IMAGES=1 RELEASE_TAG=<tag> SKIP_BUILD=1 \
      bash infrastructure/vm/scripts/deploy-release.sh

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

**Scheduled** nightly at 03:15 UTC from `ksanchez`'s crontab, writing to
`/var/backups/rdp` and keeping the last 14. Check it is actually running:

    ls -lt /var/backups/rdp | head -5
    tail -20 /var/backups/rdp/backup.log
    sudo crontab -u ksanchez -l

Use that form, not a bare `crontab -l`. The job is in a **personal** crontab,
so `crontab -l` as anyone else prints nothing and reads exactly like "no
backup is scheduled". The same property is the real problem with it: a
personal crontab is deleted with the account, and nothing outside it refers
to the job, so closing that Vizzuality account stops the backups silently.
It belongs in `/etc/cron.d/rdp-backup` before handover; the line is in
**What is actually scheduled** in the README.

> **These backups are on the same disk as the stack.** They protect against a
> bad deploy, a dropped table or a botched content edit. They do not protect
> against losing the host, which is the case that loses both at once. An
> off-box destination is still ILRI's decision; it is also what should set
> `RETENTION_KEEP`.

Retention is count-based, not age-based, on purpose: a stack that silently
stops producing backups should not also start deleting the ones it has.

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

Set up and verified on 2026-10-07: issued with `--webroot`, the deploy hook
fired on first issuance, and `certbot renew --dry-run` succeeds. The
`certbot.timer` systemd unit does the renewing.

> **A plain `--dry-run` does not test the deploy hook.** It skips it, and
> says so only in the log, not on the terminal:
>
>     Dry run: skipping deploy hook command: /opt/rdp/.../cert-deploy-hook.sh
>
> So a green dry-run tells you the challenge and the issuance work, and
> nothing about the half that publishes the result, which is precisely the
> half that fails silently (§5.1). To exercise the whole chain:
>
>     sudo certbot renew --dry-run --run-deploy-hooks
>
> That flag is real but listed only under `certbot --help all`, not under
> `renew --help`. Run on 2026-10-08: the hook copied the certificate into the
> `certs` volume and reloaded nginx, which stayed up and healthy.
>
> It takes about five minutes against the staging ACME server. Killing the
> client does **not** kill certbot: it keeps its lock, and the next run
> refuses with *"Another instance of Certbot is already running."* Wait it
> out rather than starting a second one.

> Two notes for whoever inherits this. The certificate currently covers only
> the Linode reverse-DNS name, because that is what resolved at the time.
> At DNS cutover it must be reissued for the four production names, all in
> one certificate (see **Domain states** in the README).
>
> And **nothing will tell you if renewal stops working.** Registering an
> address on the Let's Encrypt account does not help: Let's Encrypt ended
> expiration notification emails on 4 June 2025, so `certbot update_account
> --email` buys nothing. Monitoring is the only option, and it is not in
> place yet (§9).

Measured on 2026-10-08, these are the ways renewal can fail and what would
notice:

| Failure | What catches it today |
|---|---|
| `certbot.service` fails outright | nothing: `OnFailure=` is empty and the host has no MTA |
| renewal succeeds, deploy hook not registered | nothing: certbot exits 0 |
| renewal succeeds, deploy hook fails | nothing: a failing hook is a warning, not an error |
| the certificate expires and is served | a visitor's browser warning |

> The nginx container healthcheck does **not** cover this, and cannot. It
> runs `wget --no-check-certificate https://127.0.0.1/en`, and it has to skip
> validation, because it connects to the loopback address while the
> certificate is issued for the public name. So the stack reports five
> healthy containers while serving an expired certificate.
>
> The one check that catches every row above is the expiry of the
> **served** certificate, because it observes the symptom rather than any
> particular cause:
>
>     echo | openssl s_client -connect <public-name>:443 -servername <public-name> 2>/dev/null \
>       | openssl x509 -noout -enddate
>
> Renewal starts at 30 days out and retries twice a day, so alerting below
> 14 days still leaves a fortnight to act.

### 5.1 The certificate renewed but the site still serves the old one

The container reads the certificate at startup. A new file on disk changes
nothing until nginx rereads it:

    rdp exec nginx nginx -s reload

If this happens at all, the renewal deploy hook is missing or wrong. Check
it is still registered:

    sudo grep renew_hook /etc/letsencrypt/renewal/*.conf

It should point at `/opt/rdp/infrastructure/vm/scripts/cert-deploy-hook.sh`,
which copies the renewed pair into the `certs` volume and then reloads the
container. Registered is not the same as working, so prove it with the
`--run-deploy-hooks` command in §5. A bare `nginx -s reload` is not enough on its own: the volume
holds a *copy*, because certbot's `live/` directory is relative symlinks into
`archive/` that do not resolve inside a container.

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

`deploy-release.sh` does this reload automatically on every deploy. You should only
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

### 7.7 Docker cannot create a network or start a container

    Failed to Setup IP tables: Unable to enable ACCEPT OUTGOING rule:
    iptables: No chain/target/match by that name

The host firewall was reloaded and took Docker's rules with it. `nftables`
owns the ruleset here, `/etc/nftables.conf` knows nothing about Docker, and
reloading that service flushes every chain Docker installed. Docker only
installs them when the daemon starts, so they stay gone.

    sudo systemctl restart docker

Confirm with `sudo iptables -t filter -L -n | grep '^Chain DOCKER'`, which
should list six chains.

**It is silent while it lasts.** The `FORWARD` policy is `ACCEPT` and running
containers keep serving, so nothing fails until something needs to create a
network or publish a port: a deploy, or a `compose up`. Observed on
2026-10-08: the ruleset was reloaded at 00:55 and the gap was only noticed at
16:33, when a teardown and rebuild tried to recreate the stack.

**A reboot is the cure, not a casualty.** `nftables.service` is
`DefaultDependencies=no`, `WantedBy=sysinit.target` and ordered
`Before=network-pre.target`, so it finishes long before `docker.service`,
which waits for `network-online.target`. Docker then installs its chains into
a ruleset that has already settled. Measured on 2026-10-09, rebooting with
the chains at zero: nftables at 12:05:54, docker at 12:06:00, chains back to
26 filter and 6 nat, all six containers healthy, 84 seconds from `reboot` to
HTTP 200.

Check whether this is what bit you:

    systemctl show nftables --property=ActiveEnterTimestamp --value
    systemctl show docker   --property=ActiveEnterTimestamp --value

If nftables started *after* docker, the chains are missing.

The cause is `update-firehol-nftables.timer`, which fires daily between 00:00
and 01:00 and ends its script with `systemctl restart nftables.service`. So
this recurs every night, and `systemctl restart docker` is the only recovery
-- `reload` does not reinstall the chains. The durable fix is ILRI's to make
and is the same drop-in they already apply to fail2ban
(`PartOf=nftables.service`); see §9.

One case where a reboot does *not* save you: that timer is `Persistent=true`
and its service is `After=network-online.target` with no ordering against
`docker.service`. A boot that follows a missed 00:00-01:00 window runs the
blocklist update immediately, and the chains survive only if Docker happens
to start second.

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

- **Nothing watches the platform.** ILRI already runs Zabbix against this
  host (`zabbix-agent2` 8.0, hostname `linode50`, reporting to
  `41.204.190.131`), so disk, load and reachability are covered. But its
  only custom items are `process.top.cpu`, `process.top.memory`,
  `users.active` and `users.logged`. Nothing knows the platform exists, so
  the first signal that the *site* is down is a person noticing, and the
  renewal failures in §5 are all silent.

  Five checks close it, all Edwin's to add: the certificate on the served
  port is more than 14 days from expiry; `/en` returns 200; `/cms/_health`
  returns 204; a tile URL returns 200; and `/var/backups/rdp/backup.log` was
  modified in the last 25 hours. The three endpoint checks stand in for
  "five healthy containers" deliberately: they observe what a visitor
  would, and they need no Docker access. **Do not put the `zabbix` user in
  the `docker` group for this**: that group is root-equivalent, and it would
  hand an internet-reachable monitoring agent full control of the host.

  No new access is needed for any of them. The certificate check is a
  built-in agent2 key, the endpoint checks run from the Zabbix server, and
  the `zabbix` user can already read `/var/backups/rdp` (verified
  2026-10-08). Item keys and thresholds for all five are written up for the
  ILRI side under GRASS-384.

- **The host is under Ansible management, and this stack is not in it.**
  `/etc/letsencrypt/renewal-hooks/{pre,post}/` carry files stamped *managed
  by Ansible*, pushed from `masita.server.com` in June. They stop and start
  `apache2`, which is not installed here, so they are inert: renewal
  succeeds with them in place, which was checked. But it means host
  configuration can be re-applied from outside, and nothing in that playbook
  knows about Docker, `/opt/rdp`, the swapfile or the firewall rules. Either
  those should go into the playbook, or ILRI should confirm this host is
  exempt. (The nftables ruleset and `/etc/fstab` are *not* Ansible-managed
  today, so the open ports and the swapfile do survive a run.)

  The file to watch is `/etc/letsencrypt/renewal/<name>.conf`. It carries the
  `renew_hook` line, and a playbook that rewrites it takes the hook with it,
  after which renewal keeps reporting success while the container serves an
  expiring certificate (§5.1). The hooks already in
  `renewal-hooks/{pre,post}/` show that role expects a host apache and the
  stop-renew-start model, not our `--webroot` one, so this is not a
  hypothetical collision. Worth asking Edwin to exempt the path, and worth a
  Zabbix certificate-expiry check either way.
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
