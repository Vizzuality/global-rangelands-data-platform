# ILRI VM stack: local

Single-VM Docker Compose deployment for [GRASS-384](https://vizzuality.atlassian.net/browse/GRASS-384),
replacing the GCP Cloud Run / Cloud SQL / Cloud Function setup. Five containers
(`nginx`, `client`, `cms`, `tiler`, `db`) on one private bridge; only nginx binds
host ports.

Run it: copy `.env.prod.example` to `.env.prod`, fill it in, then

    docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

Nothing here pushes an image anywhere. The images embed no secrets, but are still
environment-specific, because `NEXT_PUBLIC_*` are inlined at build time.

This file explains **why** the stack is built the way it is, for whoever
changes it. For **what to type** when something is wrong (deploy, roll back,
restore, renew the certificate, triage an outage), see
[`RUNBOOK.md`](./RUNBOOK.md).

`<public-name>` throughout both files means one value: the DNS name the
certificate is issued for, which is `SERVER_NAME` in `.env.prod` and the
directory name under `/etc/letsencrypt/live/`. Today that is
`139-162-197-186.ip.linodeusercontent.com`; see **Domain states** for what it
becomes at cutover.

## Routing contract

Reproduces the GCP load balancer's URL map, including prefix stripping
(`path_prefix_rewrite = "/"` in `infrastructure/base/modules/load-balancer/main.tf`).

| Path | Backend | Prefix stripped | Cache |
|---|---|---|---|
| `/` | `client:3000` | no | none |
| `/cms/*` | `cms:1337` | yes | none |
| `/functions/eet/*` | `tiler:8080` | yes | 1 week, query string in key |

The tiler sends no `Cache-Control` header, so nginx must cache in spite of that
(`proxy_ignore_headers`), the equivalent of Cloud CDN's `FORCE_CACHE_ALL`.
Without it every tile request reaches a metered Earth Engine dependency.

Tile responses carry `X-Cache-Status` (`MISS`, `HIT`, `EXPIRED`, `STALE`,
`UPDATING`), which is how the cache is diagnosed from outside the container:

    curl -sk -o /dev/null -D - 'https://<public-name>/functions/eet/7/64/63?tileset=anthropogenic_biomes' \
      | grep -i x-cache-status

`infrastructure/vm/scripts/checks/verify-tile-cache.sh` asserts the two
properties that
inspection cannot confirm: that a second request for the same URL is a `HIT`,
and that ten concurrent cold requests produce at most two upstream fetches.
Measured: **1**. `proxy_cache_lock` is doing that. Cloud CDN collapsed
concurrent misses implicitly and nginx does not, so without it a pan across a
fresh zoom level fans out one Earth Engine call per tile against a single
unscaled instance.

The cache lives on the `tilecache` volume, so it survives container restarts;
a one-week TTL would otherwise be discarded on every deploy.

### Under load

`load-tile-cache.sh` walks a grid of tiles over East Africa, where the
rangelands layers actually have data, and measures the cache twice. It costs
money, because every cold tile is a metered Earth Engine call, so the defaults
are small (2 zooms x 4x4) and the warm pass reuses the same URLs.

Measured on the rehearsal stack, 32 tiles:

| | cold | warm |
|---|---|---|
| median | 2.545 s | **0.009 s** |
| p95 | 3.387 s | 0.014 s |
| cache status | 32 MISS | 32 HIT |

A cached tile comes back roughly **270x faster** than a cold one. The cold p95
of 3.4 s is the number that matters for a first pan across a fresh zoom level,
and it is why request collapsing is load-bearing.

### The key zone binds before `max_size` does

The two ceilings on the cache are `max_size=30g` and `keys_zone=100m`, and
nginx indexes roughly 8000 keys per megabyte of zone, so the zone tops out
near **800,000 tiles**. They cross at a mean tile of **40 KB**: below that the
key zone runs out first, above it the bytes do.

The sampled mean is **2978 bytes**, so on this evidence the key zone binds by
more than a factor of ten: the cache would stop around 2.3 GB of a 30 GB
allowance. That is not a fault, but `max_size=30g` is not buying what it looks
like it is buying. Raising the zone to index 30 GB of 3 KB tiles would cost
over a gigabyte of resident memory on an 8 GB box, so the realistic choice is
to lower `max_size` and keep the memory. Worth revisiting with tile sizes
measured from the real layer mix rather than one tileset.

### Surviving a tiler outage

With the tiler stopped, an already-cached tile still returns **200** and an
uncached one returns **504** rather than something wrong. So an Earth Engine
or tiler failure degrades to "the map works where people have already been",
which is the right shape of failure.

This does **not** exercise `proxy_cache_use_stale`. Entries stay valid for a
week, so a short test only ever sees a fresh `HIT`; the stale path would need
an entry past `proxy_cache_valid` to trigger. Untested, and only reachable
after a week of uptime.

## Health endpoints

All three Node services share
`infrastructure/vm/scripts/container/healthcheck.js`,
bind-mounted read-only at `/healthcheck.js`:

    node /healthcheck.js <url> [maxStatus]     # healthy when status < maxStatus, default 400

Measured on Strapi 5.52.0:

| Path | Status |
|---|---|
| `/_health` | **204** |
| `/admin` | 200 |
| `/api` | 404, no route at the bare prefix |

`/_health` answering 204 rather than 200 is why the check compares against a
maximum status instead of testing equality with 200.

The client is checked with a maximum of 500, because Next redirects `/` to a
locale prefix and a 3xx there still means the container is up.

## TLS

nginx terminates TLS on 443. Port 80 serves exactly two things: the ACME
challenge webroot, and a 301 to the same path on HTTPS.

Locally, generate a self-signed pair into the `certs` volume:

    docker run --rm -v rdp-prod_certs:/certs \
      -v "$PWD/infrastructure/vm/scripts:/s:ro" \
      -e SERVER_NAME=localhost -e OUT_DIR=/certs \
      --entrypoint sh alpine/openssl:latest /s/setup/gen-selfsigned-cert.sh

The SAN covers `localhost`, `alias.localhost` and `127.0.0.1`, so the canonical
redirect can be exercised over TLS without a certificate warning confusing the
result.

The same script is also the first step on a VM that has no certificate yet;
see **Standing up a box from scratch**. It is not a local-only convenience:
nginx will not start without a certificate, so without a throwaway pair there
is no `:80` listener for certbot to validate through.

### On the VM

certbot is installed on the **host**; nginx runs in a container. That drives
every decision here.

1. **Copy** the issued pair into the `certs` volume; do not bind-mount
   certbot's live directory.

   `live/<public-name>/` holds no certificates. It holds relative symlinks
   (`fullchain.pem -> ../../archive/<public-name>/fullchain1.pem`) so that the name
   stays stable while each renewal writes a new numbered file into
   `archive/`. A container only sees what is mounted, so mounting
   `live/<public-name>` alone puts `../..` outside the mount: the links dangle and
   nothing can read them.

   Mount the **whole** tree and `cp -L` reads through the links to the real
   files, leaving the compose file unchanged:

       docker run --rm -v rdp-prod_certs:/certs -v /etc/letsencrypt:/le:ro \
         alpine sh -c 'cp -L /le/live/<public-name>/fullchain.pem \
                             /le/live/<public-name>/privkey.pem /certs/'

   > The mount *point* is irrelevant: measured, that command works with the
   > tree at `/le`, because the links are relative and only need `../..` to
   > be inside the mount. `cert-deploy-hook.sh` mounts at `/etc/letsencrypt`
   > for a different reason: certbot hands it `$RENEWED_LINEAGE` as an
   > absolute host path, which it uses verbatim inside the container, so
   > there the two paths must agree.

   The container reads `fullchain.pem` and `privkey.pem` by those exact
   names, which is what certbot already writes, so nothing is renamed.

   Separately, the ACME webroot is `${CERTBOT_WEBROOT}`, required with no
   default. It has to be the host directory certbot writes the challenge
   into (`/var/www/certbot` here), because host certbot cannot write into a
   Docker volume, and a volume there makes every challenge 404. There is
   deliberately no fallback: one that worked silently on a laptop and failed
   silently on this machine is worth less than an error naming the variable.
2. Issue with `--webroot`. **Not `--standalone`**: it binds port 80 itself and
   would contend with the nginx container.
3. Add a deploy hook, or renewal has no effect: a new file on disk changes
   nothing until the running container rereads it.

       --deploy-hook 'docker compose -f docker-compose.prod.yml exec nginx nginx -s reload'

   Without it certbot reloads a host nginx that does not exist, exits 0, and the
   container keeps serving the expired certificate.
4. Verify renewal rather than assuming it. Run `certbot renew --dry-run`, then
   confirm the container is actually serving the new certificate
   (`openssl s_client -connect <public-name>:443 | openssl x509 -noout -dates`).

Assert the challenge path is reachable **before** requesting a certificate. A
`301` here means HTTP-01 validation will fail:

    curl -s -o /dev/null -w '%{http_code}\n' http://<public-name>/.well-known/acme-challenge/probe

Expect `404` (or `200` with a token file present). Never `301`.

## Media

Uploads go to Strapi's **local** provider on the `media` volume, served
same-origin at `/cms/uploads/*`.

Selecting the local provider is an *omission*, not a setting:
`cms/config/plugins.ts:8` spreads the GCS upload config only when
`GCS_BUCKET_NAME` is set, so leaving it out of `.env.prod` is the whole change.
Setting it again is the revert path.

Verified on the local stack:

| Assertion | Result |
|---|---|
| `files.provider` | `local` |
| `files.url` | `/uploads/<hash>.png` |
| `GET /cms/uploads/<hash>.png` | 200 `image/png` |
| `GET /uploads/<hash>.png` (prefix not stripped) | 404 |
| after `up -d --force-recreate cms` | 200 |
| file location | on the `media` volume, not the container layer |

The recreate matters: a plain `restart` keeps the container's writable layer and
would pass even with no volume mounted, which is exactly the failure being tested
for. This is the behaviour GRASS-369 solved with GCS, now solved without a cloud
dependency.

> Strapi re-encodes uploads through sharp, so the served bytes differ from the
> bytes posted (here RGBA → 8-bit colormap at the same dimensions). Compare
> dimensions, not checksums.

### CMS images bypass next/image

CMS images are rendered with `unoptimized` and a src from `cmsImageSrc`
(`client/src/lib/cms.ts`), which picks one of Strapi's own resized variants.
nginx proxies `/cms/*` to Strapi, so the bytes come straight from the CMS and
the client never reads media from disk. The `media` volume is deliberately
**not** mounted into the client container.

The optimizer cannot be relied on for these files, for two reasons that stack:

1. It resolves a relative `url` against the **Next server's own origin**,
   because the optimizer fetch happens server-side. The client container does
   not serve `/cms/*`, nginx does, so Next fetches its own 404 page and
   answers `400 The requested resource isn't a valid image`.
2. Mounting the volume at `/app/public/cms/uploads` makes those paths local and
   looks like a fix, but Next lists `public/` **when the server starts**. An
   upload that reaches the volume afterwards still 400s until the client
   container restarts. In practice that means an editor adding an image in
   Strapi admin gets a broken image on the live site, with no error anywhere
   except the browser.

Measured: a byte-identical copy of a working upload, written to the volume
under a new name, returns 400 at every width; a plain `docker restart` of the
client, with no rebuild, turns the same request into a 200.

Dropping the optimizer costs little, because Strapi already resized everything
at ingest and records the results in `files.formats`. Across the story images:
`small` (500w) on all of them, `medium` (750w) and `large` (1000w) on all but
one. `cmsImageSrc` returns the narrowest variant at least as wide as the caller
asks for, falling back to the original.

One call site keeps the plain `mediaUrl` helper:
`containers/map/story-markers/marker.tsx` is `"use client"` with a bare `<img>`
the browser fetches directly, so none of the above applies.

Staging never hit either problem: its media URLs are absolute GCS URLs matched
by `images.remotePatterns`, so the optimizer could always fetch them. It loses
optimizer re-encoding for CMS images under this change and serves Strapi's
variants instead.

`infrastructure/vm/scripts/checks/probe-environment.sh` asserts this end to end.

### Migrating staging's media off GCS

Staging runs the GCS provider, so its `files` rows point at
`gs://rdp-staging-media` absolutely. Two halves, and only the second is blocked
on the database dump:

    bash infrastructure/vm/scripts/migration/migrate-media-from-gcs.sh     # files  (unblocked)
    ... restore the dump first ...
    docker compose -f docker-compose.prod.yml --env-file .env.prod \
      exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 \
      < infrastructure/vm/scripts/migration/rewrite-media-urls.sql          # db rows

The bucket is public (`publicFiles: true`), so the copy needs **no gcloud
credentials** and runs the same from the VM. The script is idempotent,
re-fetching only what is missing or the wrong size, and verifies every file
against the bucket's byte count before handing ownership to uid 1001.

The logic lives in `migrate-media-from-gcs.mjs`; the `.sh` is a launcher that
runs it inside `node:22-alpine` with the upload volume mounted. **Nothing needs
installing on the host**: no Node, no gcloud, no GCS SDK, only Docker,
the same arrangement the dump and restore scripts use for `pg_dump`.

It writes straight into the named volume and receives its own source on stdin,
so it has no bind mount and therefore works unchanged against a remote daemon:

    docker context create rdp --docker host=ssh://user@139.162.197.186
    DOCKER_CONTEXT=rdp bash infrastructure/vm/scripts/migration/migrate-media-from-gcs.sh

That is the general rule for driving the VM from a laptop: bind mounts resolve
on the **daemon's** filesystem, not the client's, so a script that mounts a
local path will silently read an empty directory on the far side. Named volumes
are daemon-side by definition and are safe.

**Paths are flattened, and that is load-bearing.** GCS stores one folder per
file (`<hash><ext>/<hash><ext>`); the local provider reconstructs paths as
`uploads/<hash><ext>` on delete and replace
(`@strapi/provider-upload-local/dist/index.js:96,123,148`) and ignores the
stored `url`. Keeping the folders would serve reads correctly and silently break
deletion: Strapi reports success and the file stays on disk forever. The script
asserts basenames are unique before flattening and aborts naming the collisions;
staging has none.

`rewrite-media-urls.sql` repoints `files.url`, every derivative `url` inside the
`formats` jsonb, `provider`, `provider_metadata` and `preview_url`. Each
statement is guarded by a `WHERE` its own effect falsifies, so it is safe to
re-run, and it ends by asserting nothing references the bucket.

### The GCS allowlists stay, deliberately

`client/next.config.mjs` (`images.remotePatterns`) and `cms/config/middlewares.ts`
(CSP `img-src` / `media-src`) still list `storage.googleapis.com`. **Do not remove
them yet.** Both files are single-copy and read by staging as well, which does run
the GCS provider: its live admin CSP header carries that host, and all of its media
URLs are on `storage.googleapis.com/rdp-staging-media/`. Removing the entries blanks
every Media Library thumbnail there and makes `next/image` reject staging's imagery.

Both settings are allowlists, so an entry the VM never exercises costs nothing.
Remove them, along with the `staging.rangelandsdata.org` pattern and the
`rdp-landing-bucket` one that is referenced by neither code nor content, once
staging is decommissioned.

## Relative tile URLs

Layer configs store the tiler template as `/functions/eet/{z}/{x}/{y}/`, with no
host. The browser resolves it against whatever origin served the page, so the
same database works on `localhost`, a spare hostname and the apex domains
without a rewrite.

Verified in a real browser against the live stack: the template resolves to the
page origin, the request reaches nginx, and four different tilesets
(`anthropogenic_biomes`, `livestock_production_systems`, `forest_loss`,
`gridded_livestock_buffalo`) each return `200 image/png` decoding to a 256×256
`ImageBitmap`, which is what `BitmapLayer` consumes. `setRasterTiles`
(`client/src/lib/json-converter/utils/setters.ts:90`) is plain string
concatenation and nothing in the map code calls `new URL()`, so the relative
string reaches `TileLayer.data` untouched.

Only raster layers are affected. All 16 `MVTLayer` rows source
`https://api.mapbox.com/v4/...` and are deliberately left absolute: they are
third-party tiles, not ours to relocate.

> When testing a tile by hand, pick a tileset that takes no `startYear` /
> `endYear`. `modis_net_primary_production` requires them and answers `400`,
> which reads like a routing failure and is not one.

> Verified 2026-10-05 with a real `pk.` token: a browser probe of `/en/map`
> records the basemap composite source and the `grass2024` MVT tilesets all
> returning 200, with the overlay visible. See "The render path, and the token
> it needs".

## Content baseline

Recorded 2026-09-07 from the live staging API. These are the assertion targets
for the restore.

| Entity | Count |
|---|---|
| datasets | 21 |
| layers | 44 |
| stories | 19 |
| ecoregions | 370 |
| rangelands | 7 |
| dataset-categories | 4 |
| story-categories | 3 |

> `curl` treats `[` and `]` as a glob range specifier, so every Strapi query
> (`pagination[pageSize]`, `populate[0]`, `filters[slug][$eq]`) needs `-g`
> (`--globoff`). Without it curl fails with "bad range specification" and writes
> nothing at all, no body and no `-w` output, which looks like an empty API
> response rather than an error. Use `-sS`, never bare `-s`, when diagnosing.

> The table counts are **exactly twice** these numbers (datasets 42, layers 88,
> stories 38, ecoregions 740, rangelands 14, dataset-categories 8,
> story-categories 6). That is Strapi 5's draft & publish: draft and published
> versions are separate rows sharing a `document_id`, and the REST API returns
> only the published half by default. Verified on the restored dump: the
> `published_at IS NOT NULL` count matches every row of the table above exactly.
> A restore that silently dropped one half would still look right in the admin,
> so assert on both numbers.

### The dump

| | |
|---|---|
| taken | 2026-09-09 14:32 UTC |
| file | `dumps/staging-20260909T143213Z.dump` |
| size | 499,670 bytes (the 2026-03-06 `grass-staging.dump` was 254,903) |
| sha256 | `9be52b5a43da668c…` |
| source | PostgreSQL 14.23, dumped by `pg_dump` 16.14 |
| tables | 75, 910 TOC entries |

Restored into a clean `postgres:16-alpine` with `--no-owner --no-privileges`:
**exit 0, zero errors, zero warnings**, and zero occurrences of
`transaction_timeout` in the archive, the PG17 hazard the containerised client
exists to avoid.

### Absolute URLs embedded in content

Located by scanning all **234** text and JSON columns, not by guessing table
names.

| What | Where | Rows | URL occurrences |
|---|---|---|---|
| tiler tile template | `layers.config` | 52 (26 published) | 52 |
| media, originals | `files.url` | 22 | 22 |
| media, derivatives | `files.formats` | 19 | 74 |

All 52 tiler URLs are **byte-identical**: `https://staging.rangelandsdata.org/functions/eet/{z}/{x}/{y}/`.
No query strings and no per-layer variation, so the rewrite is one literal
replacement in one column, not a regex over varied inputs.

The trailing slash survives prefix stripping: `/functions/eet/6/33/32/` reaches
the tiler as `/6/33/32/`, and Express's default non-strict routing matches it
against `/:z/:x/:y`. Verified end to end (200 `image/png`) and in isolation
against the router pattern, because all 52 layers depend on it.

Media cross-checks, three independent paths agreeing on **96**: the live API,
the dump text, and `22 + 74` from the table above. Of the 118 objects the bucket
held at the time of this run,
**0** referenced files are missing from the volume and 22 are orphans from
deleted or replaced uploads.

Two further notes from the scan:

- `files` holds a stray `.gitkeep` upload (`provider` already `local`), so there
  are 22 real files, not 23. The rewrite skips it by its `WHERE` guards.
- The three PDFs have `formats IS NULL`, because Strapi generates derivatives
  only for images, and format keys vary by source dimensions (`thumbnail` 19,
  `small` 19, `large` 18, `medium` 18). That is why the rewrite rebuilds the blob with
  `jsonb_object_agg` instead of hardcoding four keys.

The 10 remaining `staging.rangelandsdata.org` references are auto-generated
users-permissions OAuth callback URLs. All 16 providers are `enabled: false`
(only `email` is on), so they are inert boilerplate rather than a migration
concern.

### Taking the dump

Staging is Cloud SQL `rdp-staging-cjhi` (POSTGRES_14) on the **private** IP
`10.243.0.3`, so the only route in is the bastion `rdp-staging-bastion`
(`us-central1-a`, external IP `34.71.194.79`), defined in
`infrastructure/base/modules/bastion/`. Database and user are both `strapi`
(`infrastructure/base/main.tf:34-35`); the password is in Secret Manager as
`rdp-staging_postgres_user_password_secret`.

**SSH to the bastion as `ubuntu`, not as yourself.**
`infrastructure/base/modules/bastion/main.tf:31` builds the metadata as
`"ubuntu:${ssh-key}"`, so every key in `var.ssh_keys` is authorized for the
`ubuntu` account whoever owns it. OS Login is not enabled on the instance, so
nothing maps an IAM identity to a Linux user, and `gcloud compute ssh` defaults
to your local username, which has no key and fails with
`Permission denied (publickey)`.

```bash
# Terminal 1 — tunnel. Leave it running.
gcloud compute ssh ubuntu@rdp-staging-bastion --zone us-central1-a --project gmvad-grass \
  --tunnel-through-iap -- -N -i ~/.ssh/id_rsa -L 5432:10.243.0.3:5432

# Or bypass IAP — the bastion has an external IP:
#   ssh -i ~/.ssh/id_rsa -N -L 5432:10.243.0.3:5432 ubuntu@34.71.194.79

# Terminal 2
export PGPASSWORD=$(gcloud secrets versions access latest \
  --secret=rdp-staging_postgres_user_password_secret --project=gmvad-grass)
PGUSER=strapi PGDATABASE=strapi bash infrastructure/vm/scripts/migration/dump-staging.sh
```

`dump-staging.sh` runs `pg_dump` inside `postgres:16-alpine` rather than using a
host client. The version matters: a PostgreSQL 17 `pg_dump` writes
`SET transaction_timeout = 0;` into the archive preamble, a setting PostgreSQL 16
does not recognise, so restoring into the PG16 target aborts. Staging is PG14, and
a newer client against an older server is supported while the reverse is not, so
16 is the only correct choice, and pinning it to an image tag keeps it that way on
any machine, including the VM, which has no PostgreSQL client installed.

> The `gcloud` CLI's own credentials expire independently of Application Default
> Credentials. When the CLI fails with "select an already authenticated account",
> `gcloud auth login` fixes it; ADC-based REST calls keep working meanwhile.

> This dump will be the only backup of the platform's content that we control.
> Staging Cloud SQL is the sole source of truth for every content entry, and its
> `deletion_protection` has proven unreliable. Keep a copy off the laptop.

## Restoring content

    export $(grep -E '^(POSTGRES_USER|POSTGRES_DB)=' .env.prod | xargs)
    DUMP=$(ls -t dumps/staging-*.dump | head -1) \
      bash infrastructure/vm/scripts/migration/restore-dump.sh

Destructive: it drops and recreates the database. `cms` is stopped first because
`config-sync` holds a connection pool open, and `DROP DATABASE ... WITH (FORCE)`
terminates whatever is left.

Then, in this order, both idempotent and both safe to re-run after any later
import:

    C="docker compose -f docker-compose.prod.yml --env-file .env.prod"
    $C exec -T db psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
      < infrastructure/vm/scripts/migration/rewrite-tile-urls.sql
    $C exec -T db psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
      < infrastructure/vm/scripts/migration/rewrite-media-urls.sql

The rewrites run **last**. Loading content by any route re-introduces absolute
URLs, so they are a post-import step, not a one-off migration.

### Results of the rehearsal

PG14 → PG16 restore: `pg_restore` **exit 0, zero errors, zero warnings**. Strapi
then booted against it and `config-sync import -y` applied cleanly.

| | Before | After |
|---|---|---|
| absolute tiler URLs in `layers.config` | 52 | **0** |
| relative tiler URLs | 0 | **52** |
| `files` rows on `storage.googleapis.com` | 22 | **0** |
| `files.formats` blobs on GCS | 19 | **0** |
| `files.provider` not `local` | 22 | **0** |

Re-running both scripts changed nothing, and no `//functions/eet/` appeared,
which is the double-rewrite failure mode a careless second pass would produce.

The `formats` rewrite was checked for silent destruction as well as for absence
of the bucket name: 19 blobs still present, derivative key counts unchanged
(`thumbnail` 19, `small` 19, `large` 18, `medium` 18), all 74 derivative URLs
intact, and every sibling field (`hash`, `ext`, `mime`, `width`, `sizeInBytes`)
preserved. A `jsonb_object_agg` that returned `NULL` would have passed a
bucket-name check while wiping the column.

**96 of 96** media URLs serve 200 through nginx. The one remaining 404 is
`/uploads/.gitkeep`, a stray Media Library row referenced by no content.
**staging returns 404 for the same URL**, so this is parity, not a regression.

> **No longer true as of the VM run below.** That note described
> `NEXT_PUBLIC_API_URL` holding an absolute staging URL, which was
> `ECONNREFUSED` from inside the client container. It is now the relative
> `/cms/api/`, and every server-rendered route returns 200 with CMS content
> in the HTML; `/en/stories/<category>` and `/en/map/story/<slug>` were
> checked with real slugs. `CMS_INTERNAL_API_URL` is still supplied and still
> unconsumed; splitting the base is worth doing, but it is an optimisation
> now, not a correctness fix.

### Results on the ILRI VM, 2026-10-07

Restored `staging-20261005T175537Z.dump`, which was confirmed current first:
its published counts match the live staging API exactly, including the two
stories added since the 2026-09-07 baseline (19 -> 21).

| Entity | Published | Rows | Live staging |
|---|---|---|---|
| datasets | 21 | 42 | 21 |
| layers | 44 | 88 | 44 |
| stories | 21 | 42 | 21 |
| ecoregions | 370 | 740 | 370 |
| rangelands | 7 | 14 | 7 |
| dataset-categories | 4 | 8 | 4 |
| story-categories | 3 | 6 | 3 |

Every total is exactly twice the published count, so draft & publish survived
intact: the half-restore that still looks right in the admin did not happen.

Media: 130 objects from the bucket (was 118 at the September run), all byte
counts matching the listing, `chown 1001:1001`. Rewrites: 52 tiler URLs to
relative, 26 `files.url` and 21 `formats` blobs off GCS, provider `local`,
and zero `//functions/eet/` or `//uploads/` double-rewrite artefacts. The
`formats` column was checked for silent destruction rather than for absence
of the bucket name: 82 derivative keys, 82 with a `url`, zero missing `hash`
or `width`.

**108 of 109 media URLs serve 200.** The one 404 is `/uploads/.gitkeep`;
staging returns 404 for the same path, so it is parity.

> The stored URL is `/uploads/<file>`, and **nothing serves that path**.
> nginx has no `/uploads/` location and it falls through to the client, which
> deliberately does not mount the upload volume. The application prepends
> `/cms` via `CMS_MEDIA_BASE` in `client/src/lib/cms.ts`, so the request that
> actually goes out is `/cms/uploads/<file>`, proxied to Strapi. Testing the
> stored URL directly gives a 404 for every file and looks like a failed
> restore. It is not.

## Acceptance, measured from cold

`docker compose down -v`, then rebuilt and re-migrated from nothing. Results are
observations from that run, not claims.

| # | Criterion | Result |
|---|---|---|
| 1 | Stack reaches healthy with no manual intervention | **125 s**, all five services |
| 2 | Both prefix-stripped routes answer | frontend 307→200, CMS API 200, admin 200, tile 200 |
| 2 | CMS never sees the `/cms` prefix | receives `/api`, `/admin`, `/_health` only |
| 3 | Tile cache stores, serves and collapses | MISS→HIT; **1** upstream fetch for 10 concurrent |
| 4 | Media survives a container recreate | 200 before and after `--force-recreate` |
| 6 | Content matches the staging baseline | all 7 entity counts exact |
| 7 | URL rewrites are idempotent | 52→0 then 0→0; media 0/0/0 twice |
| 8 | No stale hostname in delivered content | 0 GCS / 0 staging / 0 `cms:1337` across three pages and the database |
| — | HTTP redirects to HTTPS, ACME still served | 301, and `token-ok` on the challenge path |
| 5 | Basemap and deck.gl overlay render | composite + 2 `grass2024` MVT tilesets, all 200; overlay visible |
| — | Canonical redirect preserves path and query | `alias.localhost/x?y=1` → `https://localhost/x?y=1` |

> `down -v` also removes the `certs` volume. nginx fails its configuration test
> without `fullchain.pem`, so regenerate the certificate **between** teardown and
> bring-up, not after. The same applies on the VM whenever the volume is
> recreated.

> The cold sequence must also re-run `migrate-media-from-gcs.sh`; the `media`
> volume is destroyed with the rest, and without it every image 404s while the
> database still references the files.

### The render path, and the token it needs

Verified in headless Chrome over the DevTools Protocol against
`https://localhost/en/map`, recording every request. The basemap fetches the
comma-joined composite source; the deck.gl layers fetch individual tilesets as
`grass2024.<id>/{z}/{x}/{y}.mvt`. Those are the `MVTLayer` requests, and they
are what distinguishes a working overlay from a working basemap. All returned
200, with no console errors, and the overlay is visible in the capture.

This needs a **public** token. `mapbox-gl` tests the first character of the
token and throws before issuing any request:

    if ("s" === i[0]) throw new Error(`Use a public access token ...`)

An `sk.` token therefore produces a blank map and **zero** network requests,
which reads as a tile or network fault rather than a credential one. Unticking
secret scopes on an existing token does not help: the prefix is fixed when the
token is issued, so a public token has to be created fresh with no secret scope
selected. See **Mapbox token**.

## Image sizes

Both units are given because `docker image ls` reports MB while the build output reports MiB; 293 MiB and 308 MB are the same image. Each size was asserted alongside a working cold boot
(health endpoint plus a real 256×256 PNG tile), not in isolation.

| Image | Size |
|---|---|
| `rdp-tiler:local` | **355 MB**, on `node:22.23.1-bookworm-slim`, new here |
| `rdp-client:local` | 293 MiB / 308 MB (was 1391 MiB) |
| `rdp-cms:local` | 939 MiB / 984 MB (was 1516 MiB) |

### Why the tiler is 355 MB

| Component | Size |
|---|---|
| `node:22.23.1-bookworm-slim` base | 227 MB |
| `node_modules` (production only) | 136 MB |
| compiled `build/` | 0.1 MB |

Of the 136 MB of production dependencies, **`googleapis` is 97 MB (71%)**. It is
a transitive dependency of `@google/earthengine@0.1.405`, and not an optional
one: `node_modules/@google/earthengine/build/main.js` does a top-level
`require('googleapis')`, so removing it breaks the SDK at require time. The
monolithic Google APIs client ships hundreds of API surfaces in order to use one.

The floor for this service is therefore roughly `base + 136 MB`.

**`node:22.23.1-alpine` was built and verified** as an alternative, with
identical behaviour (health 200, real PNG tile, same uid/gid) at **290 MB**, an
18% saving. Not adopted, deliberately:

- It would mean three base distros across three services (`client` is
  `node:24.15.0-bookworm-slim`, `cms` is `node:22.23.1-bookworm-slim`), so two
  CVE feeds and two package managers to reason about at handover.
- The saving is one-time. A registry dedups layers, so the recurring per-deploy
  transfer is the changed application layer either way, 0.1 MB here.

Revisit if the base distro is ever unified, where it becomes free.

## Node versions are per-workspace and both bind

`cms/package.json` requires `>=20 <=22.x.x`; `client/package.json` requires
`24.x`. A shared base image would violate one of them. The tiler uses 22.23.1 to
match `cms` rather than introduce a third Node version.

## Backups

`backup.sh` captures the two things on the VM that cannot be rebuilt: the
database and the Strapi upload volume. Everything else is derived:
`tilecache` refetches on a miss, `certs` belongs to certbot on the host, and
`cmsdata` holds the import-export plugin's own dumps.

    bash infrastructure/vm/scripts/ops/backup.sh
    BACKUP_DIR=/var/backups/rdp RETENTION_KEEP=30 ./backup.sh   # cron form

Each run writes `<BACKUP_DIR>/<stamp>/` containing `db.dump` (custom format),
`media.tar.gz` and a `manifest.txt`. The manifest exists so a backup can be
audited without restoring it: if the media file count drops to zero one night,
that is visible in a one-line diff.

Two properties are deliberate:

- **The directory is built under `.partial-<stamp>` and renamed only on
  success**, so an interrupted run cannot leave something that looks like a
  usable backup.
- **Retention is count-based, not age-based.** A stack that stops producing
  backups should not also quietly delete the ones it still has.

Nothing is bind-mounted. Both artefacts stream to stdout and are redirected
by the caller, so the script works unchanged against a remote daemon and
writes to whichever machine invoked it.

### Restoring

    BACKUP=/var/backups/rdp/20260101T000000Z \
      bash infrastructure/vm/scripts/ops/restore-backup.sh

Destructive, and restores **both** halves. Restoring only the database would
leave `files` rows pointing at uploads that are no longer on disk.

### Verifying

`verify-backup.sh` restores a backup into a throwaway Postgres container and a
throwaway volume, then compares the result against the running stack:

| Check | Measured |
|---|---|
| `db.dump` restores into an empty Postgres | pg_restore exit status |
| Row counts match the live database | `stories`, `datasets`, `files` |
| Media matches the live volume | file count and total bytes |
| Uploads keep uid 1001 | Strapi cannot write a root-owned volume |

Measured on the rehearsal stack: **4 of 4 pass**, and negative-tested both
ways: a truncated `db.dump` and an archive missing 20 files each produce two
failures, in the half at fault.

It does not cover `restore-backup.sh` writing over the real stack, because
proving that costs a working environment. Exercise it by hand once before the
handover.

### The nightly job, and where it lives

This project installs exactly one scheduled job. RUNBOOK §9 is the inventory
of everything that runs unattended on the box, ours and ILRI's both; this is
the detail behind its first row:

    15 3 * * * cd /opt/rdp && BACKUP_DIR=/var/backups/rdp RETENTION_KEEP=14 \
      /bin/bash infrastructure/vm/scripts/ops/backup.sh >> /var/backups/rdp/backup.log 2>&1

Nightly at 03:15 UTC, keeping 14, logging beside the backups themselves. It
is read with `sudo crontab -u ksanchez -l` and appears in no file under
`/etc/cron.d`, which is the problem with it: **it lives in a personal
crontab**, on a Vizzuality account. A personal crontab is deleted with the
account and nothing outside it refers to the job, so the backups stop on the
day that account is closed, and the only symptom is `/var/backups/rdp`
quietly ceasing to grow. Before handover it belongs in
`/etc/cron.d/rdp-backup`, owned by root, which is the same line with a user
field:

    # /etc/cron.d/rdp-backup
    15 3 * * * root cd /opt/rdp && BACKUP_DIR=/var/backups/rdp RETENTION_KEEP=14 \
      /bin/bash infrastructure/vm/scripts/ops/backup.sh >> /var/backups/rdp/backup.log 2>&1

The line installed on the box today still names `scripts/backup.sh`, because
the checkout there predates the grouping of the scripts into subdirectories.
Both have to change together, and
[`scripts/README.md`](./scripts/README.md) has that sequence.

Of the five checks under §10 of the RUNBOOK, the one that covers this is the
mtime of `backup.log`: it observes the backups stopping, whatever the cause,
where a check on the crontab would only catch this one.

### Still missing

A backup on the same disk as the data it protects is not a backup. Off-box
copies are an open question for ILRI (where they go, who can read them, and
how long they are kept), and the answer affects `RETENTION_KEEP` above.

## Building in CI

`.github/workflows/generate-release.yml` builds `cms`, `client` and `tiler` and
pushes them into the registry **on the VM**. It deploys nothing. Deploying is
a separate command run on the box (RUNBOOK §2), for the reason in
`deploy-release.sh`: four services bind-mount paths out of the repo, and compose
resolves those on whichever machine runs the command.

The VM has four cores and serves the site. A `next build` there takes about
ten minutes and competes with live traffic, which is the whole reason this
exists.

### Generating a release

**Actions → Generate release → Run workflow**, from `staging`, with a
version like `v1.2.0`. The run, in order:

1. refuses anything that is not `staging`, a well-formed version, and a
   version that does not already exist;
2. asks the server, with `git push --dry-run`, whether `main` can
   fast-forward to this commit, and stops if it cannot;
3. installs the client, lints, and runs the tests;
4. builds the three images tagged `v1.2.0` and runs the hygiene check;
5. pushes them into the registry on the VM;
6. fast-forwards `main` and creates the annotated tag.

> **No versioned release has been cut yet**, so steps 1, 2 and 6 have never
> run. What has is the version-less build below, twice, including the push
> through the tunnel: the registry holds `20261008T155617Z-273ca16` and
> `20261009T103500Z-939f7c7` and no `v*` tag. **`main` does not exist on the
> remote either**, and the first release is what creates it; step 2 passes
> against a branch that is not there, because creating it is a fast-forward.
> Expect the first versioned run to be the one that finds anything wrong
> with steps 1, 2 and 6, and cut it at a time someone can look at it.

Deploying is then one name in two places:

    cd /opt/rdp
    git fetch origin --tags && git checkout v1.2.0
    RELEASE_TAG=v1.2.0 SKIP_BUILD=1 bash infrastructure/vm/scripts/ops/deploy-release.sh

That is the point of a named version. The checkout supplies the bind-mounted
`nginx.conf`, templates and `healthcheck.js`; `RELEASE_TAG` selects the
images they have to match. Under the previous `<utc-stamp>-<short-sha>`
scheme the operator carried two identifiers and kept them in step by hand.

Leave `version` **empty** to build from any ref without releasing: same tests
and same build, a `<utc-stamp>-<short-sha>` tag, no branch moved and no git
tag created. That is how to exercise this pipeline, and how to get an image
for a branch not ready to be promoted.

> **Why fast-forward and not a merge.** A merge commit is not the commit the
> images were built from, so the version would name two different trees,
> exactly the drift this is meant to remove. A plain push to `refs/heads/main`
> is rejected by the server unless it fast-forwards, so the guarantee is
> enforced by GitHub rather than by this workflow being careful. If it is ever
> refused, `main` has a commit `staging` does not, and that is worth going to
> look at rather than forcing past.

> **Releases are not garbage-collected.** `registry-gc.sh` only collects tags
> of the stamped shape, so `v1.2.0` stays until someone removes it. That is
> deliberate, since a rollback target should not expire, but it is unbounded, so
> prune old releases by hand when the registry grows. Note the workflow pushes
> *only* the version tag: adding a stamped tag alongside it would buy nothing,
> because GC deletes by digest and skips any digest a protected tag shares.

> **Tests.** Step 3 is new coverage, not a reorganisation: nothing in CI ran
> the tests before this workflow. There are ten, in `src/lib/cms.test.ts` and
> `src/i18n/navigation.test.ts`, and they take under a second. The image build
> is the stronger gate: `next.config.mjs` does not set `ignoreBuildErrors`,
> so `next build` type-checks the whole client.

> **`main` and Cloud Run.** Creating `main` would have switched on
> `main.yml`'s push trigger, which maps that branch to
> `ENVIRONMENT=PRODUCTION` and deploys to GCP. GCP production was never
> provisioned (`module "production"` is commented out in
> `infrastructure/base/main.tf`), so all three jobs would fail on missing
> `TF_PRODUCTION_*` secrets. `main` has been removed from that trigger;
> `staging` is untouched. Production is this VM now, and the role left for
> `main` is to record what was released to it.

### Reaching a registry that is bound to loopback

A push is initiated by the pusher, so CI has to reach the VM. It does it with
the forward described under **The image registry** below,
`ssh -L 5000:127.0.0.1:5000`, which is what lets a registry nobody can reach
take a push from GitHub without being exposed.

Fail2Ban is not an obstacle: it bans on authentication *failures*, and a
client presenting a valid key authenticates first try. The eight addresses it
is currently holding are all password brute-forcers.

The tunnel lives in `.github/actions/vm-registry-tunnel`, a first-party
composite action, not inline in the workflow and not a marketplace one. There
is no official action for it, since the `actions` org publishes nothing for SSH
or port forwarding, and the popular third-party ones load keys or run remote
commands rather than forward ports, so they would replace a few lines while
adding code we do not control to the one step holding a production
credential.

> **`ExitOnForwardFailure` is not enough, measured.** Pointed at a VM port
> where nothing listens, `ssh -f -N -L` exited **0** and bound the local port
> anyway; every request through it then failed. That is the same shape as a
> `permitopen` refusal, because `permitopen` is enforced when a channel opens
> rather than at session setup. So the action probes `/v2/` through the
> forward and fails if it does not answer. "The tunnel came up" is not
> evidence; a request that traverses it is.

### The access that grants

A dedicated `rdpci` account, created by
`infrastructure/vm/scripts/setup/setup-ci-registry-access.sh`, whose single
capability is forwarding to `127.0.0.1:5000`:

    command="/bin/false",restrict,port-forwarding,permitopen="127.0.0.1:5000"

Two layers, because the key lives in GitHub's secret store and the question
is not whether the restriction holds but what happens if it does not:

- **The key options.** `command="/bin/false"` is the load-bearing part.
  `restrict` on its own does **not** prevent command execution: it disables
  pty, agent, X11, user-rc and forwarding, but `ssh host 'cat /etc/shadow'`
  still runs. This was got wrong once during setup and caught by testing it
  rather than reading it: the first attempt returned a shell and the contents
  of `.env.prod`. With `ssh -N` no session channel is opened, so the forced
  command never fires and the tunnel is unaffected.
- **The account.** `rdpci` is a system account with `/usr/sbin/nologin`, no
  password, no sudo, and deliberately not in `docker`, because membership in
  that group is root-equivalent. The deploy user (`ksanchez`) has all three, which
  is exactly why the CI key is not on it.

`sshd` here enforces `AllowUsers`, so the account is added to that list or it
cannot connect at all, and the refusals would feed Fail2Ban.

### What that key can actually do, measured

Tested by sending traffic, not by reading the config, which is the only
way that found the gap below. For a `-L` forward, `permitopen` is enforced
when the **channel opens**, not at session setup, so `ssh -N -L` binds
locally whether or not the destination is permitted. Checking that the
tunnel "came up" proves nothing.

| Attempt | Result |
|---|---|
| `ssh rdpci@vm 'cat /opt/rdp/.env.prod'` | refused |
| interactive shell / pty | refused |
| `-L` to `127.0.0.1:5000` | **allowed**, registry answers 200 |
| `-L` to `127.0.0.1:22` (sshd listening) | refused |
| `-L` to `127.0.0.1:9100` (node_exporter listening) | refused |
| `-L` to `example.com:80` (egress via the VM) | refused |
| `-D` SOCKS to an external host | refused; to the registry, allowed |
| agent forwarding, sftp | refused |
| `docker push` through the tunnel | **lands in the VM registry** |

The deny targets are ports with live listeners on purpose: refusing a port
where nothing is listening would prove nothing about `permitopen`.

> **`-R` was accepted on the first pass**, and that is why the `Match` block
> exists. `permitopen` constrains where `-L` and `-D` may connect *to*; it
> says nothing about `-R`, which binds a listener *on* the host. The VM
> ended up listening on `127.0.0.1:15998`. Not theoretical: if the registry
> container is ever stopped, a holder of this key could bind
> `127.0.0.1:5000` itself and serve poisoned images to the next deploy, so
> a key for pushing images could become the registry. No `authorized_keys`
> option expresses "local forwarding only", so it takes
> `AllowTcpForwarding local` in a `Match User rdpci` block. Confirm with
> `sshd -T -C user=rdpci`, which reports the effective value rather than
> what the file appears to say.

### Provisioning it, and checking it still holds

One command from a workstation that can already reach the VM as a sudoer and
is logged in to `gh`:

    DEPLOY_USER=<you> VM_HOST=139.162.197.186 \
      bash infrastructure/vm/scripts/setup/setup-ci-access.sh

It generates the keypair, runs the host-side script over SSH, pins the host
key, writes seven settings into the `vm` environment, writes a 0600
credential record for the password manager, and finishes by verifying the
result. The seven are the registry key as a secret, the three values the
workflow needs to reach the host, and the three build-time `VM_CLIENT_ENV_*`
variables, which it sets **only when they are absent** so that re-running it
to rotate the key cannot reset a hostname DNS has since moved. The Mapbox
token would be an eighth, and this script deliberately does not set it: see
**Setting the build values**.

The keypair is generated on the workstation, not the VM: the private half has
to reach GitHub anyway, and a key that was never on the host cannot be read
off it by anyone who later gets in.

**Keep the record.** `VM_REGISTRY_SSH_KEY` cannot be read back: the API
returns a name and two timestamps and no value, so a key that exists only
in the secret store exists nowhere you can reach. That was the state until
this script: the key could neither be filed nor verified, and deleting the
secret would have meant regenerating it.

Drift is the real risk here. ILRI exempted this host from Ansible on
2026-10-09, but that is an inventory entry on a machine we do not control, and
nothing in the playbook ever knew this account exists:

    bash infrastructure/vm/scripts/checks/verify-ci-access.sh

It opens the same forward the workflow opens, with the same pinned host key,
and makes a request through it. Opening the forward proves nothing on its
own, since `ssh -f -N -L` returns 0 and binds the local port even when the
far side refuses the channel. It then asserts the restrictions still hold:
command execution refused, remote forwarding refused, forwarding to anything
but the registry refused. A regression in any of those is silent, because
pushing images keeps working.

What neither script can prove is that GitHub holds the matching private key.
Only a dispatched run shows that.

Deliberately not Terraform, though `infrastructure/base` already manages
repository secrets through `modules/github_values`. That module writes
`plaintext_value` into state in `gs://rangelands-tf-state`, a Vizzuality
bucket, which is the dependency this migration removes. Terraform also has
no provider for this machine, so it would own one half of a keypair and
never see the other. `plan` would report no changes with CI access dead.

#### They live in an environment, not at repository level

Everything named `VM_*` is set on the `vm` **environment**, and
`generate-release.yml` is the only workflow that declares it. The reason is
`main.yml`: the staging deploy to GCP serialises the entire secrets context
with `toJSON(secrets)` in two of its jobs, so anything left at repository
level is handed to a job whose business is Vizzuality's GCP rather than
ILRI's host. An environment secret is visible only to jobs that name that
environment.

The `vars` context already includes environment variables once a job declares
one, so the existing `^(TF_)?(VM_)?CLIENT_ENV_` filter in the shared
`generate-env-file-from-json` action keeps working. That action did need one
additive change: it declares `ENVIRONMENT` and `APP_ENV_PREFIX` as inputs but
its script reads them as shell variables, and a composite action's inputs do
not become environment variables, so `main.yml` only works because it also
sets them as job env. Both steps now map the inputs to those names, and fail
loudly rather than filter on an empty prefix. `main.yml` passes
`ENVIRONMENT: ${{ env.ENVIRONMENT }}`, so the input is that same job
variable and staging's output is unchanged; nothing was removed, which is
what shared config allows until staging is decommissioned.

| | Where |
|---|---|
| `VM_REGISTRY_HOST`, `VM_REGISTRY_USER`, `VM_SSH_HOST_KEY` | `vm` environment, variables |
| `VM_CLIENT_ENV_*` | `vm` environment, variables; the Mapbox token a secret |
| `VM_REGISTRY_SSH_KEY` | `vm` environment, secret |
| `CLIENT_ENV_TRANSIFEX_TOKEN` | repository, shared with staging on purpose |

**No deployment branch policy is set yet.** Adding one restricted to
`staging` would stop any dispatchable branch obtaining the registry key, and
it is a settings change rather than a rework, but it would also stop the
version-less builds that feature branches rely on today. Set it once the
stack is on `staging` and those builds are no longer the way this is tested.

To reverse the whole arrangement: re-set each value at repository level, drop
`environment: vm` from the workflow, and delete the environment. The
variables are readable and can be copied back; the two secrets cannot, so the
Mapbox token comes from `.env.prod` on the VM and the registry key has to be
regenerated with `setup-ci-access.sh`.

### What the workflow needs configured

Build-time values follow the same convention as the staging deploy and are
collected by the same action, `generate-env-file-from-json`: everything named
`(TF_)?(VM_)?CLIENT_ENV_<NAME>` is picked up and the prefix stripped. Adding a
value to the build is a new repository secret or variable, not a change to
the workflow.

| Name | Value today |
|---|---|
| `VM_CLIENT_ENV_NEXT_PUBLIC_API_URL` | `/cms/api/` |
| `VM_CLIENT_ENV_NEXT_PUBLIC_URL` | `https://139-162-197-186.ip.linodeusercontent.com` |
| `VM_CLIENT_ENV_CMS_INTERNAL_API_URL` | `http://cms:1337/api/` |
| `VM_CLIENT_ENV_NEXT_PUBLIC_MAPBOX_TOKEN` | *(secret)* a `pk.` token |

#### Setting the build values

`setup-ci-access.sh` sets the three variables, and only when they are absent
so that re-running it to rotate the key cannot reset a hostname that DNS has
since moved. Pass `PUBLIC_URL` to give it a different one:

    PUBLIC_URL=https://www.rangelandsdata.org \
      DEPLOY_USER=<you> VM_HOST=139.162.197.186 \
      bash infrastructure/vm/scripts/setup/setup-ci-access.sh

To change one afterwards, or to set them against a different environment:

    gh variable set VM_CLIENT_ENV_NEXT_PUBLIC_URL --env vm \
      --body 'https://139-162-197-186.ip.linodeusercontent.com'
    gh variable set VM_CLIENT_ENV_NEXT_PUBLIC_API_URL  --env vm --body '/cms/api/'
    gh variable set VM_CLIENT_ENV_CMS_INTERNAL_API_URL --env vm --body 'http://cms:1337/api/'

The Mapbox token is set by hand, from a file rather than an argument so it
does not reach the shell history:

    gh secret set VM_CLIENT_ENV_NEXT_PUBLIC_MAPBOX_TOKEN --env vm < token.txt
    shred -u token.txt

It has to be a **publishable** `pk.` token: the release workflow rejects an
`sk.` one, because the value is inlined into the public JavaScript bundle.
The same token is in `.env.prod` on the VM, which is the only other copy:
a GitHub secret cannot be read back, and the API returns nothing but the
name and timestamps. If both are lost the token has to be reissued from the
Mapbox account and added to the allowlist again.

The collected values are written to the file compose reads with `--env-file`,
**not** to `client/.env.local` as the Cloud Run path does. The VM images build
with `STRIP_ENV_FILES=1` and take their configuration as build args, so that
is where the values have to arrive.

> This is the one place the two paths genuinely differ, and the reason is in
> `client/Dockerfile.prod`: the `NEXT_PUBLIC_*` are declared `ARG` only, never
> restated as `ENV`. A build arg is in the environment of `RUN` when passed
> and genuinely absent when not, which is what lets the Cloud Run path fall
> through to `.env.local`. Restating them as `ENV` would define them as empty
> strings on that path, and `@next/env` only fills in variables that are
> *absent*, so `""` would win over `.env.local`.

Which names are required is not listed in the workflow at all.
`docker-compose.prod.yml` declares each build arg as `${VAR:?...}`, so compose
refuses to interpolate the file when one is unset **or empty**, and says which:

    error while interpolating services.client.build.args.NEXT_PUBLIC_URL:
    required variable NEXT_PUBLIC_URL is missing a value: inlined into the
    browser bundle at build time

The workflow only asks for that interpolation early, with
`docker compose ... config --quiet`, so the failure costs a second instead
of arriving at the build step. Because the rule lives in the compose file, it
holds for a build on the VM or on a laptop as well as in CI, and adding a
build arg is the same act as requiring it.

> Use `--quiet`. A plain `docker compose config` prints the fully resolved
> file, which is every secret in the env file; that is the leak 82aab64 fixed
> for the staging workflow.

One check stays in the workflow, because compose cannot express it: a Mapbox
token beginning `sk.`. That is not a missing value but a wrong one, and since
the token is inlined into the public browser bundle, a secret token there is a
secret published.

> **Correction.** An earlier version of this section said an empty value
> "ships a bundle that looks built and is broken". Measured, it does not:
> `client/src/env.mjs` sets `emptyStringAsUndefined: true` and declares all
> three `NEXT_PUBLIC_*` as required, so `""` becomes `undefined`, zod rejects
> it, and `next build` fails during route analysis. The failure is loud.
>
> What the guard is worth is the second and the variable name, instead of ten
> minutes of image build answered with a zod trace. It also covers
> `CMS_INTERNAL_API_URL`, which is a build arg but is **not** in `env.mjs`, so
> nothing else would catch an empty one.
>
> Note compose reports only the **first** offending variable, where the
> earlier Python check listed all of them at once. For four values set once
> per environment that is a fair trade for deleting the check.

> `NEXT_PUBLIC_URL` is **baked into the bundle at build time**, so it is not
> configuration the VM can change. At DNS cutover the variable has to change
> and the images have to be rebuilt; restarting with a new `.env.prod` will
> not do it.

Separately, and deliberately outside that convention because they configure
the workflow rather than the application: `VM_REGISTRY_HOST`,
`VM_REGISTRY_USER` and `VM_SSH_HOST_KEY` as variables, and
`VM_REGISTRY_SSH_KEY` as a secret.

### What the VM needs

- A **read-only deploy key**, so `git fetch origin` works. Generated on the
  box, so the private half has never left it. The checkout has to track the
  images: a stale checkout pairs new images with old `nginx.conf`.
- Nothing else. The images arrive in its own registry, and `deploy-release.sh`
  already defaults `IMAGE_PREFIX` to `127.0.0.1:5000/`, so the deploy command
  needs no registry argument at all.

## The image registry

`docker-compose.registry.yml` runs `registry:2` on the VM, in **its own
compose project**. That separation is deliberate: `docker compose down -v` on
the application is the documented way to rebuild from scratch, and if the
registry shared that project the teardown would also delete every image you
could roll back to.

    docker compose -f docker-compose.registry.yml up -d

Bound to `127.0.0.1:5000` and never exposed. Docker exempts localhost from its
HTTPS requirement, so this needs no certificate and no `insecure-registries`
entry: on the VM the daemon pulls from its own loopback, and from a laptop
you reach it through a tunnel, which is localhost at both ends:

    ssh -N -L 5000:127.0.0.1:5000 user@vm

Exposing it would mean TLS, authentication and an open port fronting images
that embed production secrets. The tunnel costs nothing and avoids all three.

### Release tags sort by time, not by hash

    TAG="$(date -u +%Y%m%dT%H%M%SZ)-$(git rev-parse --short HEAD)"
    IMAGE_PREFIX=127.0.0.1:5000/ IMAGE_TAG="$TAG" \
      docker compose -f docker-compose.prod.yml push cms client tiler
    IMAGE_PREFIX=127.0.0.1:5000/ IMAGE_TAG="$TAG" \
      docker compose -f docker-compose.prod.yml up -d

`<utc-stamp>-<short-sha>` rather than a bare sha, because retention has to
know which tag is oldest and a git sha sorts by hex. `registry-gc.sh` only
touches tags matching the stamped shape and leaves anything else alone, so a
hand-pushed tag is not collected by surprise.

### Deploying a release

On the box, with the version from the run summary. The checkout moves with
the images so the bind-mounted nginx config comes from the same tree:

    git fetch origin --tags && git checkout v1.2.0
    RELEASE_TAG=v1.2.0 SKIP_BUILD=1 bash infrastructure/vm/scripts/ops/deploy-release.sh

Six steps, in the order that works: pull, verify image hygiene, push (skipped
here, since the images came from the registry), deploy, **reload nginx**,
smoke-test through nginx. Each one is there because leaving it out costs
something concrete:

- Hygiene runs **before** the push. Once a layer carrying an env file is in a
  registry, deleting the tag does not recall what was already pulled.
- nginx is reloaded **after** the containers come up, for the reason below.
- The smoke test goes **through nginx**, not at the containers, because the
  502 below is invisible to a container health check.

Run it **on the VM**, never over a remote Docker context. Compose resolves
those bind-mounted paths on whichever machine runs the command, and a path
the far side does not have is mounted as an empty directory rather than
refused, and nginx then comes up healthy with no configuration.

With no `RELEASE_TAG` it builds here instead and pushes what it builds, which
is the fallback for when GitHub is unreachable (RUNBOOK §2.0):

    bash infrastructure/vm/scripts/ops/deploy-release.sh

That mode tags `<utc-stamp>-<short-sha>`, and appends `-dirty` when `client/`,
`cms/`, `cloud_functions/` or the compose file have uncommitted changes:
a release that cannot be reproduced from git should say so in its name.
Changes elsewhere, such as `terraform.tfvars`, do not count.

### Rolling back

Every release prints the command to undo it:

    RELEASE_TAG=<previous> SKIP_BUILD=1 bash infrastructure/vm/scripts/ops/deploy-release.sh

That pulls the named tag rather than building, skips the push, and runs the
same deploy, reload and smoke test. Only a stamped tag is ever offered: a
locally built `:local` image is not in the registry, so suggesting it would
hand over a command that cannot work.

**A tag predating the `STRIP_ENV_FILES` change will fail the hygiene gate**,
because those images really do carry an env file. Blocking is right for a
normal release and wrong for an emergency, so the gate can be overridden:

    ALLOW_UNCLEAN_IMAGES=1 RELEASE_TAG=<old> SKIP_BUILD=1 ./deploy-release.sh

Verified end to end: a release, a rollback to the previous tag, and a roll
forward again, with all four smoke checks passing each time.

### Reload nginx after a deploy, or everything 502s

Recreating `client` or `cms` gives them new container IPs. nginx resolves its
upstreams once at startup and caches the result, so it keeps proxying to
addresses nothing answers on any more:

    docker compose -f docker-compose.prod.yml exec nginx nginx -s reload

Measured: after `up -d cms client`, every route returned **502** with all five
services reporting healthy, because compose health checks talk to the
containers directly and never notice. A reload restored 200s immediately. This
is a property of every deploy, not a one-off, so the reload belongs in whatever
runs the release.

### Container logs are capped

Docker's `json-file` driver has no size limit by default, so container logs
grow until the disk is full. Every service now sets `max-size: 10m` and
`max-file: 3`, capping the stack at 150 MB.

The numbers that make this worth doing rather than theoretical: nginx writes
**66 bytes per request** here (measured over 50 requests), and GRASS-407 makes
an idle browser tab issue about **148 requests a second**. That is roughly
**800 MB of nginx log a day from one visitor who has walked away**, before the
client container's own output. A 160 GB disk does not last long against that,
and a full disk takes Postgres down with it.

Fixing GRASS-407 removes the cause; the cap removes the consequence. Both are
worth having, because the next runaway loop will not announce itself either.

### Image hygiene

The VM takes every secret from compose's `environment:` block, so an image
that also carries an env file is carrying something it was never asked for.
Two ways one gets in: `COPY . .` picking up a `.env` left in the build
context, which makes the contents depend on whose machine built the image; and
a build arg restated as `ENV`, which persists into `docker inspect` and
`docker history`.

Both Dockerfiles take `STRIP_ENV_FILES`, default `0`. Compose sets it to `1`,
so VM images ship no env file. The default is what Cloud Run builds with, and
that path **needs** the baked file: it has no runtime env channel at all
(`env_vars` is commented out in the deploy action and Terraform's `env_vars`
variable is declared but never referenced). That is GRASS-392, and it expires
with staging.

    bash infrastructure/vm/scripts/checks/verify-image-hygiene.sh

Checks each image for an env file with content, and for any secret-named
variable baked into the image environment. Run it before pushing anywhere.
Verified by watching it fail first: with the gate off, `rdp-cms` carried a
341-byte `/app/.env` and `rdp-client` a 294-byte `/app/.env.local`, both
picked up from a developer's working tree. With the gate on, 6 of 6 pass and
the full environment probe still reports no failures.

### Measured

| | |
|---|---|
| Three images on disk | 1.65 GB (client 307 MB, cms 984 MB, tiler 355 MB) |
| Stored in the registry | **395 MB**, since layers are compressed and the Node bases dedup |
| First push | 49 s |
| Re-push of unchanged images | **0.27 s**, +0.1 MB |

At ~400 MB for the first release and very little per release after it, 160 GB
of disk is not the constraint. Retention is about rollback depth, not space.

### Garbage collection

**Nothing runs this.** It is a command an operator types, usually from RUNBOOK
§6 when the disk is filling, and RUNBOOK §9 is where that is recorded
alongside everything that does run unattended. So the registry grows by each
release's changed layers and nothing ever shrinks it. That is affordable
rather than ideal, for the reason under **Measured** above: retention here is
about rollback depth, not space.

    bash infrastructure/vm/scripts/ops/registry-gc.sh      # keep 10 per repo
    KEEP=5 DRY_RUN=1 ./registry-gc.sh                  # show what would go

Two steps, both required: deleting a manifest only unlinks the tag, and the
blobs stay until `garbage-collect` runs. Retention without collection reclaims
nothing.

Two things the script has to get right, both found by testing it:

- **A manifest delete is by digest, and unlinks every tag pointing at it.**
  Two releases that build an identical image share a digest, so dropping the
  old tag would silently take the kept one with it. The script collects the
  digests of kept tags first and skips any deletion that would hit one.
- **Collection runs with the registry stopped.** `garbage-collect` walks the
  blob store deciding what is unreferenced; a push landing mid-walk can have
  its blob collected before the manifest referencing it exists.

To put it on a schedule instead, this is the form. Installing it adds a row
to RUNBOOK §9, which is the one place that says what this box runs
unattended; confirm against the box with `ls /etc/cron.d/rdp-registry-gc`
rather than trusting either file. Run it after the nightly backup rather
than alongside it, since both briefly stop a container:

    # /etc/cron.d/rdp-registry-gc
    30 3 * * 0 root cd /opt/rdp && KEEP=10 \
      /bin/bash infrastructure/vm/scripts/ops/registry-gc.sh >> /var/log/rdp-registry-gc.log 2>&1

### Moving to GHCR later

Nothing here is load-bearing for that. `IMAGE_PREFIX` and `IMAGE_TAG` in
`docker-compose.prod.yml` are the whole interface, so the switch is
`IMAGE_PREFIX=ghcr.io/<org>/` plus a pull credential on the VM; the stamped
tag convention works unchanged. What would need deciding first is whether
images that embed `.env.prod` should live in a registry ILRI's wider org can
read; see GRASS-392. On the VM the trust boundary is a shell on the box,
which is where `.env.prod` already is, so the local registry does not widen it.

> Settled since this was written: **the VM images embed nothing.** They build
> with `STRIP_ENV_FILES=1`, take every secret from compose's `environment:`
> at runtime, and `verify-image-hygiene.sh` asserts both on every release.
> The embedding concern is specific to the Cloud Run images, which have no
> runtime env channel. So the blocker above is cleared, but the reason to
> stay on the VM is now a different one: **rollback stays local.** During an
> incident the tags you can roll back to should not depend on an external
> service being reachable.

Two facts for that conversation, both checked against GitHub's docs rather
than assumed:

- A **private GHCR package does not require a private repo**. The Container
  registry supports granular permissions, so package visibility is its own
  setting and a new package defaults to private.
- **Cost is not the deciding factor.** "Container image storage and bandwidth
  for the Container registry is currently free", with a month's notice before
  that changes. Even under the standard Packages rates it would be about a
  dollar a month at ten retained releases.

What does matter is that making a package public is **irreversible**: "once
you make a package public, you cannot make it private again". For images that
embed `.env.prod` that is a one-way door onto production credentials, and it
belongs on the handover checklist as an explicit instruction rather than an
inherited default.

## Standing up a box from scratch

Both the record of how `linode50` was provisioned on 2026-10-07
(`139.162.197.186`, Ubuntu 24.04.5, 4 cores, 7.8 GiB, 157 G disk) and the
order to repeat it. None of it is in a playbook, and the host was
Ansible-managed until ILRI exempted it on 2026-10-09; see RUNBOOK §10.

The order below is **the order that works**, not the order this box happened
through. Two steps were never exercised here: `linode50` ran nginx on a
self-signed pair for a day before certbot existed, so it never hit the
deadlock in step 8, and every release so far was built on the box, which
step 10 stops doing.

**The VM does not build.** That is the point of `generate-release.yml`: Actions builds,
tests and pushes images, and the VM only pulls and starts them. Nothing below
runs `docker compose build`.

### What the VM needs on disk, and why it is still a checkout

Not a build tree. Four files, bind-mounted into containers at run time:

    docker-compose.prod.yml
    infrastructure/vm/nginx/nginx.conf
    infrastructure/vm/nginx/templates/platform.conf.template
    infrastructure/vm/scripts/container/healthcheck.js

plus the scripts an operator runs (`deploy-release.sh`, `verify-image-hygiene.sh`,
`cert-deploy-hook.sh`, the backup pair). `deploy-release.sh` touches git only to
invent a tag when `RELEASE_TAG` is unset; a deploy that names its tag never
shells out to git at all.

So the checkout is **config delivery, not build input**, and it stays because
`generate-release.yml` tags the commit its images were built from. `git checkout
v1.0.0` alongside `RELEASE_TAG=v1.0.0` makes the nginx config and the running
images provably the same tree. Shipping those files any other way, by baking
them into an image or copying a tarball, means inventing a second version
number and keeping it in step with the first.

Those four paths are also why a deploy has to be typed on the box; see
**Deploying a release** above for what a remote Docker context does with
them.

### Host

1. **Docker CE from Docker's own apt repository**, not Ubuntu's `docker.io`.
   The scripts call `docker compose` (V2, as a plugin) and `deploy-release.sh` uses
   `up -d --wait`; pinning to upstream keeps the VM and the rehearsal stack on
   the same Compose semantics, which matters because every procedure in the
   RUNBOOK was measured against the latter. Installed 29.8.2 / Compose 5.6.0.

2. **The deploy account added to the `docker` group.** Required for anything
   that is not interactive (a deploy hook, a cron job, an SSH context),
   because those reach `/var/run/docker.sock` directly with no `sudo`. Worth
   stating plainly: membership in `docker` is equivalent to root. It grants
   nothing new here, since the account already has passwordless sudo, so the
   privilege boundary was already the SSH key.

3. **A 4 G swapfile**, in `/etc/fstab`. The host shipped with 496 M, and a
   `next build` peaks well above that; the OOM kill it avoids surfaces as a
   bare `Killed` and exit 137, which reads exactly like a broken Dockerfile.
   Actions does the building now, so this is no longer on the normal path,
   but it is still what makes the fallback in RUNBOOK §2.0, building here
   when GitHub is unreachable, survive.

4. **Open 80 and 443**, IPv4 and IPv6, in the host `nftables` ruleset, and
   persist it. Without this nothing reaches nginx and, more quietly, the ACME
   challenge in step 11 cannot be validated: issuance fails with a
   connection error that reads like a DNS problem. The ruleset here already
   carried SSH, mosh and Zabbix (`10050`, from `41.204.190.0/24`).

### The stack

5. **The repository at `/opt/rdp`**, cloned from a git bundle carried over
   SSH rather than copied as files, so it is a real checkout with history and
   `origin` set to GitHub. ILRI can attach a read-only deploy key and pull.
   Check out the release tag, not a branch.

6. **`.env.prod`, 0600, generated on the host.** Copy `.env.prod.example` and
   fill in all nineteen variables. **Only five of them are enforced**, and it
   is worth knowing which: the four build args and `CERTBOT_WEBROOT` are
   written `${VAR:?...}`, so compose refuses to interpolate the file and
   names the variable. The other fourteen, the Postgres credentials and every
   Strapi secret among them, are plain `${VAR}` and resolve to an empty
   string. Measured with all fourteen absent, `docker compose config` exits
   **0** and prints a warning per variable, which scrolls past in a terminal.
   So a missed value here surfaces as a container that will not start, or a
   Strapi that boots with an empty `APP_KEYS`, rather than as an error at the
   point of the mistake. Diff the keys before bringing the stack up:

       diff <(grep -oE '^[A-Z_]+' .env.prod.example | sort) \
            <(grep -oE '^[A-Z_]+' .env.prod | sort)

   Generate every Strapi and Postgres secret fresh for the machine; only the
   three credentials that cannot be regenerated (Earth Engine, Transifex,
   Mapbox) are carried across, and machine-to-machine at that. Two values
   differ from the example's local defaults:
   `CERTBOT_WEBROOT=/var/www/certbot` (step 11) and `SERVER_NAME` set to the
   name the certificate will be issued for. `deploy-release.sh` appends `IMAGE_TAG`
   and `IMAGE_PREFIX` on its first successful deploy; do not add them by hand.

7. **The registry**, in its own compose project, bound to `127.0.0.1:5000`:

       docker compose -f docker-compose.registry.yml up -d

   It has to exist before CI can push, and CI reaches it through an SSH
   tunnel; see **Reaching a registry that is bound to loopback**. Keeping it
   in a separate project is what lets `down -v` on the application leave
   every rollback target intact.

### A certificate has to be in the volume before nginx starts

8. nginx will not start without one, and until it starts there is no
   challenge path to issue one through:

   | | needs |
   |---|---|
   | nginx starts | `fullchain.pem` in the `certs` volume |
   | certbot `--webroot` issues one | nginx already answering `:80` |

   `platform.conf.template` declares `ssl_certificate` unconditionally and
   nginx validates the whole file at startup, so a missing certificate is
   fatal rather than a warning, and it takes the port 80 server block down
   with it, challenge path included:

       [emerg] cannot load certificate "/etc/nginx/certs/fullchain.pem":
               BIO_new_file() failed ... No such file or directory
       nginx: configuration file /etc/nginx/nginx.conf test failed

   **Rebuilding a box whose `/etc/letsencrypt` survived**, including after
   `down -v`, which destroys the `certs` volume but not certbot's copy,
   needs no reissue. Re-publish the real pair and skip to step 10:

       docker run --rm -v rdp-prod_certs:/certs -v /etc/letsencrypt:/le:ro \
         alpine sh -c 'cp -L /le/live/<public-name>/fullchain.pem \
                             /le/live/<public-name>/privkey.pem /certs/'

9. **Only a box with no certificate anywhere needs a throwaway pair.** It
   exists to get nginx up so that certbot can validate; the deploy hook in
   step 11 overwrites both files with the real ones:

       docker run --rm -v rdp-prod_certs:/certs \
         -v "$PWD/infrastructure/vm/scripts:/s:ro" \
         -e SERVER_NAME="$(hostname -f)" -e OUT_DIR=/certs \
         --entrypoint sh alpine/openssl:latest /s/setup/gen-selfsigned-cert.sh

   The next compose command warns `volume "rdp-prod_certs" already exists but
   was not created by Docker Compose`. Expected, and harmless. Measured:
   compose adopts the volume and the files written into it are there. Do not
   "fix" it with `external: true`, which would make the volume something
   nobody creates.

### Release in CI, deploy on the VM

10. **Cut the release from `staging`**, with `workflow_dispatch` on
    `.github/workflows/generate-release.yml`, with a version. It builds, tests, pushes
    `v1.0.0` into the registry through the tunnel, fast-forwards `main` and
    tags it. See **Generating a release**. Then, on the VM:

        cd /opt/rdp && git fetch --tags && git checkout v1.0.0
        RELEASE_TAG=v1.0.0 SKIP_BUILD=1 \
          bash infrastructure/vm/scripts/ops/deploy-release.sh

    `SKIP_BUILD=1` pulls the tag instead of building it and skips the push,
    since the registry is where it came from; the rest of the script
    (hygiene, deploy, nginx reload, smoke test through nginx) runs unchanged.
    This is the same command as a rollback, because deploying a named tag and
    rolling back to one are the same operation.

    The smoke test passes on a self-signed certificate: it uses `curl -sk`.

### The real certificate

11. **Issue with `--webroot`.** Create the webroot first, then assert the
    challenge path is reachable. A `301` here means HTTP-01 validation will
    fail, and the only way to see that before burning a rate limit is to look:

        sudo mkdir -p /var/www/certbot
        curl -s -o /dev/null -w '%{http_code}\n' \
          http://<public-name>/.well-known/acme-challenge/probe

    Expect `404`, never `301`. Then issue, with the deploy hook attached from
    the start:

        sudo certbot certonly --webroot -w /var/www/certbot -d <public-name> \
          --key-type ecdsa \
          --deploy-hook /opt/rdp/infrastructure/vm/scripts/ops/cert-deploy-hook.sh

    `<public-name>` must match `SERVER_NAME` in `.env.prod`. Not `--standalone`: it
    binds port 80 itself and would contend with the nginx container. The hook
    is not optional: a new file on disk changes nothing until the running
    container rereads it, and without the hook certbot reloads a host nginx
    that does not exist, exits 0, and the container serves the old pair until
    something restarts it.

12. **Check what certbot recorded.** `/etc/letsencrypt/renewal/<public-name>.conf`
    is the file renewal actually reads, and `--deploy-hook` is stored in it
    as `renew_hook =`, the same thing under a different name, which matters
    when you are grepping for it. Confirm `authenticator = webroot`, the
    `webroot_path`, and the `renew_hook` line. Renewal runs from
    `certbot.timer` (certbot 2.9.0 from apt), twice daily. That conf file is
    also the one to watch if the Ansible exemption ever lapses; see
    RUNBOOK §10.

### Content

13. **A fresh Postgres volume is an empty CMS**: no pages, no admin user,
    and `/en` renders a shell. Restoring the content baseline is a separate
    procedure with its own rehearsal notes; see **Restoring content**.

### Then verify

All four routes through nginx, and the certificate the server actually
presents rather than the one on disk:

    curl -sk -o /dev/null -w '%{http_code} %{url_effective}\n' \
      https://<public-name>/en https://<public-name>/en/map \
      https://<public-name>/cms/admin https://<public-name>/cms/_health
    openssl s_client -connect <public-name>:443 </dev/null 2>/dev/null \
      | openssl x509 -noout -dates -subject -issuer

Expect `200 200 200 204`, and an issuer that is Let's Encrypt rather than the
self-signed subject from step 9.

Not done on this box, deliberately: it has a kernel update pending from
`unattended-upgrades` and has not been rebooted. Everything is
`restart: unless-stopped` and `nftables` is enabled at boot, so it should
come back, but that has not been proven and the reboot is ILRI's to schedule.

## Deferred to phase 2

Earth Engine latency from London, off-box backup storage, and the operational
handover. Resolved during phase 2: TLS issuance and renewal (done and
dry-run verified), ILRI firewall rules (80/443 opened on the host nftables
ruleset, persisted), and monitoring (Zabbix already runs here; platform-level
checks still need adding).

Two findings from the phase-2 work above are decisions rather than tasks, and
need someone to make them: whether to lower `max_size` now that the key zone
is known to bind first, and where off-box backups live.

## Domain states

nginx takes all three names from the environment; moving between these states
needs no config edit.

| State | `SERVER_NAME` | `REDIRECT_SERVER_NAME` | `CANONICAL_HOST` |
|---|---|---|---|
| local | `localhost` | `alias.localhost` | `localhost` |
| phase 2, the VM today | `139-162-197-186.ip.linodeusercontent.com` | `redirect.invalid` | `139-162-197-186.ip.linodeusercontent.com` |
| phase 3, production | `www.rangelandsdata.org rangelandsdata.org` | `www.datarangelands.org datarangelands.org` | `www.rangelandsdata.org` |

`envsubst` cannot omit a block, only fail to match one, so the redirect server
blocks always exist. Pointing `REDIRECT_SERVER_NAME` at a name that never
resolves is how it is switched off; the VM uses `redirect.invalid`. Any name
under `.invalid` does, because RFC 2606 reserves the TLD precisely so it can
never be delegated, and nothing in the repo pins the choice, so read it from
`.env.prod` rather than from here.

Phase 2 runs on the hostname Linode gives the instance, not on a spare
`rangelandsdata.org` subdomain: no spare name was ever provisioned, and the
Linode name already had a public DNS record, which is what Let's Encrypt
needed to issue against. There is no redirect to switch on yet because there
is only one name.

### Which domain is canonical, settled

**`www.rangelandsdata.org`**, with the other three names 301ing to it. Edwin
Masita (ILRI) confirmed this on the GRASS-384 thread: *"keeping
rangelandsdata.org as the canonical domain, with datarangelands.org
redirecting to it"*. Fiona Flintan's requirement is that the platform answer
on **both** domains, which is what the redirect gives.

This matches what production already does, so cutover changes the content at
these names and not the relationships between them. Measured:

| Name | Today |
|---|---|
| `www.rangelandsdata.org` | serves the site (302 to `/atlas`) |
| `rangelandsdata.org` | 301 to `www.rangelandsdata.org` |
| `datarangelands.org` | 301 to `www.rangelandsdata.org` |
| `www.datarangelands.org` | 301 to `www.rangelandsdata.org` |

All four resolve to `176.58.115.65`, which is the **current** production host,
not the new VM. DNS is Edwin's to repoint at cutover; he has asked to be told
when the project owners have agreed a date.

Note the `www.`: the canonical name carries it, because the apex already
redirects to it. Edwin's wording named the domain, not the host, and taking it
literally would invert a redirect that production has always had.

Two earlier statements on the thread are worth not acting on. Fiona's 31/07
message refers to `datarangelands.com` and `rangelandsdata.com`, which have
**no A record at all**, so the `.com` spelling is a slip and the `.org` pair is
real. And the same message says *"normally we use www.datarangelands.com"*,
which points at the opposite canonical from the one since agreed; the 31/08
message and Edwin's recommendation supersede it.

One cutover consequence, currently unowned: `www.rangelandsdata.org` redirects
to `/atlas` today, and Fiona has asked for the Rangelands Atlas to be archived.
Once the platform serves the root, existing `/atlas` links stop working unless
something preserves them. Edwin offered to archive the old server; whether
`/atlas` keeps answering is a decision nobody has recorded.

The phase-3 certificate must cover **all four** names. Two reasons, both
load-bearing:

- A browser completes the TLS handshake before nginx can redirect, so an
  uncovered non-canonical name gives a certificate warning rather than a 301.
- certbot validates each name in the SAN list separately, so the ACME challenge
  location is served by the redirect block too. Without it the challenge is
  301'd, that one name fails HTTP-01, and issuance fails for the whole
  certificate.

## Mapbox token

`NEXT_PUBLIC_MAPBOX_TOKEN` is a **build arg**, not a runtime variable. It is
inlined into the browser bundle by `next build`, so changing it means rebuilding
the client image; setting it in the environment of a running container does
nothing. It ends up in both the image and the bundle, which is expected for a
`pk.*` token, where URL restriction is the control rather than secrecy, and is
one more reason these images never go to a public registry.

Mapbox enforces URL restrictions on the **`Referer` header**, and only for
**billable** services. Tile requests (`/v4/....mvt`) are gated; style and font
reads are not, so a token with no working restriction still returns 200 for
`/styles/v1/...`. Test restrictions against a tile URL or the result is
meaningless:

    curl -s -o /dev/null -w '%{http_code}\n' -H 'Referer: https://evil.example/' \
      "https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/1/0/0.mvt?access_token=<token>"

Expect `403` there and `200` from the real origin. Matching is exact on scheme,
host **and port**: an entry of `http://localhost:3000` does not match a browser
on `https://localhost`, which sends no port for 443. Changes take a couple of
minutes to propagate.

`localhost` is not implicitly allowed. Mapbox recommends a **separate
development token** that allows `localhost`, leaving the production token
restricted to production names.

Names the allowed list needs, matching the states in **Domain states**:

| State | Allowed names |
|---|---|
| local | `https://localhost` (development token) |
| phase 2, the VM today | `139-162-197-186.ip.linodeusercontent.com` |
| phase 3, production | all four: `www.rangelandsdata.org`, `rangelandsdata.org`, `www.datarangelands.org`, `datarangelands.org` |

No spare DNS record was requested. The VM's Linode reverse name already
resolves to it, so it is the phase-2 host for both the certificate and
the allowed list: Let's Encrypt issued against it and renewal is dry-run
verified, and the `pk.` token was measured working from that origin with the
map rendering real tiles. Provider-owned domains can hit Let's Encrypt rate
limits, so confirm with `certbot renew --dry-run` before relying on it.

> Add the phase-3 names to the token before moving DNS, not after. The map is
> the one part of the platform that fails on a hostname the token has never
> seen, and it fails silently.
