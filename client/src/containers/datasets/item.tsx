"use client";

import { DatasetListResponseDataItem } from "@/types/generated/strapi.schemas";

import { useSyncDatasets, useSyncLayers, useSyncLayersSettings } from "@/store/map";
import { Switch } from "@/components/ui/switch";
import CitationsIcon from "@/svgs/citations.svg";
import { cn, getLayerSettings } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { RANGELAND_DATASET_SLUG } from "./constants";
import { useMemo } from "react";
import { LayerVisibility } from "@/components/map/legends/header/buttons";
import GroupDataset from "./components/group";
import TemporalDataset from "./components/temporal";
import DatasetInfo from "./info";
import TemporalChangesDataset from "./components/temporal-changes";

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
    return getLayerSettings(datasetLayer, layersSettings)?.visibility;
  }, [datasetLayer, layersSettings]);

  const COMPONENT = useMemo(() => {
    switch (attributes?.type) {
      case "Group":
        return <GroupDataset layers={attributes?.layers} slug={attributes?.slug} />;
      case "Temporal":
        return <TemporalDataset layers={attributes?.layers} />;
      case "Temporal-changes":
        return <TemporalChangesDataset layers={attributes?.layers} />;
      default:
        return null;
    }
  }, [attributes?.type, attributes?.layers, attributes?.slug]);

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
            <LayerVisibility
              visible={datasetVisibility}
              onChangeVisibility={handleChangeVisibility}
            />
          </div>
        </div>
        <div className="space-y-5">
          <p className="line-clamp-3 text-xs">{attributes?.description}</p>
          <div className="flex gap-2">
            <DatasetInfo
              title={attributes?.title}
              citations={attributes?.citations}
              info={attributes?.description}
            />
            <div className="flex items-center gap-2">
              {!!attributes?.sources?.url && (
                <a
                  href={attributes?.sources?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-1 text-xs font-medium uppercase text-foreground underline underline-offset-2"
                >
                  {t("data source")}
                  <CitationsIcon className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {COMPONENT}
    </div>
  );
};

export default DatasetsItem;
