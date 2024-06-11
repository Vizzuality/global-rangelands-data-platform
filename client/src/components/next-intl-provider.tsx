"use client";

import { onError } from "@/i18n";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";
import { PropsWithChildren } from "react";

type NextIntlProviderProps = PropsWithChildren & {
  messages: AbstractIntlMessages;
  locale: string;
};
const NextIntlProvider = ({ messages, locale, children }: NextIntlProviderProps) => {
  return (
    <NextIntlClientProvider locale={locale} messages={messages} onError={onError}>
      {children}
    </NextIntlClientProvider>
  );
};

export default NextIntlProvider;
