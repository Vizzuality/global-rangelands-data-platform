import Image from "next/image";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import { PARTNERS } from "@/containers/partners/constants";
import { PARTNER_THEME } from "@/containers/partners/theme";
import { getOtherPartners } from "@/containers/partners/utils";
import PartnerButton from "./partner-button";

type KeepExploringProps = {
  slug: string;
};

const KeepExploring = ({ slug }: KeepExploringProps) => {
  const t = useTranslations();
  const otherPartners = getOtherPartners(PARTNERS, slug);

  return (
    <section className="flex flex-col gap-2 pb-20">
      <h2
        className={cn(
          "py-10 text-center font-serif text-4xl font-light leading-tight sm:text-5xl sm:leading-[56px]",
          PARTNER_THEME.chromeText,
          PARTNER_THEME.chromeStroke,
        )}
      >
        {t("Keep exploring")}
      </h2>
      {otherPartners.map((partner) => (
        <div key={partner.slug} className="flex items-stretch justify-center">
          <div
            aria-hidden
            className={cn("relative z-10 my-8 w-8 shrink-0", PARTNER_THEME.accent)}
          />
          <div className="relative z-10 min-w-0 flex-1 bg-white px-6 py-16 xl:px-[100px] xl:py-20">
            <div className="mx-auto flex max-w-[740px] flex-col items-center gap-6 py-6 text-center">
              <div className={cn("relative h-[60px]", partner.logoWidthClassName)}>
                <Image
                  src={partner.logo}
                  alt={t(partner.logoAlt)}
                  fill
                  sizes="147px"
                  className="object-cover"
                />
              </div>
              <p className="text-base leading-7 text-green-dark">{partner.keepExploringText}</p>
              <PartnerButton>
                <Link href={`/partners/${partner.slug}`}>{t("Learn more")}</Link>
              </PartnerButton>
            </div>
          </div>
          <div
            aria-hidden
            className={cn("relative z-10 my-8 w-8 shrink-0", PARTNER_THEME.accent)}
          />
        </div>
      ))}
    </section>
  );
};

export default KeepExploring;
