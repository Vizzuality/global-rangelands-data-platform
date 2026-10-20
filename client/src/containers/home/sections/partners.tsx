import Image from "next/image";
import { useTranslations } from "next-intl";

import PartnerButton from "@/containers/partners/detail/partner-button";
import { PARTNERS } from "@/containers/partners/constants";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function Partners() {
  const t = useTranslations();

  return (
    <section
      id="other-rangeland-activities"
      className="container mx-auto scroll-mt-[var(--header-height)] py-14 sm:p-[100px]"
    >
      <div className="flex flex-col items-center justify-center gap-6">
        <Image src="/images/home/icon-color.png" alt={t("logo colored")} width={207} height={58} />
        <h2 className="text-center font-serif text-4xl font-light leading-tight sm:text-5xl">
          {t("Other rangeland activities")}
        </h2>
        <p className="max-w-[740px] text-center text-body-22 opacity-80">
          {t(
            "Discover complementary activities and initiatives developed by trusted organisations across the rangelands community. Access additional data, maps, and tools to support informed decisions for the sustainable use, management, and restoration of rangelands worldwide.",
          )}
        </p>
      </div>
      <div className="mx-auto mt-10 grid max-w-[920px] gap-8 py-6 sm:grid-cols-2">
        {PARTNERS.map((partner) => (
          <div key={partner.slug} className="flex flex-col items-center gap-6">
            <div className={cn("relative h-[60px]", partner.logoWidthClassName)}>
              <Image
                src={partner.logo}
                alt={t(partner.logoAlt)}
                fill
                sizes="147px"
                className="object-cover"
              />
            </div>
            <p className="text-center text-base leading-7">{partner.summary}</p>
            <PartnerButton className="px-5">
              <Link href={`/partners/${partner.slug}`}>{t("Learn more")}</Link>
            </PartnerButton>
          </div>
        ))}
      </div>
    </section>
  );
}
