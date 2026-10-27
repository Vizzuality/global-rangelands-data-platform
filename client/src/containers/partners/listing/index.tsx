import { useTranslations } from "next-intl";

import FeatureIntroTip from "@/components/feature-intro-tip";
import { cn } from "@/lib/utils";
import { PARTNERS } from "@/containers/partners/constants";
import PartnerSummary from "@/containers/partners/partner-summary";
import { PARTNER_THEME } from "@/containers/partners/theme";

const PartnersListing = () => {
  const t = useTranslations();

  return (
    <main
      className={cn(
        "relative overflow-hidden pt-[var(--mobile-header-height)] lg:pt-[var(--header-height)]",
        PARTNER_THEME.pageBackground,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 opacity-10",
          "[mask-image:url(/images/features-pattern-tile.svg)] [mask-repeat:repeat] [mask-size:1280px_960px]",
          PARTNER_THEME.patternColor,
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-[188px] bg-gradient-to-b to-transparent",
          PARTNER_THEME.headerGradient,
        )}
      />
      <div className="relative">
        <section className="container mx-auto px-6 pb-40 pt-20 xl:px-20">
          <div className="relative flex items-stretch justify-center">
            <FeatureIntroTip
              edge="top"
              accentClassName={PARTNER_THEME.accent}
              outlineClassName={PARTNER_THEME.diamondOutline}
            />
            <FeatureIntroTip
              edge="bottom"
              accentClassName={PARTNER_THEME.accent}
              outlineClassName={PARTNER_THEME.diamondOutline}
            />
            <div
              aria-hidden
              className={cn(
                "relative z-10 hidden w-8 shrink-0 sm:my-8 sm:block",
                PARTNER_THEME.accent,
              )}
            />
            <div
              className={cn(
                "relative z-10 min-w-0 flex-1 bg-white px-6 py-16 sm:py-20",
                PARTNER_THEME.sectionPaddingX,
              )}
            >
              <div className="mx-auto flex max-w-[740px] flex-col items-center gap-10">
                <div className="flex flex-col items-center gap-6 text-center">
                  <h1 className="max-w-[606px] font-serif text-4xl font-light leading-tight text-green-dark sm:text-5xl sm:leading-[56px]">
                    {t("Other rangeland activities")}
                  </h1>
                  <p className="text-body-22-tight text-green-dark/80 sm:text-body-22">
                    {t(
                      "Discover complementary activities and initiatives developed by trusted organisations across the rangelands community. Access additional data, maps, and tools to support informed decisions for the sustainable use, management, and restoration of rangelands worldwide.",
                    )}
                  </p>
                </div>
                <div className="grid w-full gap-8 py-6 sm:grid-cols-2">
                  {PARTNERS.map((partner) => (
                    <PartnerSummary key={partner.slug} partner={partner} />
                  ))}
                </div>
              </div>
            </div>
            <div
              aria-hidden
              className={cn(
                "relative z-10 hidden w-8 shrink-0 sm:my-8 sm:block",
                PARTNER_THEME.accent,
              )}
            />
          </div>
        </section>
      </div>
    </main>
  );
};

export default PartnersListing;
