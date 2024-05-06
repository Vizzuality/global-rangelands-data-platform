// @ts-check
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "NEXT_PUBLIC_",

  client: {
    NEXT_PUBLIC_CLIENT_URL: z.string().url(),
    NEXT_PUBLIC_CMS_URL: z.string().url(),
  },

  runtimeEnv: {
    NEXT_PUBLIC_CLIENT_URL: process.env.NEXT_PUBLIC_CLIENT_URL,
    NEXT_PUBLIC_CMS_URL: process.env.NEXT_PUBLIC_CMS_URL,
  },

  emptyStringAsUndefined: true,
});