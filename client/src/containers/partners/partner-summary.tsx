import Image from "next/image";

import { useTranslations } from "@/i18n";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Partner } from "@/containers/partners/constants";
import PartnerButton from "@/containers/partners/detail/partner-button";

type PartnerSummaryProps = {
  partner: Partner;
  className?: string;
};

const PartnerSummary = ({ partner, className }: PartnerSummaryProps) => {
  const t = useTranslations();

  return (
    <div className={cn("flex flex-col items-center gap-6 text-center", className)}>
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
  );
};

export default PartnerSummary;
