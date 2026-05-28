import { env } from "@/env.mjs";

export const CMS_MEDIA_BASE = env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "");
