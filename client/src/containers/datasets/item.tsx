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
import DatasetInfo from "./info";
import TemporalChangesDataset from "./components/temporal";
import { useGetLayers } from "@/types/generated/layer";
import { useGetLocalizedList } from "@/lib/localized-query";

type DatasetsItemProps = DatasetListResponseDataItem & {
  className?: string;
};

const DatasetsItem = ({ attributes, className }: DatasetsItemProps) => {
  const t = useTranslations();
  const [datasets, setDatasets] = useSyncDatasets();
  const [layersSettings, setLayersSettings] = useSyncLayersSettings();
  const [layers, setLayers] = useSyncLayers();
  const id = attributes?.slug;

  const datasetLayers =
    useMemo(() => attributes?.layers.map((l) => l.layer?.data?.id), [attributes?.layers])?.filter(
      (l) => !!l,
    ) || [];

  const layersQuery = useGetLayers(
    {
      filters: !!datasetLayers.length
        ? {
            id: {
              $in: datasetLayers,
            },
          }
        : undefined,
      populate: ["translations"],
    },
    {
      query: {
        enabled: !!datasetLayers.length,
        select: (data) => ({
          ...data,
          data: data.data?.sort(
            (a, b) => datasetLayers.indexOf(a.id) - datasetLayers.indexOf(b.id),
          ),
        }),
      },
    },
  );

  const { data: localizedLayersData } = useGetLocalizedList(layersQuery);

  const layersData = useMemo(
    () => (datasetLayers?.length ? localizedLayersData?.data : []),
    [datasetLayers],
  );

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
        prev.filter((l) => !layersData?.map((l) => l.attributes?.slug)?.includes(l)),
      );
    }
    if (checked) {
      const firstDatasetLayer = layersData?.[0]?.attributes?.slug;
      if (firstDatasetLayer) {
        setLayers((prev) => [...prev, firstDatasetLayer]);
      }
    }
  };

  const datasetLayer = useMemo(
    () =>
      layersData?.find(
        (layer) => !!layer.attributes?.slug && layers.includes(layer.attributes.slug),
      )?.attributes,
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
        return <GroupDataset layers={layersData} slug={attributes?.slug} />;
      case "Temporal":
        return (
          <TemporalChangesDataset
            layers={layersData?.map((l) => {
              const layerType = attributes?.layers.find((dl) => dl.layer?.data?.id === l.id)?.type;
              return {
                ...l,
                type: layerType,
              };
            })}
          />
        );
      default:
        return null;
    }
  }, [attributes?.type, attributes?.layers, attributes?.slug, layersData]);

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
          <p className="line-clamp-3 max-w-[336px] text-xs">{attributes?.description}</p>
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
