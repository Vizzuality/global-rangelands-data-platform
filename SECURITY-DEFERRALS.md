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
| `cloud_functions/earth_engine_tiler` — googleapis tree | 4 (moderate) | pinned by `@google/earthengine@0.1.x` → `googleapis@92` | `@google/earthengine` 0.x→1.x major upgrade |
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

_Last updated: 2026-07-16 — §3 (earth_engine_tiler) three more dev-tooling advisories (flatted, lodash, tmp) cleared on branch `fix/deps/audit-2026-07-16`; minimatch/picomatch/uuid majors remain deferred. §2 (Strapi) resolved via the Strapi 5.50.0 upgrade on branch `feat/strapi-5-migration` (PR #167). §1 (orval) resolved 2026-07-07 via orval 8.20.0. Original audit: 2026-07-02, branch `fix/deps/audit-2026-07-02`._
