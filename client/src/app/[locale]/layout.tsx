import "./globals.css";

import { getTranslations } from "@/i18n";
import { getMessages } from "next-intl/server";
import LayoutProviders from "./layout-providers";
import NextIntlProvider from "@/components/next-intl-provider";
import Header from "@/containers/header";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale });

  return {
    title: t("Rangelands Data Platform"),
    description: t(
      "Diverse ecosystems crucial for both wildlife and people. Explore their beauty and significance with our Vital Ecosystem Atlas, advocating for their protection and restoration.",
    ),
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <LayoutProviders>
      <html lang={locale}>
        <NextIntlProvider locale={locale} messages={messages}>
          <body className="flex h-[100svh] flex-col overflow-y-hidden">
            <Header />
            <div className="flex-1">{children}</div>
          </body>
        </NextIntlProvider>
      </html>
    </LayoutProviders>
  );
}
