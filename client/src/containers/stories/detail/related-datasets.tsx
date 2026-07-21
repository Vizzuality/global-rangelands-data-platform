"use client";

import { useTranslations } from "next-intl";

import { useSyncDatasets, useSyncLayers } from "@/store/map";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { StoryDatasetsItem } from "@/types/generated/strapi.schemas";

type RelatedDatasetsProps = {
  datasets: StoryDatasetsItem[];
};

const RelatedDatasets = ({ datasets }: RelatedDatasetsProps) => {
  const t = useTranslations();
  const [syncedDatasets, setDatasets] = useSyncDatasets();
  const [, setLayers] = useSyncLayers();

  const linkableDatasets = datasets.filter(
    (d): d is StoryDatasetsItem & { slug: string } => !!d.slug,
  );

  if (linkableDatasets.length === 0) return null;

  const handleToggleDataset = (datasetSlug: string, layerSlugs: string[], checked: boolean) => {
    if (checked) {
      setDatasets((prev) => (prev.includes(datasetSlug) ? prev : [datasetSlug, ...prev]));
      setLayers((prev) => [...prev, ...layerSlugs.filter((s) => !prev.includes(s))]);
    } else {
      setDatasets((prev) => prev.filter((x) => x !== datasetSlug));
      setLayers((prev) => prev.filter((x) => !layerSlugs.includes(x)));
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-base font-medium">{t("Related datasets")}</h2>
      <ul className="space-y-2.5">
        {linkableDatasets.map((d) => {
          const layerSlugs =
            d.layers?.map((l) => l.layer?.slug).filter((s): s is string => !!s) ?? [];
          const checked = syncedDatasets.includes(d.slug);

          return (
            <li
              key={d.id}
              className={cn(
                "flex items-start justify-between gap-6 px-6 py-4 text-base font-medium leading-6",
                checked ? "bg-green-light text-white" : "border border-green-dark text-green-dark",
              )}
            >
              <label htmlFor={`related-dataset-toggle-${d.slug}`}>{d.title ?? d.slug}</label>
              <Switch
                id={`related-dataset-toggle-${d.slug}`}
                className="mt-1 shrink-0 data-[state=checked]:border-green-medium data-[state=checked]:bg-green-medium"
                checked={checked}
                onCheckedChange={(c) => handleToggleDataset(d.slug, layerSlugs, c)}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RelatedDatasets;
