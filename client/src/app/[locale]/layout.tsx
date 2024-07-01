import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";

import localFont from "next/font/local";

import { getTranslations } from "@/i18n";
import { getMessages } from "next-intl/server";
import LayoutProviders from "./layout-providers";
import NextIntlProvider from "@/components/next-intl-provider";
import Header from "@/containers/header";
// import { w } from "next/font/google"
export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale });

  return {
    title: t("Rangelands Data Platform"),
    description: t(
      "Diverse ecosystems crucial for both wildlife and people. Explore their beauty and significance with our Vital Ecosystem Atlas, advocating for their protection and restoration.",
    ),
  };
}

// Font files can be colocated inside of `app`
const wotfard = localFont({
  src: "../../assets/fonts/wotfard-regular-webfont.woff2",
  display: "swap",
});

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
      <html lang={locale} className={wotfard.className}>
        <NextIntlProvider locale={locale} messages={messages}>
          <body className="flex flex-col">
            <Header />
            <div className="flex-1">{children}</div>
          </body>
        </NextIntlProvider>
      </html>
    </LayoutProviders>
  );
}
