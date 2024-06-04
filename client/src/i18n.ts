import { tx } from "@transifex/native";
import { env } from "./env.mjs";
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { LOCALES } from "./middleware";
import { IntlErrorCode, useTranslations as useNextIntlTranslations } from "next-intl";
import { getTranslations as getNextIntlTranslations } from "next-intl/server";

export const useTranslations = () => {
  const t = useNextIntlTranslations();
  return (str: string) => t(str.replaceAll(".", "{{dot}}"));
};

export const getTranslations = async (opts?: { locale: string }) => {
  const t = await getNextIntlTranslations(opts);
  return (str: string) => t(str.replaceAll(".", "{{dot}}"));
};

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!LOCALES.includes(locale)) notFound();

  tx.init({
    token: env.TRANSIFEX_TOKEN,
  });

  await tx.fetchTranslations(locale, { refresh: true });
  const translations = Object.fromEntries(
    Object.entries(tx.cache.getTranslations(locale)).map(([key, value]) => [
      key.replaceAll(".", "{{dot}}"),
      value,
    ]),
  );

  return {
    messages: translations,
    onError: (error) => {
      if (error.code !== IntlErrorCode.MISSING_MESSAGE) {
        console.error(error);
      }
    },
  };
});
