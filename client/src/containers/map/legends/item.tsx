import {
  RANGELAND_DATASET_SLUG,
  RANGELAND_ECOREGIONS,
  RANGELAND_SISTEM_COLOR,
  RANGELAND_SYSTEM,
} from "@/containers/datasets/constants";
import { useGetBySlug } from "@/lib/localized-query";
import { useSyncLayers, useSyncLayersSettings } from "@/store/map";
import { useGetRangelands } from "@/types/generated/rangeland";
import { DatasetResponse } from "@/types/generated/strapi.schemas";
import { useLocale } from "next-intl";
import { createElement, useCallback, useMemo } from "react";
import LegendHeader from "@/components/map/legends/header";
import LegendContent from "@/components/map/legends";
import BasicLegend from "@/components/map/legends/content/basic";
import GradientLegend from "@/components/map/legends/content/gradient";
import { LegendComponent } from "@/components/map/types";
import { ParamsConfig } from "@/types/layers";

const LEGEND_CONTENT = {
  Basic: BasicLegend,
  Gradient: GradientLegend,
};

type LegendItemProps = {
  dataset: string;
};

const LegendItem = ({ dataset }: LegendItemProps) => {
  const locale = useLocale();
  const [layers] = useSyncLayers();
  const [layersSettings, setLayersSettings] = useSyncLayersSettings();

  const { data: datasetData } = useGetBySlug<DatasetResponse>(`dataset/${dataset}`, {
    populate: "layers,layers.layer,layers.layer.legend,layers.layer.legend.items",
    locale,
  });

  const isRangelandDataset = datasetData?.data?.attributes?.slug === RANGELAND_DATASET_SLUG;

  const { data: rangelandsData } = useGetRangelands(
    {
      populate: "*",
      sort: "title:asc",
    },
    {
      query: {
        enabled: isRangelandDataset,
      },
    },
  );

  const datasetLayer = useMemo(() => {
    return datasetData?.data?.attributes?.layers?.find((layer) => {
      return (
        !!layer.layer?.data?.attributes?.slug && layers.includes(layer.layer.data.attributes.slug)
      );
    });
  }, [datasetData, layers]);

  // Extract the legend items from the dataset layer
  const getLayerItems = useCallback((): LegendComponent["items"] => {
    const layer = datasetLayer?.layer?.data?.attributes;
    if (isRangelandDataset) {
      if (layer?.slug === RANGELAND_SYSTEM) {
        return [{ name: "Global", color: RANGELAND_SISTEM_COLOR }];
      }
      return (
        rangelandsData?.data?.map((rd) => ({
          name: rd?.attributes?.title,
          color: rd?.attributes?.color,
          ...(layer?.slug === RANGELAND_ECOREGIONS
            ? {
                items: rd?.attributes?.ecoregions?.data?.map((b) => ({
                  name: b?.attributes?.title,
                  color: b?.attributes?.color,
                })),
              }
            : {}),
        })) || []
      );
    }
    return layer?.legend?.items || [];
  }, [datasetLayer, isRangelandDataset, rangelandsData]);

  const _isLegendType = (legendType?: string): legendType is keyof typeof LEGEND_CONTENT => {
    return !!legendType && legendType in LEGEND_CONTENT;
  };

  const LEGEND = useMemo(() => {
    const legendType = isRangelandDataset
      ? "Basic"
      : datasetLayer?.layer?.data?.attributes?.legend?.type;
    if (_isLegendType(legendType)) {
      const props = { items: getLayerItems() };
      return createElement(LEGEND_CONTENT[legendType], props);
    }
  }, [isRangelandDataset, datasetLayer]);

  const settings = useMemo(() => {
    const layerSettings =
      (!!datasetLayer?.layer?.data?.attributes?.slug &&
        layersSettings?.[datasetLayer?.layer?.data?.attributes?.slug]) ||
      {};

    const params =
      (datasetLayer?.layer?.data?.attributes?.params_config as ParamsConfig)?.reduce(
        (acc, curr) => {
          if (curr.key === "colors") return acc;
          return {
            ...acc,
            [curr.key]: curr.default,
          };
        },
        {},
      ) || {};

    const currSettings = Object.assign({}, params, layerSettings);
    return {
      visibility: (currSettings.visibility as boolean) ?? true,
      opacity: (currSettings.opacity as number) ?? 1,
    };
  }, [layersSettings, datasetLayer]);

  const setLayerSettings = (key: string, value: boolean | number) => {
    const layer = datasetLayer?.layer?.data?.attributes;
    if (!!layer?.slug) {
      const layerSlug = layer.slug;
      setLayersSettings((prev) => ({
        ...prev,
        [layerSlug]: {
          ...(prev?.[layerSlug] || {}),
          [key]: value,
        },
      }));
    }
  };

  const layerSubtitle = useMemo(() => {
    const layer = datasetLayer?.layer?.data?.attributes;
    if (layer?.slug !== RANGELAND_SYSTEM) {
      return datasetLayer?.name;
    }
    return;
  }, [isRangelandDataset, datasetLayer]);

  return (
    <div className="space-y-2 border-b border-b-gray-300 pb-4 last-of-type:border-b-0 last-of-type:pb-0">
      <LegendHeader
        visible={settings.visibility}
        opacity={settings.opacity}
        title={datasetData?.data?.attributes?.title}
        subtitle={layerSubtitle}
        info={datasetLayer?.layer?.data?.attributes?.description}
        setOpacity={(o) => setLayerSettings("opacity", o)}
        setVisibility={(v) => setLayerSettings("visibility", v)}
      />
      <LegendContent>{LEGEND}</LegendContent>
    </div>
  );
};

export default LegendItem;
