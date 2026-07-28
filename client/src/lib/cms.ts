import { env } from "@/env.mjs";

export const CMS_MEDIA_BASE = env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "");

export function mediaUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `${CMS_MEDIA_BASE}${url}`;
}
