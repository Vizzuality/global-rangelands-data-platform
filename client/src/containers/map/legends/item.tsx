import { useGetBySlug } from "@/lib/localized-query";
import { useSyncLayers, useSyncLayersSettings } from "@/store/map";
import { DatasetResponse } from "@/types/generated/strapi.schemas";
import { useLocale } from "next-intl";
import { createElement, useMemo } from "react";
import LegendHeader from "@/components/map/legends/header";
import LegendContent from "@/components/map/legends";
import BasicLegend from "@/components/map/legends/content/basic";
import GradientLegend from "@/components/map/legends/content/gradient";
import RangelandLegend from "@/components/map/legends/content/rangeland";
import { LegendComponent } from "@/components/map/types";
import { ParamsConfig } from "@/types/layers";

const LEGEND_CONTENT = {
  Basic: BasicLegend,
  Gradient: GradientLegend,
  Rangeland: RangelandLegend,
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

  const datasetLayer = useMemo(() => {
    return datasetData?.data?.attributes?.layers?.find((layer) => {
      return (
        !!layer.layer?.data?.attributes?.slug && layers.includes(layer.layer.data.attributes.slug)
      );
    });
  }, [datasetData, layers]);

  const _isLegendType = (legendType?: string): legendType is keyof typeof LEGEND_CONTENT => {
    return !!legendType && legendType in LEGEND_CONTENT;
  };

  const LEGEND = useMemo(() => {
    const legendType = datasetLayer?.layer?.data?.attributes?.legend?.type;

    if (_isLegendType(legendType)) {
      const props = {
        items: datasetLayer?.layer?.data?.attributes?.legend?.items as LegendComponent["items"],
      };
      return createElement(LEGEND_CONTENT[legendType], props);
    }
  }, [datasetLayer]);

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

  return (
    <div className="space-y-2 border-b border-b-gray-300 pb-4 last-of-type:border-b-0 last-of-type:pb-0">
      <LegendHeader
        visible={settings.visibility}
        opacity={settings.opacity}
        title={datasetData?.data?.attributes?.title}
        subtitle={datasetLayer?.name}
        info={datasetLayer?.layer?.data?.attributes?.description}
        setOpacity={(o) => setLayerSettings("opacity", o)}
        setVisibility={(v) => setLayerSettings("visibility", v)}
      />
      <LegendContent>{LEGEND}</LegendContent>
    </div>
  );
};

export default LegendItem;
