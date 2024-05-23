import { LOCALES } from "@/middleware";
import { createSharedPathnamesNavigation } from "next-intl/navigation";

export const locales = LOCALES;
export const localePrefix = "always"; // Default

export const { Link, redirect, usePathname, useRouter } = createSharedPathnamesNavigation({
  locales,
  localePrefix,
});
