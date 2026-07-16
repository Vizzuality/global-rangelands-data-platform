# CMS (Strapi) — Vulnerability Reachability Assessment & Strapi 5 Case

**Date:** 2026-07-02 · **Branch:** `fix/deps/audit-2026-07-02`

This document assesses the dependency vulnerabilities in the `cms` (Strapi) service:
what they are, how reachable they actually are in this deployment, what the within-major
`4.24.2 → 4.26.2` bump fixed, and why the remaining risk requires a Strapi 5 migration —
with a repo-specific effort estimate.

> ✅ **RESOLVED 2026-07-08.** The Strapi 5 migration described here was carried out —
> `@strapi/*` upgraded `4.26.2 → 5.50.0` on branch `feat/strapi-5-migration`
> (PR [#167](https://github.com/Vizzuality/global-rangelands-data-platform/pull/167)). The
> Tier-1 relational-filter critical (`GHSA-rjg2-95x7-8qmx`) is cleared and `cms` `pnpm audit`
> now reports **0 critical** (was 5 critical / 51 high at 4.26.2 → 0 critical / 12 high /
> 16 moderate / 8 low). This document is retained as the assessment record; the sections
> below describe the pre-migration state.

---

## TL;DR

- The scary headline count (`10 critical / 63 high` at 4.24.2) is dominated by **build-time,
  CLI, install-time, and admin-bundle** dependencies that are **not part of the production
  runtime attack surface**.
- The within-major **`4.26.2` bump cleared 32 advisories (5 critical + 12 high)** including
  the two runtime-relevant koa issues and the Content-Type-Builder SQL injection. It is
  committed on this branch.
- After the bump, the **only Tier-1 (unauthenticated, runtime-reachable) critical remaining
  is the Strapi relational-filter data leak** (`GHSA-rjg2-95x7-8qmx`), which is **only fixed
  in Strapi 5.37.0**.
- **Strapi 4 is end-of-life** (final release `4.26.2`, June 2026; no future security fixes).
  This — plus the one genuinely serious runtime critical — is the case for scheduling the
  **Strapi 5 migration**. The dominant migration cost is in the **client** (v5's flattened
  API response), not the CMS backend.

---

## 1. What the `4.26.2` within-major bump fixed

Coordinated upgrade of all `@strapi/*` packages `4.24.2 → 4.26.2` (commit on this branch).

| Metric | Before (4.24.2) | After (4.26.2) |
|---|---|---|
| Critical | 10 | **5** |
| High | 63 | **51** |
| Moderate | 66 | 52 |
| Low | 26 | 23 |

**32 advisories cleared** (5 critical + 12 high), 2 newly-added (both `axios` under the
unused `@strapi/plugin-cloud`). Notably cleared:

- `@strapi/plugin-content-type-builder` — **SQL injection** (GHSA-3xcq-8mjw-h6mx, critical)
- `koa` — **ReDoS** (GHSA-593f-38f6-jp5m, critical) and **Host Header Injection** (GHSA-7gcc-r8m5-44qm, high)
- `form-data` — unsafe boundary (critical) + CRLF injection (high)
- 9 × `axios` and 3 × `node-tar` advisories

This bump is cheap, low-risk (same major), and worth keeping regardless of the v5 decision.

---

## 2. Reachability assessment (post-4.26.2)

Reachability is a property of **how Strapi uses each dependency**, established from the
actual dependency chains (`pnpm audit` paths) and this repo's config, not from the advisory
text. Key context verified in-repo:

- **Standard middleware stack**; **no OAuth/social providers configured** (only the default
  `local` provider) → the `grant → jws → elliptic` OAuth chain is not exercised.
- **Self-hosted** (own `infrastructure/` terraform, no Strapi Cloud usage) → the
  `@strapi/plugin-cloud` code paths are effectively dead.

### 🔴 Tier 1 — Runtime, low-privilege reachable (priority)

| Advisory | Chain | Reachability | Status |
|---|---|---|---|
| **Strapi — sensitive data leak via relational filtering** (CRIT, GHSA-rjg2-95x7-8qmx) | `@strapi/strapi` | **HIGH** — any API caller crafting relation filters on the public REST/GraphQL API; no auth required | ✅ **fixed — upgraded to 5.50.0** (≥5.37.0) |

_The koa ReDoS (critical) and Host Header Injection (high), previously Tier 1, are **fixed**
by the 4.26.2 bump._

### 🟠 Tier 2 — Conditional: needs admin/CLI access or an enabled feature

| Package | Chain | Reachability |
|---|---|---|
| `@casl/ability` (CRIT prototype pollution) | `@strapi/admin>@casl/ability` | Crafted permission/ability rules → **admin-level** |
| `tar` (path traversal, several high) | `@strapi/data-transfer>tar` | Only when importing an **attacker-controlled archive** via CLI/transfer (operator action) |
| `ws` (DoS) | `@strapi/data-transfer>ws` | Only if the **transfer feature** (websocket) is actively used |
| `linkify-it` (ReDoS) | `@strapi/admin>markdown-it` | Rendering attacker markdown in the **admin UI** |

### ⚪ Tier 3 — Build / CLI / install / admin-bundle only (not a production runtime surface)

| Package(s) | Chain | Why not runtime-reachable |
|---|---|---|
| `handlebars` (2 CRIT + 2 HIGH) | `@strapi/generators>node-plop>handlebars` | `strapi generate` **CLI scaffolding** — never runs in the prod server |
| `shell-quote` (CRIT) | `concurrently>shell-quote` | Dev **script runner** |
| `elliptic` (CRIT), `jws` | `@strapi/plugin-users-permissions>grant…` | **OAuth path — not configured**; `elliptic` is on the verify path (`jwk-to-pem`), not signing |
| `rollup`, `vite`, `serialize-javascript` | `@strapi/admin>vite/webpack…` | Admin panel **build/dev tooling** (vite `launch-editor` injection is dev-server only) |
| `tar-fs` (several high) | `@strapi/plugin-upload>sharp>prebuild-install>tar-fs` | **Install-time** binary download from sharp's trusted release server |
| `axios` (11 high), `lodash`, `form-data` | `@strapi/plugin-cloud>@strapi/helper-plugin>…` | Deprecated **admin-UI helper** + **unused Strapi Cloud** CLI; server SSRF/proxy vulns largely N/A in a browser context |
| `validator` | `@strapi/database>umzug>…>z-schema>validator` | **DB-migration tooling** schema validation — not the user-input path |
| `immutable`, `path-to-regexp`, `braces`, `picomatch`, `minimatch`, `cross-spawn` | config-sync / documentation / react-router / build globbing | Deploy/CLI tooling, dev-defined routes, admin client bundle |

> **Deployment hardening (low priority, not a security risk).** `CMS_URL` is not set in the
> deployment environment, so `server.url` is `null` and Strapi derives absolute URLs (email
> links, media URLs) from the request `Host` header. Setting `CMS_URL` makes those links
> stable rather than Host-derived. This is a correctness/hardening nicety — the related koa
> Host-Header-Injection CVE is already fixed by 4.26.2, and the service sits behind its own
> ingress. `NODE_ENV=production` is assumed for the `strapi start` deployment (and would
> disable Content-Type-Builder writes), but the CTB SQLi is fixed by 4.26.2 regardless, so
> neither setting is a gating security concern.

---

## 3. Why Strapi 5 is required

1. **The one unmitigated, unauthenticated, runtime-reachable critical.** The relational-
   filtering data leak (`GHSA-rjg2-95x7-8qmx`) is exploitable by any consumer of the public
   content API and is **only patched in Strapi 5.37.0**. No 4.x release, override, or config
   change fixes it. This alone justifies the migration on security grounds.

2. **Strapi 4 is end-of-life.** Strapi ended v4 bug-fix releases in October 2025 and
   security-only maintenance through ~April 2026; **`4.26.2` (June 2026) is the terminal 4.x
   release.** From here, every newly-disclosed advisory against Strapi 4 or its pinned
   transitive deps is **permanent** — the ~50 high/moderate items still present will only
   grow, and none will ever be patched upstream on the 4.x line.

3. **Override maintenance is not a viable substitute.** Because Strapi 4 pins old *majors*
   of many libraries (koa, handlebars, tar, axios, elliptic, …), scoped overrides frequently
   conflict with the versions Strapi 4 expects, are fragile against Strapi's tree, and cannot
   reach the framework-level data-leak fix at all.

---

## 4. Strapi 5 migration effort (repo-specific)

The good news from the code audit: the **CMS backend is light** and the migration cost is
concentrated in the **client's consumption of the API**.

### Backend (`cms`) — mostly low, two plugin blockers

| Component | Finding | Effort |
|---|---|---|
| Content-type controllers/services/routes (7 each) | All are thin `factories.createCoreController('api::…')` wrappers → handled by the `@strapi/upgrade` codemods | **Low** |
| Lifecycle hooks (4, slug generation) | Use `event.params.data` — API stable across v5 | **Low** |
| Entity Service API usage | **0 occurrences** in custom code → no Document Service rewrite needed | **Low** |
| `config/plugins.ts` (`documentation` mutation, i18n) | Review `mutateDocumentation`/OpenAPI shape for v5 | **Low** |
| `engines.node` (`>=18 <=20.x`) | Widen for v5's supported Node (18/20/22) | **Low** |
| **`strapi-plugin-config-sync` 1.2.5 → 3.x** | v5 support exists but is a **major plugin upgrade** (peer `@strapi/strapi ^5`); synced config format/CLI changes | **Medium** |
| **`strapi-plugin-import-export-entries`** | **No Strapi 5 version** (peer `@strapi/strapi ^4.10.5` only) — must be **replaced or dropped** (evaluate Strapi 5's built-in transfer/import-export or an alternative) | **Medium–High (blocker)** |
| `strapi-plugin-slugify` | Verify v5 compatibility; may be **redundant** with the existing lifecycle-based slug generation and removable | **Low–Medium** |

### Frontend (`client`) — the dominant cost

| Component | Finding | Effort |
|---|---|---|
| **v5 flattened response shape** | **101 `.attributes` references across 18 files** (+3 files with `.data.data` nesting) must change from `data.attributes.field` to `data.field` | **High** |
| **orval type regeneration** | Regenerate `src/types/generated/` from the v5 OpenAPI spec. orval itself is already on 8.20.0 with a `populate` transformer (resolved 2026-07-07, see `SECURITY-DEFERRALS.md` §1), so only the spec-shape regen remains | **Medium** |
| **`documentId` adoption** | Relations/lookups that use numeric `id` may need `documentId` | **Medium** |
| **Coordinated breaking deploy + QA** | The API contract change is breaking; frontend and backend must ship together, with end-to-end testing of map/datasets/stories | **Medium** |

### Suggested sequencing

1. Run `npx @strapi/upgrade major` on `cms` (codemods handle the factory controllers,
   config, and DB column migration on first boot).
2. Resolve the plugin blockers: upgrade `config-sync` to 3.x; replace/drop
   `import-export-entries`; confirm/remove `slugify`.
3. Regenerate the OpenAPI spec, then regenerate the client's orval types (orval 8 + the
   `populate` transformer are already in place, so this is just a regen).
4. Migrate the client's response-shape usage (the 101 `.attributes` sites) and `documentId`.
5. End-to-end QA on a staging DB, then a coordinated FE+BE deploy.

**Overall:** backend is largely codemod-automated (watch the two plugins); the **frontend
response-shape migration is the critical path** and the bulk of the work. Treat it as a
dedicated, tested project — not an incremental dependency bump.

---

## Sources

- Strapi v4→v5 breaking changes — https://docs.strapi.io/cms/migration/v4-to-v5/breaking-changes
- Strapi v4 end-of-support notice — https://github.com/strapi/strapi/issues/24240
- Strapi v4→v5 migration resources — https://strapi.io/blog/strapi-v4-to-v5-migration-resources

_Companion: `SECURITY-DEFERRALS.md` (repo root) records all deferred vulnerabilities across services._
