"use client";
import { useGetBySlug, useGetLocalizedList } from "@/lib/localized-query";
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
import { useGetLayers } from "@/types/generated/layer";

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
    populate: ["layers", "translations", "layers.layer"],
    locale,
  });

  const datasetLayers =
    useMemo(
      () => datasetData?.data?.attributes?.layers.map((l) => l.layer?.data?.id),
      [datasetData?.data?.attributes?.layers],
    )?.filter((l) => !!l) || [];

  const layersQuery = useGetLayers(
    {
      filters: !!datasetLayers.length
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
      },
    },
  );

  const { data: localizedLayersData } = useGetLocalizedList(layersQuery);

  const datasetLayer = useMemo(() => {
    return localizedLayersData?.data?.find((layer) => {
      return !!layer?.attributes?.slug && layers.includes(layer?.attributes?.slug);
    });
  }, [localizedLayersData, layers]);

  const _isLegendType = (legendType?: string): legendType is keyof typeof LEGEND_CONTENT => {
    return !!legendType && legendType in LEGEND_CONTENT;
  };

  const LEGEND = useMemo(() => {
    const legendType = datasetLayer?.attributes?.legend?.type;

    if (_isLegendType(legendType)) {
      const props = {
        items: datasetLayer?.attributes?.legend?.items as LegendComponent["items"],
      };
      return createElement(LEGEND_CONTENT[legendType], props);
    }
  }, [datasetLayer]);

  const settings = useMemo(() => {
    return getLayerSettings(datasetLayer?.attributes, layersSettings);
  }, [layersSettings, datasetLayer]);

  const setLayerSettings = (key: string, value: boolean | number) => {
    const layer = datasetLayer?.attributes;
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

  const subtitle = useMemo(() => {
    if (datasetData?.data?.attributes?.type === "Group") {
      const layerName = datasetLayer?.attributes?.title;
      const items = datasetLayer?.attributes?.legend?.items;
      if (items?.[0]?.name !== layerName) {
        return layerName;
      }
    }
    return;
  }, [datasetData?.data?.attributes?.type, datasetLayer?.attributes]);

  return (
    <Collapsible open={isOpen} defaultOpen asChild>
      <div className="group space-y-2 border-b border-b-gray-300 pb-4 last-of-type:border-b-0 last-of-type:pb-0">
        <LegendHeader
          visible={settings.visibility}
          opacity={settings.opacity}
          title={datasetData?.data?.attributes?.title}
          subtitle={subtitle}
          handleChangeIsOpen={() => setIsOpen((prev) => !prev)}
          info={datasetLayer?.attributes?.description}
          setOpacity={(o) => setLayerSettings("opacity", o)}
          setVisibility={(v) => setLayerSettings("visibility", v)}
        />
        <CollapsibleContent>
          {datasetLayer?.attributes?.legend?.unit && (
            <div className="mb-1.5 flex items-end justify-end">
              <span className="text-xs">{datasetLayer?.attributes?.legend?.unit}</span>
            </div>
          )}
          {LEGEND}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default LegendItem;
