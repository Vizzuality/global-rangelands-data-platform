import { useTranslations } from "next-intl";

export type StoryDatasetAttributes = {
  slug?: string;
  title?: string;
  layers?: { layer?: { data?: { attributes?: { slug?: string } } } }[];
};

type RelatedDatasetsProps = {
  datasets: { id?: number; attributes?: StoryDatasetAttributes }[];
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
            {d.attributes?.title ?? d.attributes?.slug}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RelatedDatasets;
