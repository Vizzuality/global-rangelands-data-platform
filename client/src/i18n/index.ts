import { IntlError, IntlErrorCode, useTranslations as useNextIntlTranslations } from "next-intl";
import { getTranslations as getNextIntlTranslations } from "next-intl/server";

export { LOCALES, DEFAULT_LOCALE, routing, type Locale } from "./routing";

export const useTranslations = () => {
  const t = useNextIntlTranslations();
  return (str: string) => t(str.replaceAll(".", "{{dot}}"));
};

export const getTranslations = async (opts?: { locale: string }) => {
  const t = await getNextIntlTranslations(opts);
  return (str: string) => t(str.replaceAll(".", "{{dot}}"));
};

export function onError(error: IntlError) {
  if (error.code !== IntlErrorCode.MISSING_MESSAGE) {
    // Missing translations are expected and should only log an error
    console.error(error);
  }
}

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
