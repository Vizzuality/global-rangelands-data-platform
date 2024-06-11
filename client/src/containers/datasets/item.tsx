"use client";

import { DatasetListResponseDataItem } from "@/types/generated/strapi.schemas";

import { useSyncDatasets, useSyncLayers, useSyncLayersSettings } from "@/store/map";
import { Switch } from "@/components/ui/switch";
import CitationsIcon from "@/svgs/citations.svg";
import GroupLayers from "./group-layers";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { RANGELAND_DATASET_SLUG } from "./constants";
import { CircleHelpIcon, EyeIcon } from "lucide-react";
import { Toggle } from "@radix-ui/react-toggle";
import { useMemo } from "react";

type DatasetsItemProps = DatasetListResponseDataItem & {
  className?: string;
};

const DatasetsItem = ({ attributes, className }: DatasetsItemProps) => {
  const t = useTranslations();
  const [datasets, setDatasets] = useSyncDatasets();
  const [layersSettings, setLayersSettings] = useSyncLayersSettings();
  const [layers, setLayers] = useSyncLayers();
  const id = attributes?.slug;

  const handleToggleDataset = (checked: boolean) => {
    if (!id) return;
    setDatasets((prev) => {
      if (!checked) {
        return prev.filter((d) => d !== id);
      }
      return [...prev, id];
    });

    if (!checked) {
      setLayers((prev) =>
        prev.filter(
          (l) => !attributes?.layers?.map((l) => l.layer?.data?.attributes?.slug)?.includes(l),
        ),
      );
    }
    if (checked) {
      const firstDatasetLayer = attributes?.layers?.[0]?.layer?.data?.attributes?.slug;
      if (firstDatasetLayer) {
        setLayers((prev) => [...prev, firstDatasetLayer]);
      }
    }
  };

  const datasetLayer = useMemo(
    () =>
      attributes?.layers?.find(
        (layer) =>
          !!layer.layer?.data?.attributes?.slug &&
          layers.includes(layer.layer.data.attributes.slug),
      )?.layer?.data?.attributes,
    [attributes, layers],
  );

  const handleChangeVisibility = (visible: boolean) => {
    const datasetLayerSlug = datasetLayer?.slug;
    if (datasetLayerSlug) {
      setLayersSettings((prev) => ({
        ...prev,
        [datasetLayerSlug]: {
          ...(prev?.[datasetLayerSlug] || {}),
          visibility: visible,
        },
      }));
    }
  };

  const datasetVisibility = useMemo(() => {
    if (!!datasetLayer?.slug) {
      return (
        !layersSettings?.[datasetLayer?.slug] ||
        (layersSettings?.[datasetLayer?.slug]?.visibility as boolean)
      );
    }
  }, [datasetLayer?.slug, layersSettings]);

  return (
    <div className={cn("space-y-7", className)}>
      <div className="flex items-center justify-between gap-3 font-medium">
        <div>
          {attributes?.slug !== RANGELAND_DATASET_SLUG && (
            <Switch
              id={`toggle-${id}`}
              checked={datasets?.includes(id!)}
              onCheckedChange={handleToggleDataset}
            />
          )}
          <label htmlFor={`toggle-${id}`}>{attributes?.title}</label>
        </div>
        <div className="flex gap-2">
          <CircleHelpIcon className="h-5 w-5 stroke-foreground" />
          <Toggle
            className="data-[state=off]:opacity-20"
            onPressedChange={handleChangeVisibility}
            pressed={datasetVisibility}
          >
            <EyeIcon className="h-6 w-6 fill-foreground stroke-background" />
          </Toggle>
        </div>
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
