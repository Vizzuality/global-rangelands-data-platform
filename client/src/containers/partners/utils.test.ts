import { describe, expect, it } from "vitest";

import { getOtherPartners, getPartner } from "@/containers/partners/utils";

const PARTNERS = [{ slug: "global-pasture-watch" }, { slug: "ramona" }, { slug: "fao" }];

describe("getPartner", () => {
  it("returns the matching entry for a known slug", () => {
    expect(getPartner(PARTNERS, "ramona")).toBe(PARTNERS[1]);
  });

  it("returns undefined for an unknown slug", () => {
    expect(getPartner(PARTNERS, "missing")).toBeUndefined();
  });
});

describe("getOtherPartners", () => {
  it("excludes the current slug and keeps the rest in order", () => {
    expect(getOtherPartners(PARTNERS, "ramona")).toEqual([
      { slug: "global-pasture-watch" },
      { slug: "fao" },
    ]);
  });

  it("returns all partners for an unknown slug", () => {
    expect(getOtherPartners(PARTNERS, "missing")).toEqual(PARTNERS);
  });
});
