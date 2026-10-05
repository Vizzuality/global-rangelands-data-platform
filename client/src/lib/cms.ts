import { env } from "@/env.mjs";

export const CMS_API_BASE = env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "");

export const CMS_MEDIA_BASE = env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "");

export function mediaUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `${CMS_MEDIA_BASE}${url}`;
}

/** One entry of Strapi's `formats`, once it has been checked at runtime. */
type CmsImageVariant = { url: string; width: number };

function isVariant(value: unknown): value is CmsImageVariant {
  if (typeof value !== "object" || value === null) return false;
  const { url, width } = value as { url?: unknown; width?: unknown };
  return typeof url === "string" && typeof width === "number";
}

/**
 * src for a CMS image. Pair it with `unoptimized` on next/image.
 *
 * The Next optimizer cannot be relied on for these. It resolves a relative url
 * against its own origin and serves public/ from a listing taken when the
 * server starts, so an upload that reaches the volume after the client
 * container booted answers 400 until that container restarts. It also has
 * nothing to add: Strapi resizes every upload at ingest and records the
 * results in `formats`.
 *
 * Returns the narrowest variant at least `minWidth` wide. Omit `minWidth` to
 * get the original -- variant coverage differs per file (Strapi skips presets
 * the original is already smaller than), so a caller that wants a smaller file
 * has to say how small, and anything unavailable falls back to the original.
 *
 * `formats` is `unknown` because that is how it reaches every call site:
 * strapi.schemas.ts types it that way, so the shape is checked here instead.
 */
export function cmsImageSrc(url: string, formats?: unknown, minWidth?: number): string {
  if (minWidth === undefined) return mediaUrl(url);

  const variants = typeof formats === "object" && formats !== null ? Object.values(formats) : [];

  const narrowestUsable = variants
    .filter(isVariant)
    .sort((a, b) => a.width - b.width)
    .find((variant) => variant.width >= minWidth);

  return mediaUrl(narrowestUsable?.url ?? url);
}
