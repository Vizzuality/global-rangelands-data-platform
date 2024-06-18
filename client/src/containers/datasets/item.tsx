"use client";

import { DatasetListResponseDataItem } from "@/types/generated/strapi.schemas";

import { useSyncDatasets, useSyncLayers, useSyncLayersSettings } from "@/store/map";
import { Switch } from "@/components/ui/switch";
import CitationsIcon from "@/svgs/citations.svg";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { RANGELAND_DATASET_SLUG } from "./constants";
import { useMemo } from "react";
import { LayerInfo, LayerVisibility } from "@/components/map/legends/header/buttons";
import GroupDataset from "./components/group";
import TemporalDataset from "./components/temporal";

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

  const description =
    attributes && "description" in attributes && (attributes?.description as string | undefined);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-2">
        <div className="flex justify-between gap-3 font-medium">
          <div className="flex justify-between gap-3">
            {attributes?.slug !== RANGELAND_DATASET_SLUG && (
              <Switch
                id={`toggle-${id}`}
                checked={datasets?.includes(id!)}
                onCheckedChange={handleToggleDataset}
                className="my-1"
              />
            )}
            <label className="leading-tight" htmlFor={`toggle-${id}`}>
              {attributes?.title}
            </label>
          </div>

          <div className="mt-px flex gap-2">
            <LayerInfo />
            <LayerVisibility
              visible={datasetVisibility}
              onChangeVisibility={handleChangeVisibility}
            />
          </div>
        </div>
        <div>
          <p className="text-xs">{description}</p>
        </div>
      </div>

      {attributes?.type === "Group" && (
        <GroupDataset layers={attributes?.layers} slug={attributes?.slug} />
      )}
      {attributes?.type === "Temporal" && <TemporalDataset layers={attributes?.layers} />}
      <div className="flex items-center gap-2">
        {!!attributes?.sources?.[0]?.url && (
          <a
            href={attributes?.sources?.[0].url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase text-foreground underline underline-offset-2"
          >
            {t("data source")}
          </a>
        )}
        <CitationsIcon className="h-5 w-5" />
      </div>
    </div>
  );
};

export default DatasetsItem;
