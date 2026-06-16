import { useTranslations } from "next-intl";

import type { DefaultFurtherInfoComponent } from "@/types/generated/strapi.schemas";
import FurtherInfoItem from "./further-info-item";

type FurtherInfoProps = {
  items: DefaultFurtherInfoComponent[];
  locale: string;
};

const FurtherInfo = ({ items, locale }: FurtherInfoProps) => {
  const t = useTranslations();

  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide">{t("Further information")}</h2>
      <div className="space-y-2">
        {items.map((item, i) => (
          <FurtherInfoItem key={item.id ?? i} item={item} locale={locale} />
        ))}
      </div>
    </div>
  );
};

export default FurtherInfo;
