// @ts-check
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "NEXT_PUBLIC_",

  server: {
    TRANSIFEX_TOKEN: z.string(),
  },

  client: {
    NEXT_PUBLIC_URL: z.string().url(),
    // Absolute URL, or a root-relative path for same-origin deployments behind
    // a single reverse proxy (see infrastructure/vm/). Server-side code cannot
    // use a relative value — see lib/cms.server.ts and services/api/index.ts.
    NEXT_PUBLIC_API_URL: z
      .string()
      .refine((v) => v.startsWith("/") || z.string().url().safeParse(v).success, {
        message: "must be an absolute URL or a root-relative path starting with /",
      }),
    NEXT_PUBLIC_MAPBOX_TOKEN: z.string(),
  },

  runtimeEnv: {
    NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    TRANSIFEX_TOKEN: process.env.TRANSIFEX_TOKEN,
  },

  emptyStringAsUndefined: true,
});
