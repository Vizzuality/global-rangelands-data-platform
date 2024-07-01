import { tx } from "@transifex/native";
import { env } from "./env.mjs";
import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { LOCALES } from "./middleware";
import { IntlError, IntlErrorCode, useTranslations as useNextIntlTranslations } from "next-intl";
import { getTranslations as getNextIntlTranslations } from "next-intl/server";

export const useTranslations = () => {
  const t = useNextIntlTranslations();
  return (str: string) => t(str.replaceAll("{{dot}}", "."));
};

export const getTranslations = async (opts?: { locale: string }) => {
  const t = await getNextIntlTranslations(opts);
  return (str: string) => t(str.replaceAll("{{dot}}", "."));
};

export function onError(error: IntlError) {
  if (error.code !== IntlErrorCode.MISSING_MESSAGE) {
    // Missing translations are expected and should only log an error
    console.error(error);
  }
}

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!LOCALES.includes(locale)) notFound();

  tx.init({
    token: env.TRANSIFEX_TOKEN,
  });

  await tx.fetchTranslations(locale, { refresh: true });
  const translations = Object.fromEntries(
    Object.entries(tx.cache.getTranslations(locale)).map(([key, value]) => [
      key.replaceAll("{{dot}}", "."),
      value,
    ]),
  );

  return {
    messages: translations,
    onError,
  };
});

export const getMessageFallback = ({
  namespace,
  key,
  error,
}: {
  error: IntlError;
  key: string;
  namespace?: string | undefined;
}) => {
  const path = [namespace, key].filter((part) => part != null).join(".");

  if (error.code === IntlErrorCode.MISSING_MESSAGE) {
    return path + " is not yet translated";
  } else {
    return "Dear developer, please fix this message: " + path;
  }
};
