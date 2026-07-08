"use client";

import { Dataset } from "@/types/generated/strapi.schemas";

import { useSyncDatasets, useSyncLayers, useSyncLayersSettings } from "@/store/map";
import { Switch } from "@/components/ui/switch";
import CitationsIcon from "@/svgs/citations.svg";
import { cn } from "@/lib/utils";
import { useLocale, useTranslations } from "next-intl";
import { RANGELAND_DATASET_SLUG } from "./constants";
import { useMemo } from "react";
import GroupDataset from "./components/group";
import DatasetInfo from "./info";
import TemporalChangesDataset from "./components/temporal";
import { useGetLayers } from "@/types/generated/layer";
import { useGetLocalizedList } from "@/lib/localized-query";
import TemporalGroupDataset from "./components/temporal-group";

type DatasetsItemProps = Dataset & {
  className?: string;
  showTitle?: boolean;
};

type LocalizedGroupProps = "group_es" | "group_fr";

const LAYERS_EXCEPTIONS = ["environmental-justice"];

const DatasetsItem = (props: DatasetsItemProps) => {
  const { className, showTitle, ...attributes } = props;
  const t = useTranslations();
  const [datasets, setDatasets] = useSyncDatasets();
  const [layersSettings, setLayersSettings] = useSyncLayersSettings();
  const [, setLayers] = useSyncLayers();
  const id = attributes?.slug;

  const locale = useLocale();

  const datasetLayers =
    useMemo(() => attributes?.layers.map((l) => l.layer?.id), [attributes?.layers])?.filter(
      (l) => !!l,
      [],
    ) || [];

  const layersQuery = useGetLayers(
    {
      filters: datasetLayers.length
        ? {
            id: {
              $in: datasetLayers,
            },
          }
        : undefined,
      populate: ["translations", "legend", "legend.items"],
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
    [datasetLayers, localizedLayersData?.data],
  );
  const handleToggleDataset = (checked: boolean) => {
    if (!id) return;
    setDatasets((prev) => {
      if (!checked) {
        return prev.filter((d) => d !== id);
      }
      return [id, ...prev];
    });

    if (!checked) {
      setLayers((prev) => prev.filter((l) => !layersData?.map((l) => l.slug)?.includes(l)));
    }
    if (checked) {
      const firstDatasetLayer = layersData?.[0]?.slug;
      if (firstDatasetLayer) {
        setLayers((prev) => [...prev, firstDatasetLayer]);
      }
      if (LAYERS_EXCEPTIONS.includes(id)) {
        setLayersSettings((prev) => {
          if (!id) return prev;
          return {
            ...prev,
            [id]: {
              ...(prev ? prev[id] : {}),
              beforeIdIndex: 0,
            },
          };
        });
      }
    }
  };

  const COMPONENT = useMemo(() => {
    switch (attributes?.type) {
      case "Group":
        return <GroupDataset layers={layersData} slug={attributes?.slug} />;
      case "Temporal":
        return (
          <TemporalChangesDataset
            layers={layersData?.map((l) => {
              const layerType = attributes?.layers.find((dl) => dl.layer?.id === l.id)?.type;
              return {
                ...l,
                type: layerType,
              };
            })}
          />
        );
      case "Temporal-Group": {
        return (
          <TemporalGroupDataset
            layers={layersData?.map((l) => {
              const { type, group, ...props } =
                attributes?.layers.find((dl) => dl.layer?.id === l.id) || {};
              const localizedGroup =
                !locale || locale === "en"
                  ? group
                  : props[`group_${locale}` as LocalizedGroupProps];
              return {
                ...l,
                type,
                group,
                groupName: localizedGroup,
              };
            })}
            slug={attributes?.slug}
          />
        );
      }
      default:
        return null;
    }
  }, [attributes?.type, attributes?.layers, attributes?.slug, layersData]);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="space-y-4">
        {showTitle && (
          <div className="flex w-full justify-between gap-3 font-medium">
            {/* <div className="flex justify-between gap-3"> */}
            {showTitle && (
              <label className="leading-tight" htmlFor={`toggle-${id}`}>
                {attributes?.title}
              </label>
            )}
            {attributes?.slug !== RANGELAND_DATASET_SLUG && (
              <Switch
                id={`toggle-${id}`}
                checked={datasets?.includes(id!)}
                onCheckedChange={handleToggleDataset}
                className="my-1"
              />
            )}
            {/* </div> */}

            {/* <div className="mt-px flex gap-2">
            <LayerVisibility
              visible={datasetVisibility}
              onChangeVisibility={handleChangeVisibility}
            />
          </div> */}
          </div>
        )}
        <div className="space-y-5">
          <p className="text-xs">{attributes?.short_description}</p>
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
                  className="flex gap-1 text-xs font-medium uppercase text-foreground underline underline-offset-2 hover:text-green-light"
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
