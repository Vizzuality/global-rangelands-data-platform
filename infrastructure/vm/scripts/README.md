# VM scripts

Grouped by when they are allowed to run, which is the distinction that gets
people into trouble here. Every file opens with its group in brackets,
spelled exactly like the directory, so a script opened on its own says what
it is. The line is the first comment, which is line 1 in the `.sql` files,
line 2 after a shebang and line 3 inside a `/** */` block, so read them all
with:

    grep -rn '^\(#\|--\| \*\) \[' .

That must list every script here; a file it misses has lost its tag.

| Group | When it runs | What it is allowed to touch |
|---|---|---|
| `ops/` | repeatedly, for the life of the box | the running stack |
| `setup/` | once per host, re-runnable | host accounts, GitHub settings |
| `migration/` | once, during GRASS-384 | staging, then nothing |
| `checks/` | any time, by anyone | nothing you would miss |
| `container/` | never by a person | — |

## ops

Operating a box that is already up.

| Script | Notes |
|---|---|
| `backup.sh` | Database and uploads. Runs at 03:15 from `ksanchez`'s crontab on the VM, keeping 14. Prunes past `RETENTION_KEEP`. |
| `restore-backup.sh` | **Destructive.** Drops the database and empties the upload volume, in place. Recovery only. |
| `deploy-release.sh` | One release onto this box. Prints a rollback command if it fails; it does not roll back by itself. |
| `registry-gc.sh` | Reclaims registry disk. Nothing schedules it (RUNBOOK §9), so it only runs when you run it. `DRY_RUN=1` first. |
| `cert-deploy-hook.sh` | **certbot calls this, not you.** The path is written into `/etc/letsencrypt/renewal/<public-name>.conf` as `renew_hook`, so moving or renaming this file breaks renewal silently: certbot keeps reporting success while nginx serves the old certificate. |

## setup

Standing a box up, or re-pointing CI at it. All three are idempotent, which
is the point: they are also the recovery path when something on the host has
been reverted.

| Script | Notes |
|---|---|
| `setup-ci-access.sh` | Run from a workstation. Keypair, host account, the `vm` environment settings. Re-run to rotate the key. |
| `setup-ci-registry-access.sh` | The host half, as root. Invoked by the above over SSH. |
| `gen-selfsigned-cert.sh` | A throwaway pair so nginx will start. Needed on a new host before certbot can earn a real one, and used in local dev. |

## migration

GRASS-384 only, from Vizzuality's GCP to ILRI's VM. **Delete this directory
once DNS has cut over.** Each one is a single-use transformation of data that
will not exist in that shape again, and `restore-dump.sh` in particular drops
a database.

| Script | Notes |
|---|---|
| `dump-staging.sh` | Reads staging Cloud SQL through the bastion tunnel. |
| `restore-dump.sh` | **Destructive.** Drops and recreates the target database. |
| `migrate-media-from-gcs.{sh,mjs}` | Copies the staging bucket into the upload volume. |
| `rewrite-media-urls.sql` | Repoints restored `files` rows at the local provider. |
| `rewrite-tile-urls.sql` | Makes tiler URLs relative, so nothing is tied to a hostname. |

## checks

Safe by construction, in the sense that none of them changes the running
stack. Run them when you want to know something, including on a box you are
unsure about. One exception worth reading before you type it:
`load-tile-cache.sh` spends money.

| Script | Notes |
|---|---|
| `probe-environment.sh` | Fingerprints a deployment. Baseline before a risky change, diff after. |
| `verify-backup.sh` | Proves a backup restores, into throwaway containers and volumes. Never touches the running stack. |
| `verify-ci-access.sh` | Proves CI's registry path still works, the way CI does it. |
| `verify-image-hygiene.sh` | Fails if an image carries configuration it should get at runtime. Also runs in `generate-release.yml`. |
| `verify-tile-cache.sh` | MISS then HIT, and request collapsing. |
| `load-tile-cache.sh` | **Costs money**: every cold tile is a metered Earth Engine call, which is why the defaults are small. It also leaves the cache warm, so run it *after* anything measuring a cold cache. |

## container

`healthcheck.js` is bind-mounted into the Node services by
`docker-compose.prod.yml` and executed by Docker's `HEALTHCHECK`. Its contract
is with compose, not with a person: changing its path means editing three
mounts, and a wrong path makes Docker create a *directory* at
`/healthcheck.js`, after which every container reports unhealthy.

## Moving any of this

Two things outside the repo hardcode these paths, and both fail quietly: the
certbot `renew_hook`, which leaves renewal reporting success while nginx
serves an expiring certificate, and the backup cron, which just stops
producing backups.

Neither moves with a checkout, so both move in the same sitting as one. These
groups reached the VM on **2026-10-09** that way; this is the shape for the
next time, with the old and new paths substituted:

    cd /opt/rdp && git fetch origin && git reset --hard <ref>
    sudo sed -i 's#<old>#<new>#' /etc/letsencrypt/renewal/*.conf
    crontab -l | sed 's#<old>#<new>#' | crontab -

Run that last line **as `ksanchez`**, whose crontab holds the job. `crontab`
always edits the invoking user's own, so the same command under `sudo` reads
an empty root crontab and installs nothing, reporting no error.

**A third thing moves, and it is the one that bites.** Compose resolves a
bind mount when a container is *created*, so the three services mounting
`container/healthcheck.js` keep pointing at wherever the file was when they
started. They stay healthy on the old path after the checkout deletes it,
and the damage only lands on the next restart, when Docker finds nothing
there and creates a **directory** at `/healthcheck.js`. Recreate them in the
same sitting, with the tag already running, so there is no window:

    cd /opt/rdp
    RELEASE_TAG=$(grep '^IMAGE_TAG=' .env.prod | cut -d= -f2) SKIP_BUILD=1 \
      bash infrastructure/vm/scripts/ops/deploy-release.sh

Then prove all three, rather than assuming, since none of them announces a
failure:

    sudo grep -h renew_hook /etc/letsencrypt/renewal/*.conf   # must name the new path
    crontab -l | grep backup.sh                               # must name the new path
    docker inspect rdp-prod-client-1 rdp-prod-cms-1 rdp-prod-tiler-1 \
      --format '{{.Name}} {{range .HostConfig.Binds}}{{.}} {{end}}' | tr ' ' '\n' | grep healthcheck
    sudo certbot renew --dry-run --run-deploy-hooks           # exercises the hook
    bash infrastructure/vm/scripts/ops/backup.sh              # exercises the cron line

Six scripts also `cd` to the repo root by relative depth. They guard on
`docker-compose.prod.yml` being there, so a wrong depth fails on the first
line rather than halfway through a restore.
