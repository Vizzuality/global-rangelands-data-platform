# Security Deferrals — Dependency Vulnerabilities

This document records dependency vulnerabilities that were **knowingly deferred** during
the audit of **2026-07-02**, together with the reason for deferral, a reachability
assessment, and the concrete remediation path for each. It is the companion to the fixes
applied on branch `fix/deps/audit-2026-07-02` (see the `fix(deps): …` commits).

Deferrals follow the project's vulnerability guidelines: a fix may be deferred when the
only available remediation is a **major-version upgrade** (which requires explicit
sign-off and dedicated testing) or when the contextual **reachability** of the flagged
code path is low. Each entry below states which applies.

---

## Summary

| Area | Deferred advisories | Root cause | Remediation |
|------|--------------------|------------|-------------|
| `client` — orval | ✅ **Resolved 2026-07-07** (was 3: 1 critical, 1 high, 1 moderate) | orval 6→8 is a breaking major upgrade | Done — bumped to orval [8.20.0](https://github.com/orval-labs/orval/releases/tag/v8.20.0); see §1 |
| `cms` — Strapi tree | ✅ **Resolved 2026-07-08** (post-4.26.2 was 5 critical, 51 high) | transitive deps pinned by Strapi's dependency tree | Done — upgraded to Strapi [5.50.0](https://github.com/strapi/strapi/releases/tag/v5.50.0); see §2 |
| `client` — `image-size` | 2 (high) | `deck.gl` → `@loaders.gl/textures` → `texture-compressor` pins `image-size@2.0.2`; both advisories publish `patched: <0.0.0` — no fixed release exists | await an upstream `image-size` fix; see §5 |
| `cms` — `react-router` / `uuid` / `@ai-sdk/provider-utils` | 6 (5 moderate, 1 low) | `@strapi/admin@5.52.0` peer-pins `react-router-dom@^6.30.3` and no 6.x patch exists; `uuid` path unreachable; `@ai-sdk/provider-utils` unpatched | Strapi 5 must adopt react-router 7; see §2 |
| `cloud_functions/earth_engine_tiler` — googleapis tree | 6 (moderate) | pinned by `@google/earthengine@0.1.x` → `googleapis@92`, and by `@google-cloud/functions-framework@3.4.0` → `cloudevents` → `uuid` | `@google/earthengine` 0.x→1.x and `@google-cloud/functions-framework` 3→5 major upgrades |
| `data-processing` — global `uv` tool | 5 | outdated **local** `uv` install, not a repo dependency | `uv self update` (developer/CI environment) |

Everything **not** listed here was fixed on the branch (Python tornado/jupyter-server/
jupyterlab/bleach; tiler express/validator/node-forge/jws; client axios/form-data/qs/
js-yaml/@babel/core).

---

## 1. `client` — orval upgrade (✅ RESOLVED 2026-07-07)

**Status:** Resolved by bumping `orval` `6.29.1 → 8.20.0` (exact) — the latest stable as of
2026-07-07. All three advisories below are cleared: `pnpm audit` reports zero remaining
advisory paths through `orval`. The "Why deferred / Reachability / Remediation path" sections
below are retained as the historical record of the deferral.

**Advisories cleared**

| Package | Severity | Advisory | Path |
|---------|----------|----------|------|
| `@orval/core` | **Critical** | [GHSA-h526-wf6g-67jv](https://github.com/advisories/GHSA-h526-wf6g-67jv) | `orval > @orval/core` |
| `@orval/mock` | **High** | [GHSA-f456-rf33-4626](https://github.com/advisories/GHSA-f456-rf33-4626) | `orval > @orval/mock` |
| `js-yaml` (3.x) | Moderate | [GHSA-h67p-54hq-rp68](https://github.com/advisories/GHSA-h67p-54hq-rp68) | `orval > @apidevtools/swagger-parser > … > js-yaml` |

### Resolution (what was actually done)

Bumped `orval` to **8.20.0** — the latest stable as of 2026-07-07 — for security reasons.
orval 8's stricter codegen needed some accompanying config changes:

1. Bumped `orval` to `8.20.0` (exact) in `client/package.json`.
2. Added `input.override.transformer` (`client/orval-transform.ts`) doing **two** spec
   repairs orval 8 needs (v6 tolerated both): widen `populate` to also accept `string[]`
   (orval 8's default object type moved `any`→`unknown`, which rejects the arrays that
   compiled by accident under v6), and force URL-templated params to `in: "path"` so orval
   8's new pre-generation spec validation accepts `/upload?id={id}`.
3. Set `httpClient: "axios"` — orval 8's default httpClient changed to `fetch`, whose call
   shape is incompatible with the custom axios mutator.
4. Switched `prettier: true` → `formatter: "prettier"` (the legacy flag is a no-op in v8).
5. Regenerated `src/types/generated/`; `pnpm check-types` green; map + datasets smoke-tested
   (array `populate[]=…` serialization confirmed on the wire, relations populate).

The arrays remain arrays on the wire, so runtime behavior is unchanged (see the disproven
comma-join workaround below).

### Why deferred

Upgrading `orval` 6→7 is a **breaking major upgrade**. orval 7 regenerates the API client
with stricter parameter types derived from the OpenAPI spec, which breaks **6 call sites**:
the app passes `populate` as a `string[]` (e.g. `populate: ["layers", "layers.layer"]`),
but orval 7 types `populate` as `string | { [k: string]: unknown }` (no array member).

- `src/app/[locale]/map/page.tsx`
- `src/components/map/tooltip/components/rangelands.tsx`
- `src/containers/datasets/index.tsx`
- `src/containers/datasets/item.tsx`
- `src/containers/map/legends/item.tsx`
- `src/hooks/use-sync-layers-order.tsx`

The obvious "fix" — converting the arrays to comma-joined strings — was **empirically
disproven** as a safe workaround. The API client uses a plain axios instance with **no
custom `paramsSerializer`**, so:

| App code | axios wire format | Strapi (`qs.parse`) receives | Result |
|----------|-------------------|------------------------------|--------|
| `["layers","layers.layer"]` (current) | `populate[]=layers&populate[]=layers.layer` | `{ populate: ["layers","layers.layer"] }` | ✅ both relations populate |
| `"layers,layers.layer"` (comma) | `populate=layers,layers.layer` | `{ populate: "layers,layers.layer" }` | ❌ single invalid relation name — population silently breaks |

So the arrays are load-bearing and must stay arrays on the wire.

### Reachability — low

- **Build-time only.** orval runs solely via the `types` npm script (codegen). The deployed
  app ships the *generated* code, not orval. Nothing in the production runtime path executes
  the vulnerable code.
- **`@orval/mock` path is disabled.** `orval.config.ts` sets `mock: false`, so mock
  generation — the entire trigger for GHSA-f456-rf33-4626 — never runs.
- **`@orval/core` trigger field is absent.** The critical injection requires
  `x-enum-descriptions` in the spec. The input spec
  (`cms/src/extensions/documentation/documentation/1.0.0/full_documentation.json`) contains
  **0** occurrences of `x-enum-descriptions` (and 0 `x-enum-varnames`), so even running
  codegen against today's spec does not exercise the vulnerable path.
- **First-party, local input.** orval reads a committed spec generated by our own Strapi,
  not a remote/untrusted URL. Exploitation would require writing a malicious
  `x-enum-descriptions` into that committed file — i.e. an insider/supply-chain vector, not
  an external attacker.

**Caveat:** low ≠ zero. The pre-commit hook runs `pnpm types` on every commit (and CI
regenerates), so a poisoned spec *would* execute in developer/CI environments. The absence
of `x-enum-descriptions` is a snapshot, not a guarantee.

### Remediation path

Do this as a dedicated, tested piece of work:

1. Upgrade `orval` to the latest 7.x (pin exact).
2. Add an `input.override.transformer` in `orval.config.ts` that retypes every `populate`
   parameter as `string | string[]`, so generated types match the arrays the app passes.
   This preserves runtime behavior with no per-call-site casts.
3. Run `pnpm types` to regenerate `src/types/generated/`, then `pnpm check-types` — expect
   green with no source changes.
4. Smoke-test the map and datasets views against a live Strapi to confirm population still
   works end-to-end.

> **Update 2026-07-21** (branch `fix/deps/audit-2026-07-21`): `client` swept to **0 advisories**
> (was 4 high / 2 low) via within-major pnpm overrides: `orval>js-yaml`→4.3.0
> ([GHSA-52cp-r559-cp3m](https://github.com/advisories/GHSA-52cp-r559-cp3m)), `brace-expansion`
> 1/2/5→1.1.16/2.1.2/5.0.7 ([GHSA-3jxr-9vmj-r5cp](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp)),
> `express>body-parser`→1.20.6 ([GHSA-v422-hmwv-36x6](https://github.com/advisories/GHSA-v422-hmwv-36x6)),
> `eslint-plugin-react-hooks>@babel/core`→7.29.7
> ([GHSA-4x5r-pxfx-6jf8](https://github.com/advisories/GHSA-4x5r-pxfx-6jf8)). `pnpm check-types`,
> `eslint`, and `next build` all green. No client deferrals remain.

---

## 2. `cms` — Strapi 5 upgrade (✅ RESOLVED 2026-07-08)

**Status:** Upgraded all `@strapi/*` packages `4.26.2 → 5.50.0` (exact) — the latest stable
as of 2026-07-08 — for security reasons. The runtime-reachable, unauthenticated
**relational-filter data leak** (`GHSA-rjg2-95x7-8qmx`, patched ≥5.37.0) is cleared, and
`pnpm audit` now reports **0 critical** in `cms` — down from **5 critical / 51 high** at
`4.26.2` to **0 critical / 12 high / 16 moderate / 8 low**. The remaining high/moderate/low
items are build-time, CLI, install-time and admin-bundle transitives not on the production
runtime attack surface. The "why deferred" record is retained below as history.

### Resolution (what was done)

Coordinated CMS + client upgrade (PR [#167](https://github.com/Vizzuality/global-rangelands-data-platform/pull/167)):

1. `@strapi/*` (`strapi`, `plugin-users-permissions`, `plugin-documentation`, `plugin-cloud`)
   → `5.50.0`; removed `@strapi/plugin-i18n` (i18n is core in v5). CMS Node runtime → `24.15.0`
   (Strapi 5 requires Node ≥20).
2. Replaced `strapi-plugin-slugify` (no v5 release) with a document-service middleware
   (`cms/src/index.ts`) that slugs every `api::*` type with `title` + `slug`; slug lookups
   moved to standard `filters[slug][$eq]` queries.
3. Replaced `strapi-plugin-import-export-entries` (no v5 release) with
   [`import-export-data`](https://github.com/newproweb/strapi-plugin-import-export-data)
   `5.4.4` (per-collection CSV/JSON/XLSX from the admin); bumped `strapi-plugin-config-sync`
   → `3.2.0`.
4. Pinned `shell-quote` → `1.9.0` via a pnpm override, clearing the last critical (a
   `concurrently` dev-tooling transitive, `GHSA-w7jw-789q-3m8p`).
5. Migrated the client to the v5 flat API response shape and regenerated the orval types.

> **Update 2026-08-17** (branch `fix/deps/audit-2026-08-17`): `@strapi/*`
> 5.50.0→[5.52.0](https://github.com/strapi/strapi/releases/tag/v5.52.0) plus scoped pnpm
> overrides took `cms` from 45 → 6 advisories, **0 high**. The parent bump alone cleared
> `js-yaml`, `nodemailer` ([GHSA-p6gq-j5cr-w38f](https://github.com/advisories/GHSA-p6gq-j5cr-w38f),
> the 8→9 major deferred on 2026-07-17 — Strapi's sendmail provider now ships it),
> `sharp`, `dompurify` and `elliptic`. Overrides then pinned `vite` →6.4.3
> ([GHSA-fx2h-pf6j-xcff](https://github.com/advisories/GHSA-fx2h-pf6j-xcff), which also carries
> `esbuild` ^0.25.0 and clears the coupled build-time deferral from 2026-07-21), `undici` →7.29.0,
> `postcss` →8.5.26 under both `css-loader` and `vite`, `hono` →4.13.2, `@hono/node-server`
> →1.19.17, `ip-address` →10.5.0, `tar` →7.5.22, `ajv > fast-uri` →3.1.5 and `brace-expansion`
> →1.1.18 / 2.1.4 / 5.0.9. `strapi build` verified (admin panel bundles).
>
> **Newly deferred here:** `react-router` ×2 +
> `react-router-dom` ([GHSA-jjmj-jmhj-qwj2](https://github.com/advisories/GHSA-jjmj-jmhj-qwj2),
> which publishes `patched: <0.0.0` for the 6.x line). `@strapi/admin@5.52.0` declares
> `peerDependencies.react-router-dom: ^6.30.3`, so 7.x cannot be adopted until Strapi 5 migrates;
> `react-router-dom` is declared in `cms/package.json` solely to satisfy that peer and is imported
> nowhere in `cms/src`. `uuid` remains deferred on reachability grounds
> ([GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq) affects `v3`/`v5`/`v6`
> with an explicit `buf` argument; `gaxios` and `exceljs` both call `v4`), and
> `@ai-sdk/provider-utils` still has no published patch.
>
> A stale nested `node_modules` directory can survive a Strapi bump under this project's
> `node-linker=hoisted` setting and surface as a rollup build error
> (`"lazyValidator" is not exported by @ai-sdk/provider-utils`) even when `pnpm-lock.yaml` is
> correct. `rm -rf node_modules && pnpm install` resolves it; the lockfile needs no change.

### Why deferred (historical)

Before the upgrade, all `@strapi/*` packages were bumped within major 4 (`4.24.2 → 4.26.2`,
the terminal 4.x release), clearing 32 advisories (5 critical + 12 high) — including the
Content-Type-Builder SQL injection and the koa ReDoS/Host-Header criticals. The remainder
required Strapi 5 because:

- **Strapi 4 is end-of-life** (`4.26.2`, June 2026, is the last 4.x release) — the remaining
  transitive advisories would never be patched on the 4.x line, and scoped overrides are
  fragile against Strapi's pinned old majors.
- The remaining items were either **Strapi-5-only fixes** (the data-leak critical, patched in
  `5.37.0`) or **low runtime reachability** (admin/CLI/build/install-time).

Full reachability tiering and the migration record are in **`CMS-VULN-ASSESSMENT.md`** (repo root).

> **Update 2026-07-17** (branch `fix/deps-braces-minimatch-advisories`): a fresh Peek batch
> flagged two `cms` items post-dating the Strapi 5 upgrade.
> - **`braces` cleared** — [CVE-2024-4068](https://github.com/advisories/GHSA-grv7-fg5c-xmjg):
>   `braces@3.0.2` (pulled by `chokidar@3.6.0` + `micromatch@4.0.5`, Strapi admin build/watch
>   tooling) pinned to **3.0.3** via pnpm override. Within-major patch, build-time only.
> - **`nodemailer` deferred** — [GHSA-p6gq-j5cr-w38f](https://github.com/advisories/GHSA-p6gq-j5cr-w38f)
>   (message-level `raw` option bypasses `disableFileAccess`/`disableUrlAccess` → arbitrary
>   file read + SSRF; patched **9.0.1**). Installed `nodemailer@8.0.9` is pinned by
>   `@strapi/provider-email-sendmail@5.50.0` (Strapi's **default** email provider — no custom
>   provider is configured in `config/plugins.js`). Deferred because the fix is an **8→9 major
>   bump** of a transitive pinned by the Strapi provider; forcing it risks the provider.
>   **Reachability — low:** the vulnerable path requires a caller passing an untrusted
>   message-level `raw` option; Strapi's email service API never exposes `raw` to external
>   input, and `email_confirmation` is `false` / `email_reset_password` is `null`, so the
>   sendmail paths are barely exercised. **Remediation:** bump nodemailer to ≥9.0.1 once
>   `@strapi/provider-email-sendmail` declares compatibility (verify email send in a dedicated
>   change), or swap to a provider on a patched nodemailer line.

> **Update 2026-07-21** (branch `fix/deps/audit-2026-07-21`): full audit sweep. `cms` went
> from **1 critical / 14 high / 18 moderate / 8 low (41)** to **0 critical / 2 high / 4
> moderate / 3 low (9)** via within-major pnpm overrides. **Cleared:** `tar`→7.5.20
> ([GHSA-23hp-3jrh-7fpw](https://github.com/advisories/GHSA-23hp-3jrh-7fpw) critical +
> [GHSA-8x88-c5mf-7j5w](https://github.com/advisories/GHSA-8x88-c5mf-7j5w) high + 2 moderate),
> `jws`→3.2.3/4.0.1 ([GHSA-869p-cjfg-cm3x](https://github.com/advisories/GHSA-869p-cjfg-cm3x)),
> `adm-zip`→0.6.0 ([GHSA-xcpc-8h2w-3j85](https://github.com/advisories/GHSA-xcpc-8h2w-3j85)),
> `ws`→8.21.1 ([GHSA-96hv-2xvq-fx4p](https://github.com/advisories/GHSA-96hv-2xvq-fx4p)),
> `lodash-es`→4.18.1, `validator`→13.15.35
> ([GHSA-vghf-hv5q-vc2g](https://github.com/advisories/GHSA-vghf-hv5q-vc2g)), `minimatch`→3.1.5,
> `picomatch`→2.3.2, `micromatch`→4.0.8, `brace-expansion`→1.1.16, `bn.js`→4.12.5, `ajv`→6.15.0/8.20.0,
> `qs`→6.15.3, `yaml`→1.10.3, `diff`→3.5.1/5.2.2, `@babel/runtime`→7.29.7, `@babel/core`→7.29.7.
> Strapi build + admin panel build verified green. **Newly deferred (5):**
> - **`vite`** ([GHSA-fx2h-pf6j-xcff](https://github.com/advisories/GHSA-fx2h-pf6j-xcff) high +
>   2 moderate; patched ≥6.4.3). Installed `5.4.21`, pinned by `@strapi/strapi@5.50.0`; the fix is
>   only on the **6.x line** — a major bump of Strapi's admin bundler. Build-time/admin-only, not
>   on the production runtime surface. Remediation: bump when Strapi ships vite 6, or in a dedicated
>   admin-build change.
> - **`esbuild`** ([GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99)
>   moderate via `vite>esbuild`; [GHSA-g7r4-m6w7-qqqr](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr)
>   low via `esbuild-loader>esbuild`, Windows dev-server file read). Both are build-time; forcing the
>   patched minor conflicts with vite/esbuild-loader's declared esbuild range. Deferred with vite;
>   Linux CI/build unaffected.
> - **`uuid`** ([GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq) moderate).
>   Installed `8.3.2` via `grant>request-oauth>uuid`; patched **≥11.1.1** — an 8→11 major bump.
>   **Reachability — low:** the flaw needs a caller passing `buf`; `request-oauth` calls `uuid.v4()`
>   with no buffer. Remediation: bump when `grant`/`request-oauth` move off uuid 8.
> - **`elliptic`** ([GHSA-848j-6mx2-7j84](https://github.com/advisories/GHSA-848j-6mx2-7j84) low)
>   via `@strapi/plugin-users-permissions>jwk-to-pem>elliptic`. **No patched version published**
>   (advisory `patched: <0.0.0`) — nothing to bump to. Monitor for a fix.
> - **`@ai-sdk/provider-utils`** ([GHSA-866g-f22w-33x8](https://github.com/advisories/GHSA-866g-f22w-33x8)
>   low) via `@strapi/content-type-builder`'s AI feature. **No patched version published**
>   (`patched: <0.0.0`); admin-only. Monitor for a fix.
>
> `nodemailer` remains deferred as recorded above. `client` was also swept the same day — see §1.

---

## 3. `cloud_functions/earth_engine_tiler` — googleapis tree (deferred)

**Deferred advisories**

| Package | Severity | Path |
|---------|----------|------|
| `@google/earthengine` | Moderate | direct (pulls `googleapis`) |
| `googleapis` | Moderate | `@google/earthengine > googleapis` |
| `googleapis-common` | Moderate | `googleapis > googleapis-common` |
| `uuid` | Moderate | `googleapis-common > uuid` |

All four are pinned by `@google/earthengine@0.1.405`, which depends on the old
`googleapis@92` → `google-auth-library@7` → `googleapis-common@5` → `uuid@8` chain.

> **Update 2026-07-09** (branch `fix/deps/audit-2026-07-09`): the tiler's newly-surfaced
> dev-tooling advisories were cleared — `shell-quote` 1.8.1→1.9.0 (critical, GHSA #626, via
> `concurrently`), `form-data` 4.0.0→4.0.6 (via `@types/node-fetch`), `tmp` 0.0.33→0.2.6
> (scoped override on `external-editor`), `js-yaml` 4.1.0→4.3.0 (via `eslint`). The
> googleapis-tree deferrals below (incl. `uuid`) are unaffected and remain deferred.
>
> **Update 2026-07-16** (branch `fix/deps/audit-2026-07-16`): three more dev-tooling
> advisories cleared via scoped overrides — `flatted` 3.2.7→3.4.2
> ([GHSA-rf6f-7fwh-wjgh](https://github.com/advisories/GHSA-rf6f-7fwh-wjgh)), `lodash`
> 4.17.21→4.18.1 ([GHSA-r5fr-rjxr-66jc](https://github.com/advisories/GHSA-r5fr-rjxr-66jc)
> + 2 moderate), and `tmp` bumped 0.2.6→0.2.7
> ([GHSA-7c78-jf6q-g5cm](https://github.com/advisories/GHSA-7c78-jf6q-g5cm)). All are
> `development`-scope (eslint/gts/glob tooling), not shipped in the deployed function; `tsc`
> compile verified. `lodash` is pinned to **4.18.1**, not the deprecated (pulled) 4.18.0.
> **Still deferred:** `minimatch`→10.2.3, `picomatch`→4.0.4 and `uuid`→12.0.1 are
> major-version bumps of transitives pinned by `googleapis`/`gts`; `minimatch`/`picomatch`
> are dev-only and unreachable, `uuid` stays as in the googleapis-tree section below.
>
> **Update 2026-07-17** (branch `fix/deps-braces-minimatch-advisories`): **`minimatch`
> cleared** — [CVE-2026-27903](https://nvd.nist.gov/vuln/detail/CVE-2026-27903) (unbounded
> recursive backtracking in `matchOne()` on multiple non-adjacent `**` segments). The two
> resolved copies were bumped **within their majors** via npm overrides — top-level
> `minimatch@3.1.2 → 3.1.3`, and `@typescript-eslint/typescript-estree`'s `9.0.4 → 9.0.7`.
> Both are patch-level, so this supersedes the earlier "minimatch→10.2.3 major, deferred"
> note above: the CVE fix does **not** need the 10.x major. Both copies are `development`
> scope (eslint/gts tooling), not shipped in the deployed function; `tsc` compile unaffected.

> **Update 2026-08-17** (branch `fix/deps/audit-2026-08-17`): the tiler's dev chain was
> cleared, 16 → 6 advisories. `gts` 5.3.0→[5.3.1](https://github.com/google/gts/releases/tag/v5.3.1)
> and `nodemon` 3.1.3→[3.1.14](https://github.com/remy/nodemon/releases/tag/v3.1.14) as direct
> bumps; scoped npm overrides for `minimatch` 3.1.3→3.1.5 and 9.0.7→9.0.9, `brace-expansion`
> →1.1.18 ([GHSA-rgw5-rvv9-x895](https://github.com/advisories/GHSA-rgw5-rvv9-x895),
> [GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg)), `ajv` →6.15.0 /
> 8.20.0, `js-yaml` →4.3.1, `picomatch` →2.3.2, `micromatch` →4.0.8, `cross-spawn` →7.0.6,
> `semver` →5.7.2 / 6.3.1 / 7.8.5, `@babel/runtime` →7.29.7, and `express > body-parser`
> →1.20.6. All are `development` scope except `body-parser`; `tsc` compile verified. `gts lint`
> remains red (607 prettier errors) identically on the pre-change dependency tree — pre-existing,
> unrelated to this branch.
>
> **Newly deferred here:** `@google-cloud/functions-framework` 3.4.0→**5.0.5** is the only route
> to a patched `cloudevents` → `uuid`, and it is a major upgrade of the function runtime itself.
> It joins the `@google/earthengine` deferral below; the remaining 6 advisories are all in these
> two chains (`uuid`, `googleapis`, `googleapis-common`, `cloudevents`).

### Why deferred

- The clean fix is upgrading `@google/earthengine` to its current release, which is a
  **0.x → 1.x major upgrade** of the core Earth Engine SDK — a breaking change to the
  tiler's GEE usage that needs dedicated testing.
- Overriding the transitives instead would require forcing `googleapis-common` (5→8) and
  `uuid` (8→11) to their patched majors, which would break `googleapis@92`.

### Reachability — low/moderate

`uuid` (GHSA: missing buffer bounds check in v3/v5/v6 when `buf` is provided) is not
reachable: `googleapis-common` uses `uuid.v4()` without a `buf` argument. The `googleapis`/
`googleapis-common` advisories are moderate DoS/parsing issues on the GCP client path.

### Remediation path

Upgrade `@google/earthengine` to the latest 1.x in a dedicated change; verify service-
account auth and tile generation still work, then re-run `npm audit --omit=dev`.

---

## 4. `data-processing` — global `uv` tool (not a repo dependency)

`uvx uv-secure` flags the **globally installed `uv` tool** (v0.5.18, 5 advisories:
GHSA-8qf3-x8v5-2pj8, GHSA-w476-p2h3-79g9, GHSA-pqhf-p39g-3x64, GHSA-pjjw-68hj-v9mw,
GHSA-4gg8-gxpx-9rph). This is the **developer's local `uv` install**, not a dependency
declared by this repository, so it is not fixable via the lockfile.

**Action (per environment, not per repo):** `uv self update` (patched in uv ≥0.11.15).

> Note for maintainers: `uv 0.5.18` also writes an **older lockfile format** (`version = 1`
> without `revision`). Running `uv lock` with it downgrades `data-processing/uv.lock` and
> produces a ~2900-line spurious diff. Until the local `uv` is updated, run lockfile
> operations with a modern uv, e.g. `uvx uv@latest lock --upgrade-package <pkg>`.

---

## 5. `client` — `image-size` (deferred)

**Deferred advisories**

| Package | Severity | Advisory | Path |
|---------|----------|----------|------|
| `image-size` | **High** | [GHSA-w3rx-r6r6-pgpr](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr) — ICNS parser infinite loop | `@deck.gl/geo-layers > @deck.gl/mesh-layers > @loaders.gl/gltf > @loaders.gl/textures > texture-compressor > image-size` |
| `image-size` | **High** | [GHSA-5p2g-fcmc-qvqq](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq) — JXL and HEIF parsers infinite loop | same path |

### Why deferred

Both advisories publish `patched: <0.0.0` — **no fixed `image-size` release exists**, so neither
a direct upgrade nor an override can clear them. The version is pinned by
`texture-compressor@1.6.2`, an unmaintained transitive of `@loaders.gl/textures`.

### Reachability — low

`image-size` is reached only through `texture-compressor`'s image-dimension probing for
compressed-texture conversion. The advisories are denial-of-service loops in the **ICNS, JXL and
HEIF** parsers; the client's deck.gl layers render MVT and raster tiles and never feed
attacker-supplied files of those formats into that path.

### Remediation path

Track upstream `image-size` for a patched release, then override it. Alternatively drop the
`@loaders.gl/textures` path if the mesh/glTF layers stay unused — `@deck.gl/geo-layers` pulls it
in transitively, so this needs confirmation that no scene requires compressed textures.

---

_Last updated: 2026-08-17 — full audit sweep (branch `fix/deps/audit-2026-08-17`): 88 → 14 advisories across the three Node projects, **0 critical / 0 high** remaining. `client` 27 → 2 (`next` [16.3.1](https://github.com/vercel/next.js/releases/tag/v16.3.1) clearing 9 advisories, `postcss` 8.5.26, `sharp` 0.35.3, plus refreshed `brace-expansion` / `js-yaml` overrides and new `ajv > fast-uri` / `svgo` pins; the stale `next>postcss` override forcing 8.5.14 was removed — `next` 16.3.1 pins 8.5.23 itself); `cms` 45 → 6 (§2 update); `earth_engine_tiler` 16 → 6 (§3 update); newly deferred: `image-size` ×2 in `client` (§5, no patch published), `react-router`/`react-router-dom` ×3 in `cms` (§2, blocked by `@strapi/admin` peer range), `@google-cloud/functions-framework` 3→5 major in the tiler (§3). Prior: 2026-07-21 — full audit sweep (branch `fix/deps/audit-2026-07-21`): `client` → 0 advisories (§1 update); `cms` 41 → 9, critical `tar` cleared (§2 update); newly deferred in `cms`: `vite`/`esbuild` (build-time, major/coupled), `uuid` (8→11 major, unreachable), `elliptic` + `@ai-sdk/provider-utils` (no patch published). Prior: 2026-07-17 — Peek batch: §2 (cms) `braces` cleared (CVE-2024-4068, pnpm override 3.0.3) and `nodemailer` deferred (GHSA-p6gq-j5cr-w38f, 8→9 major pinned by Strapi's sendmail provider, low reachability); §3 (earth_engine_tiler) `minimatch` cleared (CVE-2026-27903, within-major overrides 3.1.3 / 9.0.7) on branch `fix/deps-braces-minimatch-advisories`. Prior: 2026-07-16 §3 dev-tooling (flatted, lodash, tmp); §2 (Strapi) resolved via Strapi 5.50.0 (PR #167); §1 (orval) resolved 2026-07-07 via orval 8.20.0. Original audit: 2026-07-02, branch `fix/deps/audit-2026-07-02`._
