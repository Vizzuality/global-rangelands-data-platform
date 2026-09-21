# ILRI VM stack — local

Single-VM Docker Compose deployment for [GRASS-384](https://vizzuality.atlassian.net/browse/GRASS-384),
replacing the GCP Cloud Run / Cloud SQL / Cloud Function setup. Five containers
(`nginx`, `client`, `cms`, `tiler`, `db`) on one private bridge; only nginx binds
host ports.

Run it: copy `.env.prod.example` to `.env.prod`, fill it in, then

    docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

Nothing here pushes an image anywhere. The images embed no secrets, but are still
environment-specific, because `NEXT_PUBLIC_*` are inlined at build time.

## Routing contract

Reproduces the GCP load balancer's URL map, including prefix stripping
(`path_prefix_rewrite = "/"` in `infrastructure/base/modules/load-balancer/main.tf`).

| Path | Backend | Prefix stripped | Cache |
|---|---|---|---|
| `/` | `client:3000` | no | none |
| `/cms/*` | `cms:1337` | yes | none |
| `/functions/eet/*` | `tiler:8080` | yes | 1 week, query string in key |

The tiler sends no `Cache-Control` header, so nginx must cache in spite of that
(`proxy_ignore_headers`) — the equivalent of Cloud CDN's `FORCE_CACHE_ALL`.
Without it every tile request reaches a metered Earth Engine dependency.

Tile responses carry `X-Cache-Status` (`MISS`, `HIT`, `EXPIRED`, `STALE`,
`UPDATING`), which is how the cache is diagnosed from outside the container:

    curl -sk -o /dev/null -D - 'https://<host>/functions/eet/7/64/63?tileset=anthropogenic_biomes' \
      | grep -i x-cache-status

`infrastructure/vm/scripts/verify-tile-cache.sh` asserts the two properties that
inspection cannot confirm: that a second request for the same URL is a `HIT`,
and that ten concurrent cold requests produce at most two upstream fetches.
Measured: **1**. `proxy_cache_lock` is doing that — Cloud CDN collapsed
concurrent misses implicitly and nginx does not, so without it a pan across a
fresh zoom level fans out one Earth Engine call per tile against a single
unscaled instance.

The cache lives on the `tilecache` volume, so it survives container restarts;
a one-week TTL would otherwise be discarded on every deploy.

## Health endpoints

All three Node services share `infrastructure/vm/scripts/healthcheck.js`,
bind-mounted read-only at `/healthcheck.js`:

    node /healthcheck.js <url> [maxStatus]     # healthy when status < maxStatus, default 400

Measured on Strapi 5.52.0:

| Path | Status |
|---|---|
| `/_health` | **204** |
| `/admin` | 200 |
| `/api` | 404 — no route at the bare prefix |

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
      --entrypoint sh alpine/openssl:latest /s/gen-selfsigned-cert.sh

The SAN covers `localhost`, `alias.localhost` and `127.0.0.1`, so the canonical
redirect can be exercised over TLS without a certificate warning confusing the
result.

### On the VM

certbot is installed on the **host**; nginx runs in a container. That drives
every decision here.

1. Point the `certs` volume at `/etc/letsencrypt/live/<host>` **read-only**, and
   `certbotwww` at the host directory certbot uses as its webroot. The container
   reads `fullchain.pem` and `privkey.pem` by those exact names, which is what
   certbot already writes.
2. Issue with `--webroot`. **Not `--standalone`** — it binds port 80 itself and
   would contend with the nginx container.
3. Add a deploy hook, or renewal has no effect: a new file on disk changes
   nothing until the running container rereads it.

       --deploy-hook 'docker compose -f docker-compose.prod.yml exec nginx nginx -s reload'

   Without it certbot reloads a host nginx that does not exist, exits 0, and the
   container keeps serving the expired certificate.
4. Verify renewal rather than assuming it. Run `certbot renew --dry-run`, then
   confirm the container is actually serving the new certificate
   (`openssl s_client -connect <host>:443 | openssl x509 -noout -dates`).

Assert the challenge path is reachable **before** requesting a certificate — a
`301` here means HTTP-01 validation will fail:

    curl -s -o /dev/null -w '%{http_code}\n' http://<host>/.well-known/acme-challenge/probe

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

### next/image needs the uploads mounted into the client

`docker-compose.prod.yml` mounts the `media` volume read-only at
`/app/public/cms/uploads` in the **client** container. That is not redundant with
nginx, and removing it breaks every CMS image.

`next/image` resolves a relative `url` against the **Next server's own origin**,
because the optimizer fetch happens server-side. The client container does not
serve `/cms/*` — nginx does — so Next fetches its own 404 page and answers
`400 The requested resource isn't a valid image`. Measured from inside the
container: `/cms/uploads/<file>.png` returned **404 text/html** while
`/_next/static/media/<file>.png` returned 200 `image/png`.

Mounting the volume under `public/` makes those paths genuinely local, so the
optimizer reads them from disk with no HTTP round trip. Verified: `w=256` and
`w=3840` both return `200 image/png`, and the output is really optimized
(26 KB at `w=256` against a 95 KB source, with no upscaling past the source's
548×279).

Staging never hits this because its media URLs are absolute GCS URLs matched by
`images.remotePatterns`. The relative base is what exposes it, so it is specific
to this deployment — which is why the fix lives in the VM-only compose file and
not in `client/next.config.mjs`, a file staging shares.

### Migrating staging's media off GCS

Staging runs the GCS provider, so its `files` rows point at
`gs://rdp-staging-media` absolutely. Two halves, and only the second is blocked
on the database dump:

    bash infrastructure/vm/scripts/migrate-media-from-gcs.sh     # files  (unblocked)
    ... restore the dump first ...
    docker compose -f docker-compose.prod.yml --env-file .env.prod \
      exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1 \
      < infrastructure/vm/scripts/rewrite-media-urls.sql          # db rows

The bucket is public (`publicFiles: true`), so the copy needs **no gcloud
credentials** and runs the same from the VM. 118 objects, 18.7 MiB. The script
is idempotent — it re-fetches only what is missing or the wrong size — and
verifies every file against the bucket's byte count before loading it into the
volume as uid 1001.

**Paths are flattened, and that is load-bearing.** GCS stores one folder per
file (`<hash><ext>/<hash><ext>`); the local provider reconstructs paths as
`uploads/<hash><ext>` on delete and replace
(`@strapi/provider-upload-local/dist/index.js:96,123,148`) and ignores the
stored `url`. Keeping the folders would serve reads correctly and silently break
deletion — Strapi reports success and the file stays on disk forever. The script
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
Remove them — along with the `staging.rangelandsdata.org` pattern and the
`rdp-landing-bucket` one, which is referenced by neither code nor content — once
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
`ImageBitmap` — what `BitmapLayer` consumes. `setRasterTiles`
(`client/src/lib/json-converter/utils/setters.ts:90`) is plain string
concatenation and nothing in the map code calls `new URL()`, so the relative
string reaches `TileLayer.data` untouched.

Only raster layers are affected. All 16 `MVTLayer` rows source
`https://api.mapbox.com/v4/...` and are deliberately left absolute — they are
third-party tiles, not ours to relocate.

> When testing a tile by hand, pick a tileset that takes no `startYear` /
> `endYear`. `modis_net_primary_production` requires them and answers `400`,
> which reads like a routing failure and is not one.

> The full deck.gl render path is still unverified: `NEXT_PUBLIC_MAPBOX_TOKEN`
> is a placeholder locally, so the basemap 401s and the overlay never mounts.
> With a valid token, a browser probe of `/en/map` should record same-origin
> `/functions/eet/` requests returning 200.

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
> nothing at all — no body and no `-w` output — which looks like an empty API
> response rather than an error. Use `-sS`, never bare `-s`, when diagnosing.

> The table counts are **exactly twice** these numbers (datasets 42, layers 88,
> stories 38, ecoregions 740, rangelands 14, dataset-categories 8,
> story-categories 6). That is Strapi 5's draft & publish: draft and published
> versions are separate rows sharing a `document_id`, and the REST API returns
> only the published half by default. Verified on the restored dump — the
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
`transaction_timeout` in the archive — the PG17 hazard the containerised client
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
No query strings, no per-layer variation — so the rewrite is one literal
replacement in one column, not a regex over varied inputs.

The trailing slash survives prefix stripping: `/functions/eet/6/33/32/` reaches
the tiler as `/6/33/32/`, and Express's default non-strict routing matches it
against `/:z/:x/:y`. Verified end to end (200 `image/png`) and in isolation
against the router pattern, because all 52 layers depend on it.

Media cross-checks, three independent paths agreeing on **96**: the live API,
the dump text, and `22 + 74` from the table above. Of the bucket's 118 objects,
**0** referenced files are missing from the volume and 22 are orphans from
deleted or replaced uploads.

Two further notes from the scan:

- `files` holds a stray `.gitkeep` upload (`provider` already `local`), so there
  are 22 real files, not 23. The rewrite skips it by its `WHERE` guards.
- The three PDFs have `formats IS NULL` — Strapi generates derivatives only for
  images — and format keys vary by source dimensions (`thumbnail` 19, `small` 19,
  `large` 18, `medium` 18). That is why the rewrite rebuilds the blob with
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
to your local username — which has no key and fails with
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
PGUSER=strapi PGDATABASE=strapi bash infrastructure/vm/scripts/dump-staging.sh
```

`dump-staging.sh` runs `pg_dump` inside `postgres:16-alpine` rather than using a
host client. The version matters: a PostgreSQL 17 `pg_dump` writes
`SET transaction_timeout = 0;` into the archive preamble, a setting PostgreSQL 16
does not recognise, so restoring into the PG16 target aborts. Staging is PG14, and
a newer client against an older server is supported while the reverse is not — so
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
      bash infrastructure/vm/scripts/restore-dump.sh

Destructive — it drops and recreates the database. `cms` is stopped first because
`config-sync` holds a connection pool open, and `DROP DATABASE ... WITH (FORCE)`
terminates whatever is left.

Then, in this order, both idempotent and both safe to re-run after any later
import:

    C="docker compose -f docker-compose.prod.yml --env-file .env.prod"
    $C exec -T db psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
      < infrastructure/vm/scripts/rewrite-tile-urls.sql
    $C exec -T db psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
      < infrastructure/vm/scripts/rewrite-media-urls.sql

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

Re-running both scripts changed nothing, and no `//functions/eet/` appeared — the
double-rewrite failure mode a careless second pass would produce.

The `formats` rewrite was checked for silent destruction, not just for absence of
the bucket name: 19 blobs still present, derivative key counts unchanged
(`thumbnail` 19, `small` 19, `large` 18, `medium` 18), all 74 derivative URLs
intact, and every sibling field (`hash`, `ext`, `mime`, `width`, `sizeInBytes`)
preserved. A `jsonb_object_agg` that returned `NULL` would have passed a
bucket-name check while wiping the column.

**96 of 96** media URLs serve 200 through nginx. The one remaining 404 is
`/uploads/.gitkeep`, a stray Media Library row referenced by no content —
**staging returns 404 for the same URL**, so this is parity, not a regression.

> Server-rendered pages still 404 until the CMS API base is split.
> `client/src/lib/cms.ts:3` derives `CMS_API_BASE` from `NEXT_PUBLIC_API_URL` and
> uses that one value for both browser and server fetches; inside the client
> container that absolute URL is `ECONNREFUSED`, so SSR falls through to
> `notFound()`. Client-fetched data is unaffected, which is why `/en` and
> `/en/map` render. `CMS_INTERNAL_API_URL` is already supplied to the container
> and awaits being consumed.

## Image sizes

Measured with `docker image ls`, each asserted alongside a working cold boot
(health endpoint plus a real 256×256 PNG tile), not in isolation.

| Image | Size |
|---|---|
| `rdp-tiler:local` | **355 MB** — `node:22.23.1-bookworm-slim`, new here |
| `rdp-client:local` | 293 MiB (was 1391 MiB) |
| `rdp-cms:local` | 939 MiB (was 1516 MiB) |

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

**`node:22.23.1-alpine` was built and verified** as an alternative — identical
behaviour (health 200, real PNG tile, same uid/gid) at **290 MB**, an 18%
saving. Not adopted, deliberately:

- It would mean three base distros across three services (`client` is
  `node:24.15.0-bookworm-slim`, `cms` is `node:22.23.1-bookworm-slim`), so two
  CVE feeds and two package managers to reason about at handover.
- The saving is one-time. A registry dedups layers, so the recurring per-deploy
  transfer is the changed application layer either way — 0.1 MB here.

Revisit if the base distro is ever unified, where it becomes free.

## Node versions are per-workspace and both bind

`cms/package.json` requires `>=20 <=22.x.x`; `client/package.json` requires
`24.x`. A shared base image would violate one of them. The tiler uses 22.23.1 to
match `cms` rather than introduce a third Node version.

## Deferred to phase 2

Real TLS issuance and renewal, cache behaviour under realistic tile load, Earth
Engine latency from London, ILRI firewall rules, the image registry and its
garbage-collection cron, backups, monitoring, and the operational handover.

## Domain states

nginx takes all three names from the environment; moving between these states
needs no config edit.

| State | `SERVER_NAME` | `REDIRECT_SERVER_NAME` | `CANONICAL_HOST` |
|---|---|---|---|
| local | `localhost` | `alias.localhost` | `localhost` |
| phase 2, spare name | `<spare>.rangelandsdata.org` | `disabled.invalid` | `<spare>.rangelandsdata.org` |
| phase 3, apex | `www.<canonical> <canonical>` | `www.<other> <other>` | `www.<canonical>` |

`envsubst` cannot omit a block, only fail to match one, so the redirect server
blocks always exist. Pointing `REDIRECT_SERVER_NAME` at a name that never
resolves (`disabled.invalid`) is how it is switched off.

Which domain is canonical is **ILRI's decision and still open**. Today
`datarangelands.org` 301s to `rangelandsdata.org`, while ILRI's request listed
the former first.

The phase-3 certificate must cover **all four** names. Two reasons, both
load-bearing:

- A browser completes the TLS handshake before nginx can redirect, so an
  uncovered non-canonical name gives a certificate warning rather than a 301.
- certbot validates each name in the SAN list separately, so the ACME challenge
  location is served by the redirect block too. Without it the challenge is
  301'd, that one name fails HTTP-01, and issuance fails for the whole
  certificate.
