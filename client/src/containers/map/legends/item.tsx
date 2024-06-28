"use client";
import { useGetBySlug } from "@/lib/localized-query";
import { useSyncLayers, useSyncLayersSettings } from "@/store/map";
import { DatasetResponse } from "@/types/generated/strapi.schemas";
import { useLocale } from "next-intl";
import { createElement, useMemo, useState } from "react";
import LegendHeader from "@/components/map/legends/header";
import BasicLegend from "@/components/map/legends/content/basic";
import GradientLegend from "@/components/map/legends/content/gradient";
import RangelandLegend from "@/components/map/legends/content/rangeland";
import { LegendComponent } from "@/components/map/types";
import { getLayerSettings } from "@/lib/utils";
import { Collapsible, CollapsibleContent } from "@radix-ui/react-collapsible";
import LegendChoropleth from "@/components/map/legends/content/choropleth";

const LEGEND_CONTENT = {
  Basic: BasicLegend,
  Gradient: GradientLegend,
  Choropleth: LegendChoropleth,
  Rangeland: RangelandLegend,
};

type LegendItemProps = {
  dataset: string;
};

const LegendItem = ({ dataset }: LegendItemProps) => {
  const locale = useLocale();
  const [layers] = useSyncLayers();
  const [layersSettings, setLayersSettings] = useSyncLayersSettings();
  const [isOpen, setIsOpen] = useState(true);

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
    return getLayerSettings(datasetLayer?.layer?.data?.attributes, layersSettings);
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
    <Collapsible open={isOpen} defaultOpen asChild>
      <div className="group space-y-2 border-b border-b-gray-300 pb-4 last-of-type:border-b-0 last-of-type:pb-0">
        <LegendHeader
          visible={settings.visibility}
          opacity={settings.opacity}
          title={datasetData?.data?.attributes?.title}
          handleChangeIsOpen={() => setIsOpen((prev) => !prev)}
          info={datasetLayer?.layer?.data?.attributes?.description}
          setOpacity={(o) => setLayerSettings("opacity", o)}
          setVisibility={(v) => setLayerSettings("visibility", v)}
        />
        <CollapsibleContent>{LEGEND}</CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default LegendItem;
