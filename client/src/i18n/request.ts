import { tx } from "@transifex/native";
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

import { env } from "@/env.mjs";

import { onError } from "./index";
import { LOCALES, type Locale } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;
  if (!locale || !LOCALES.includes(locale as Locale)) {
    notFound();
  }

  tx.init({
    token: env.TRANSIFEX_TOKEN,
  });

  await tx.fetchTranslations(locale as string, { refresh: true });
  const translations = Object.fromEntries(
    Object.entries(tx.cache.getTranslations(locale as string)).map(([key, value]) => [
      key.replaceAll(".", "{{dot}}"),
      value,
    ]),
  );

  return {
    locale: locale as string,
    messages: translations,
    onError,
  };
});
