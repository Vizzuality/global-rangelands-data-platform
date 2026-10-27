import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import { PARTNERS } from "@/containers/partners/constants";
import { PARTNER_THEME } from "@/containers/partners/theme";
import { getOtherPartners } from "@/containers/partners/utils";
import PartnerSummary from "@/containers/partners/partner-summary";

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
            className={cn(
              "relative z-10 hidden w-8 shrink-0 sm:my-8 sm:block",
              PARTNER_THEME.accent,
            )}
          />
          <div className="relative z-10 min-w-0 flex-1 bg-white px-6 py-16 xl:px-[100px] xl:py-20">
            <PartnerSummary partner={partner} className="mx-auto max-w-[740px] py-6" />
          </div>
          <div
            aria-hidden
            className={cn(
              "relative z-10 hidden w-8 shrink-0 sm:my-8 sm:block",
              PARTNER_THEME.accent,
            )}
          />
        </div>
      ))}
    </section>
  );
};

export default KeepExploring;
