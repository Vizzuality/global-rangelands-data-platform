import "./globals.css";

import { getTranslations } from "@/i18n";
import { NextIntlClientProvider } from "next-intl";

import { getMessages } from "next-intl/server";
import LayoutProviders from "./layout-providers";

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
      <NextIntlClientProvider messages={messages}>
        <html lang={locale}>
          <body>{children}</body>
        </html>
      </NextIntlClientProvider>
    </LayoutProviders>
  );
}
