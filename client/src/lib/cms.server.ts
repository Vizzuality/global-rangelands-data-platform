/**
 * Server-only CMS base URLs.
 *
 * DO NOT import this from a client component. It resolves the internal Docker
 * hostname, and leaking that into the browser bundle produces URLs no browser
 * can reach. The browser-safe module is `lib/cms.ts`, whose values stay
 * relative on purpose.
 *
 * Behind nginx the browser talks to `/cms/api/`, but nothing on Node resolves a
 * relative URL, and a server-side round trip out through nginx would be
 * pointless. `CMS_INTERNAL_API_URL` is the container-network address.
 *
 * These are functions, not constants: route handler modules are evaluated
 * during `next build`, when CMS_INTERNAL_API_URL may be unset, and a
 * module-scope throw would fail the build rather than the request.
 */
import { env } from "@/env.mjs";

// process.env directly, not env.mjs: a server-scoped key in env.mjs throws when
// this module is reached from the client, and the type stays `string | undefined`
// either way.
function internalApiUrl(): string {
  const url = process.env.CMS_INTERNAL_API_URL || env.NEXT_PUBLIC_API_URL;

  if (!/^https?:\/\//i.test(url)) {
    throw new Error(
      "CMS_INTERNAL_API_URL must be an absolute http(s) URL when " +
        `NEXT_PUBLIC_API_URL is relative (NEXT_PUBLIC_API_URL="${env.NEXT_PUBLIC_API_URL}", ` +
        `CMS_INTERNAL_API_URL="${process.env.CMS_INTERNAL_API_URL ?? ""}")`,
    );
  }

  return url;
}

export function cmsInternalApiBase(): string {
  return internalApiUrl().replace(/\/+$/, "");
}

export function cmsInternalMediaBase(): string {
  return internalApiUrl().replace(/\/api\/?$/, "");
}

export function internalMediaUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `${cmsInternalMediaBase()}${url}`;
}
