import { PropsWithChildren } from "react";
import { getMessages } from "next-intl/server";

import NextIntlProvider from "@/components/next-intl-provider";

type LocaleLayoutProps = PropsWithChildren & {
  locale: string;
};
export default async function LayoutProviders({ children, locale }: LocaleLayoutProps) {
  const messages = await getMessages();
  return (
    <>
      <NextIntlProvider locale={locale} messages={messages}>
        {children}
      </NextIntlProvider>
    </>
  );
}
