import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Internal navigation must go through the `Link` from `@/i18n/navigation`,
 * never the default export of `next/link`.
 *
 * This is not a style preference. A plain `next/link` pointing at a
 * root-relative path renders an unlocalised href, so its RSC prefetch is
 * redirected by the next-intl middleware (`/map` -> `/en/map`). Next records
 * the prefetch under the URL it resolved to while the Link looks it up under
 * the URL it asked for, so the entry is never found, and the Link re-prefetches
 * on every render for as long as the page is open. Measured on the home page
 * before the fix: 480 prefetches of `/map` in 12 seconds from one idle tab.
 *
 * `next/link` remains correct for fragments (`#section`) and external URLs —
 * neither involves a locale or a route prefetch. Only root-relative paths are
 * flagged.
 *
 * See GRASS-407.
 */

const SRC = join(import.meta.dirname, "..");

function* walk(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (/\.tsx?$/.test(entry.name)) yield path;
  }
}

const IMPORTS_NEXT_LINK = /^\s*import\s+Link\s+from\s+["']next\/link["']/m;

// href="/..." | href={"/..."} | href={`/...`} | href: "/..."
const ROOT_RELATIVE_HREF = /href\s*[=:]\s*\{?\s*["'`]\/[^"'`]*["'`]/g;

describe("internal links", () => {
  it("never use next/link for a root-relative route", () => {
    const offenders: string[] = [];

    for (const file of walk(SRC)) {
      const source = readFileSync(file, "utf8");
      if (!IMPORTS_NEXT_LINK.test(source)) continue;

      const hrefs = source.match(ROOT_RELATIVE_HREF);
      if (hrefs) {
        offenders.push(`${file.slice(SRC.length + 1)} -> ${hrefs.join(", ")}`);
      }
    }

    expect(offenders).toEqual([]);
  });
});
