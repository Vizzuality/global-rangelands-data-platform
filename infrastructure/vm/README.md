# ILRI VM stack: local

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
(`proxy_ignore_headers`), the equivalent of Cloud CDN's `FORCE_CACHE_ALL`.
Without it every tile request reaches a metered Earth Engine dependency.

Tile responses carry `X-Cache-Status` (`MISS`, `HIT`, `EXPIRED`, `STALE`,
`UPDATING`), which is how the cache is diagnosed from outside the container:

    curl -sk -o /dev/null -D - 'https://<host>/functions/eet/7/64/63?tileset=anthropogenic_biomes' \
      | grep -i x-cache-status

`infrastructure/vm/scripts/verify-tile-cache.sh` asserts the two properties that
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

All three Node services share `infrastructure/vm/scripts/healthcheck.js`,
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
2. Issue with `--webroot`. **Not `--standalone`**: it binds port 80 itself and
   would contend with the nginx container.
3. Add a deploy hook, or renewal has no effect: a new file on disk changes
   nothing until the running container rereads it.

       --deploy-hook 'docker compose -f docker-compose.prod.yml exec nginx nginx -s reload'

   Without it certbot reloads a host nginx that does not exist, exits 0, and the
   container keeps serving the expired certificate.
4. Verify renewal rather than assuming it. Run `certbot renew --dry-run`, then
   confirm the container is actually serving the new certificate
   (`openssl s_client -connect <host>:443 | openssl x509 -noout -dates`).

Assert the challenge path is reachable **before** requesting a certificate. A
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

`infrastructure/vm/scripts/probe-environment.sh` asserts this end to end.

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
    DOCKER_CONTEXT=rdp bash infrastructure/vm/scripts/migrate-media-from-gcs.sh

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
PGUSER=strapi PGDATABASE=strapi bash infrastructure/vm/scripts/dump-staging.sh
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
      bash infrastructure/vm/scripts/restore-dump.sh

Destructive: it drops and recreates the database. `cms` is stopped first because
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

> Server-rendered pages still 404 until the CMS API base is split.
> `client/src/lib/cms.ts:3` derives `CMS_API_BASE` from `NEXT_PUBLIC_API_URL` and
> uses that one value for both browser and server fetches; inside the client
> container that absolute URL is `ECONNREFUSED`, so SSR falls through to
> `notFound()`. Client-fetched data is unaffected, which is why `/en` and
> `/en/map` render. `CMS_INTERNAL_API_URL` is already supplied to the container
> and awaits being consumed.

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

    bash infrastructure/vm/scripts/backup.sh
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
      bash infrastructure/vm/scripts/restore-backup.sh

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

### Still missing

A backup on the same disk as the data it protects is not a backup. Off-box
copies are an open question for ILRI (where they go, who can read them, and
how long they are kept), and the answer affects the retention setting above.

    # /etc/cron.d/rdp-backup
    0 3 * * * root cd /opt/rdp && BACKUP_DIR=/var/backups/rdp RETENTION_KEEP=30 \
      /bin/bash infrastructure/vm/scripts/backup.sh >> /var/log/rdp-backup.log 2>&1

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

    bash infrastructure/vm/scripts/verify-image-hygiene.sh

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
§6 when the disk is filling. The nightly backup is the only thing this
project schedules on the VM, so the registry grows by each release's changed
layers and nothing ever shrinks it. That is affordable rather than ideal,
for the reason under **Measured** above: retention here is about rollback
depth, not space.

    bash infrastructure/vm/scripts/registry-gc.sh      # keep 10 per repo
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

To put it on a schedule instead, this is the form. **It is not installed on
the VM**; confirm with `ls /etc/cron.d/rdp-registry-gc` rather than assuming
either way. Run it after the nightly backup rather than alongside it, since
both briefly stop a container:

    # /etc/cron.d/rdp-registry-gc
    30 3 * * 0 root cd /opt/rdp && KEEP=10 \
      /bin/bash infrastructure/vm/scripts/registry-gc.sh >> /var/log/rdp-registry-gc.log 2>&1

### Moving to GHCR later

Nothing here is load-bearing for that. `IMAGE_PREFIX` and `IMAGE_TAG` in
`docker-compose.prod.yml` are the whole interface, so the switch is
`IMAGE_PREFIX=ghcr.io/<org>/` plus a pull credential on the VM; the stamped
tag convention works unchanged. What would need deciding first is whether
images that embed `.env.prod` should live in a registry ILRI's wider org can
read; see GRASS-392. On the VM the trust boundary is a shell on the box,
which is where `.env.prod` already is, so the local registry does not widen it.

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

## Deferred to phase 2

Real TLS issuance and renewal, Earth Engine latency from London, ILRI firewall
rules, off-box backup storage, monitoring, and the operational handover.

Two findings from the phase-2 work above are decisions rather than tasks, and
need someone to make them: whether to lower `max_size` now that the key zone
is known to bind first, and where off-box backups live.

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
| phase 2, spare name | the spare host |
| phase 3, apex | all four: `www.` and apex for both domains |

A spare DNS record does not have to be requested: the VM's Linode reverse name
already resolves to it, so something like
`139-162-197-186.ip.linodeusercontent.com` can serve as the phase-2 host for
both the certificate and the allowed list. Confirm issuance with
`certbot renew --dry-run` first — provider-owned domains can hit Let's Encrypt
rate limits.

> Add the phase-3 names to the token before moving DNS, not after. The map is
> the one part of the platform that fails on a hostname the token has never
> seen, and it fails silently.
