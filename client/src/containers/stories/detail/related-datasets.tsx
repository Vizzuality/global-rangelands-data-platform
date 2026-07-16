import { useTranslations } from "next-intl";

import type { StoryDatasetsItem } from "@/types/generated/strapi.schemas";

type RelatedDatasetsProps = {
  datasets: StoryDatasetsItem[];
};

const RelatedDatasets = ({ datasets }: RelatedDatasetsProps) => {
  const t = useTranslations();

  if (datasets.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold uppercase tracking-wide">{t("Related datasets")}</h2>
      <ul className="space-y-1">
        {datasets.map((d) => (
          <li key={d.id} className="text-sm">
            {d.title ?? d.slug}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RelatedDatasets;
