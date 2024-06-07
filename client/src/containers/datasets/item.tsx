"use client";

import { DatasetListResponseDataItem } from "@/types/generated/strapi.schemas";

import { useSyncDatasets, useSyncLayers } from "@/store/map";
import { Switch } from "@/components/ui/switch";
import { useTranslations } from "next-intl";
import CitationsIcon from "@/svgs/citations.svg";
import GroupLayers from "./group-layers";
import { cn } from "@/lib/utils";

type DatasetsItemProps = DatasetListResponseDataItem & {
  className?: string;
};

const DatasetsItem = ({ id, attributes, className }: DatasetsItemProps) => {
  const t = useTranslations();
  const [datasets, setDatasets] = useSyncDatasets();
  const [, setLayers] = useSyncLayers();

  const handleToggleDataset = (checked: boolean) => {
    if (!id) return;
    setDatasets((prev) => {
      if (!checked) {
        return prev.filter((d) => d !== id);
      }
      return [...prev, id];
    });
    if (!checked) {
      setLayers((prev) => prev.filter((l) => !attributes?.layers?.map((l) => l.id)?.includes(l)));
    }
    if (checked) {
      const firstDatasetLayer = attributes?.layers?.[0]?.id;
      if (firstDatasetLayer) {
        setLayers((prev) => [...prev, firstDatasetLayer]);
      }
    }
  };

  return (
    <div className={cn("space-y-7", className)}>
      <div className="flex items-center gap-3 font-medium">
        <Switch
          id={`toggle-${id}`}
          checked={datasets?.includes(id!)}
          onCheckedChange={handleToggleDataset}
        />
        <label htmlFor={`toggle-${id}`}>{attributes?.title}</label>
      </div>
      {attributes?.type === "Group" && (
        <GroupLayers layers={attributes?.layers} slug={attributes?.slug} />
      )}
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase text-foreground underline underline-offset-2">
          {t("data source")}
        </span>
        <CitationsIcon className="h-5 w-5" />
      </div>
    </div>
  );
};

export default DatasetsItem;
