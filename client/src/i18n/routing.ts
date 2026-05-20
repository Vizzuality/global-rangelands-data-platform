import { defineRouting } from "next-intl/routing";

export const DEFAULT_LOCALE = "en";
export const LOCALES = ["en"] as const;
export const DISABLED_LOCALES = ["es", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
});
