import { describe, expect, it } from "vitest";

import { cmsImageSrc } from "@/lib/cms";

// NEXT_PUBLIC_API_URL is https://example.test/cms/api in vitest.config.ts, so
// the media base -- the API url without its /api suffix -- is this.
const BASE = "https://example.test/cms";

const ORIGINAL = "/uploads/photo.png";
const FORMATS = {
  thumbnail: { url: "/uploads/thumbnail_photo.png", width: 245 },
  small: { url: "/uploads/small_photo.png", width: 500 },
  medium: { url: "/uploads/medium_photo.png", width: 750 },
};

describe("cmsImageSrc", () => {
  it("returns the narrowest variant at or above minWidth", () => {
    expect(cmsImageSrc(ORIGINAL, FORMATS, 500)).toBe(`${BASE}/uploads/small_photo.png`);
  });

  it("does not return a variant narrower than minWidth", () => {
    expect(cmsImageSrc(ORIGINAL, FORMATS, 600)).toBe(`${BASE}/uploads/medium_photo.png`);
  });

  it("falls back to the original when no variant is wide enough", () => {
    expect(cmsImageSrc(ORIGINAL, FORMATS, 2000)).toBe(`${BASE}${ORIGINAL}`);
  });

  it("returns the original when no minWidth is given", () => {
    // Opting into a smaller variant has to be deliberate: defaulting to the
    // narrowest would hand a full-bleed hero a 245px thumbnail.
    expect(cmsImageSrc(ORIGINAL, FORMATS)).toBe(`${BASE}${ORIGINAL}`);
  });

  it("falls back to the original when formats is absent or empty", () => {
    // Strapi omits formats for files it did not resize, e.g. svg and small png.
    expect(cmsImageSrc(ORIGINAL, null, 500)).toBe(`${BASE}${ORIGINAL}`);
    expect(cmsImageSrc(ORIGINAL, undefined, 500)).toBe(`${BASE}${ORIGINAL}`);
    expect(cmsImageSrc(ORIGINAL, {}, 500)).toBe(`${BASE}${ORIGINAL}`);
  });

  it("ignores variants with no url and variants with no width", () => {
    const partial = {
      thumbnail: { url: "/uploads/thumbnail_photo.png", width: 245 },
      small: { url: null, width: 500 },
      medium: { width: 750 },
      large: { url: "/uploads/large_photo.png" },
    };
    // Only the thumbnail is usable, and it is too narrow, so the original wins.
    expect(cmsImageSrc(ORIGINAL, partial, 500)).toBe(`${BASE}${ORIGINAL}`);
    expect(cmsImageSrc(ORIGINAL, partial, 200)).toBe(`${BASE}/uploads/thumbnail_photo.png`);
  });

  it("accepts the unknown-typed formats field from the generated Strapi types", () => {
    // strapi.schemas.ts declares formats as `unknown`, so every call site
    // hands over a value the compiler knows nothing about.
    const fromStrapi: unknown = FORMATS;
    expect(cmsImageSrc(ORIGINAL, fromStrapi, 500)).toBe(`${BASE}/uploads/small_photo.png`);
  });

  it("falls back to the original when formats is not an object", () => {
    for (const junk of ["nope", 42, true, []]) {
      expect(cmsImageSrc(ORIGINAL, junk, 500)).toBe(`${BASE}${ORIGINAL}`);
    }
  });

  it("passes absolute urls through unprefixed", () => {
    // Staging stores media on GCS, where url is already absolute.
    const abs = "https://storage.googleapis.com/rdp-staging-media/photo.png";
    const absFormats = {
      small: {
        url: "https://storage.googleapis.com/rdp-staging-media/small_photo.png",
        width: 500,
      },
    };
    expect(cmsImageSrc(abs, absFormats, 500)).toBe(absFormats.small.url);
    expect(cmsImageSrc(abs, null, 500)).toBe(abs);
  });
});
