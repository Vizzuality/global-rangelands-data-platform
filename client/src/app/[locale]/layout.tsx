import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

import { getTranslations } from "@/i18n";
import LayoutProviders from "./layout-providers";
import NextIntlProvider from "./next-intl-provider";
import { eyesForSerifs, wotfard } from "@/assets/fonts";
import { env } from "@/env.mjs";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  const t = await getTranslations({ locale });

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_URL),
    title: t("Rangelands Data Platform"),
    description: t(
      "Diverse ecosystems crucial for both wildlife and people. Explore their beauty and significance with our Vital Ecosystem Atlas, advocating for their protection and restoration.",
    ),
    manifest: "/images/metadata/site.webmanifest",
    icons: [
      { rel: "shortcut icon", url: "/favicon.ico", type: "image/x-icon" },
      { rel: "icon", url: "/images/metadata/favicon.svg", type: "image/x-icon" },
      {
        rel: "icon",
        url: "/images/metadata/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        rel: "icon",
        url: "/images/metadata/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        rel: "icon-192",
        url: "/images/metadata/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "icon-512",
        url: "/images/metadata/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        rel: "apple-touch-icon",
        url: "/images/metadata/apple-touch-icon.png",
        sizes: "72x72",
        type: "image/png",
      },
    ],
  };
}

export default async function LocaleLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  const { children } = props;

  return (
    <LayoutProviders>
      <NextIntlProvider locale={locale}>
        <html lang={locale} className={`${eyesForSerifs.variable} ${wotfard.variable}`}>
          <body className="flex flex-col">
            <div className="flex-1">{children}</div>
          </body>
        </html>
      </NextIntlProvider>
    </LayoutProviders>
  );
}
