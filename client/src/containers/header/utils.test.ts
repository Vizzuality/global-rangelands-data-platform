import { describe, expect, it } from "vitest";

import { isNavItemActive } from "./utils";

describe("isNavItemActive", () => {
  it("matches an exact path", () => {
    expect(isNavItemActive("/map", "/map")).toBe(true);
  });

  it("matches nested paths under the href", () => {
    expect(isNavItemActive("/map/something", "/map")).toBe(true);
  });

  it("matches a nested features path", () => {
    expect(isNavItemActive("/features/x", "/features")).toBe(true);
  });

  it("matches the root href only on the root path", () => {
    expect(isNavItemActive("/", "/")).toBe(true);
    expect(isNavItemActive("/map", "/")).toBe(false);
  });

  it("does not match a path that only shares a prefix", () => {
    expect(isNavItemActive("/mapx", "/map")).toBe(false);
  });
});
