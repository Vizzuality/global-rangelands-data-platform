import "mapbox-gl/dist/mapbox-gl.css";
import "./globals.css";

import { setRequestLocale } from "next-intl/server";

import { getTranslations } from "@/i18n";
import { LOCALES } from "@/i18n/routing";
import LayoutProviders from "./layout-providers";
import NextIntlProvider from "./next-intl-provider";
import { eyesForSerifs, wotfard } from "@/assets/fonts";

// TODO(next-16): when bumping to Next 16 + React 19, update:
//   1. `params: { locale }` → `params: Promise<{ locale }>` and `await params` (async params API)
//      — applies here, in `[locale]/page.tsx`, and in `[locale]/map/page.tsx`.
//   2. Replace `export const revalidate = 3600` with the Cache Components model:
//      `'use cache'` directive + `cacheLife('hours')` (or a custom profile) + `cacheTag(...)`.
//      Lets translators/Strapi trigger on-demand invalidation via `revalidateTag`.
//   3. Consider PPR (Partial Prerendering) on `/[locale]/map` so the dynamic Sidebar/Map
//      subtree streams while the static shell ships immediately — drop the manual Suspense.
export const revalidate = 3600;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale });

  return {
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

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  setRequestLocale(locale);
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
