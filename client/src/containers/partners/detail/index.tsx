import { Fragment } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import type { Partner } from "@/containers/partners/constants";
import { PARTNER_THEME } from "@/containers/partners/theme";
import KeepExploring from "./keep-exploring";
import PartnerButton from "./partner-button";

type PartnerDetailProps = {
  partner: Partner;
};

const PartnerDetail = ({ partner }: PartnerDetailProps) => {
  const t = useTranslations();
  const { Body } = partner;

  return (
    <main
      className={cn(
        "relative overflow-hidden pt-[var(--header-height)]",
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
        <section className={cn("container mx-auto px-6 py-10", PARTNER_THEME.sectionPaddingX)}>
          <div className="flex items-stretch justify-center">
            <div
              aria-hidden
              className={cn("relative z-10 my-8 w-8 shrink-0", PARTNER_THEME.accent)}
            />
            <div className="relative z-10 min-w-0 flex-1 space-y-8 bg-white px-6 py-16 text-green-dark xl:px-24 xl:py-20">
              <div className="mx-auto flex max-w-[760px] flex-col items-center gap-6 pb-4 text-center">
                <Link
                  href="/#other-rangeland-activities"
                  className="inline-flex items-center gap-1 text-xs font-medium uppercase leading-5 text-green-dark underline underline-offset-2 hover:text-green-light"
                >
                  <ArrowLeft className="h-5 w-5" />
                  {t("Other rangeland activities")}
                </Link>
                <h1 className="font-serif text-4xl font-light leading-tight text-green-dark sm:text-5xl sm:leading-[56px]">
                  {partner.titleLines.map((line, index) => (
                    <Fragment key={line}>
                      {index > 0 && <br />}
                      {line}
                    </Fragment>
                  ))}
                </h1>
                <div className={cn("relative h-[60px]", partner.logoWidthClassName)}>
                  <Image
                    src={partner.logo}
                    alt={t(partner.logoAlt)}
                    fill
                    sizes="147px"
                    priority
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="relative -mx-6 h-[420px] xl:-mx-24 xl:h-[475px]">
                <Image
                  src={partner.heroImage}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 1280px) 1016px, 100vw"
                  className="object-cover"
                />
              </div>

              <div className="mx-auto flex max-w-[632px] flex-col gap-10">
                <Body />
                {partner.websiteUrl && (
                  <PartnerButton className="w-[145px] self-start">
                    <a href={partner.websiteUrl} target="_blank" rel="noopener noreferrer">
                      {t("Visit site")}
                    </a>
                  </PartnerButton>
                )}
              </div>
            </div>
            <div
              aria-hidden
              className={cn("relative z-10 my-8 w-8 shrink-0", PARTNER_THEME.accent)}
            />
          </div>
        </section>

        <div className={cn("container mx-auto px-6", PARTNER_THEME.sectionPaddingX)}>
          <KeepExploring slug={partner.slug} />
        </div>
      </div>
    </main>
  );
};

export default PartnerDetail;
