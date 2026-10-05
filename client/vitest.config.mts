import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Mirrors the "@/*" -> "./src/*" mapping in tsconfig.json.
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    include: ["src/**/*.test.ts"],
    // src/env.mjs validates on import and throws when a variable is missing,
    // so anything importing it transitively needs these present. The values
    // only have to satisfy the schema; no test asserts on them.
    env: {
      NEXT_PUBLIC_URL: "https://example.test",
      NEXT_PUBLIC_API_URL: "https://example.test/cms/api",
      NEXT_PUBLIC_MAPBOX_TOKEN: "test-token",
      TRANSIFEX_TOKEN: "test-token",
    },
  },
});
