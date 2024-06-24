"use strict";

import "./index.css";
import {
  RANGELAND_BIOMES,
  RANGELAND_ECOREGIONS,
  RANGELAND_SYSTEM,
  RANGELAND_SISTEM_COLOR,
} from "@/containers/datasets/constants";
import { useTranslations } from "@/i18n";
import { formatNumber } from "@/lib/json-converter/utils/formats";
import { useSyncRangelandType } from "@/store/map";
import { useMemo } from "react";
import { MapTooltipProps } from "../../types";
import { useGetRangelands } from "@/types/generated/rangeland";

type RangelandsTooltipProps = {
  ecoregion_code?: number;
  area: string;
  percentage: number;
  biome_code?: number;
};

const RangelandsTooltip = (props: MapTooltipProps) => {
  const { biome_code, area, percentage, ecoregion_code } = props as RangelandsTooltipProps;
  const t = useTranslations();
  const [rangelandType] = useSyncRangelandType();

  const { data: rangelandsData } = useGetRangelands(
    {
      populate: "*",
      sort: "title:asc",
    },
    {
      query: {
        enabled: rangelandType !== RANGELAND_SYSTEM,
      },
    },
  );

  const content = useMemo(() => {
    if (rangelandType === RANGELAND_SYSTEM) {
      return {
        title: t("Global Rangeland"),
        comparisonArea: t("Earth area"),
        color: RANGELAND_SISTEM_COLOR,
      };
    }
    const biome = rangelandsData?.data?.find(
      (e) =>
        e?.attributes?.code &&
        isFinite(+e?.attributes?.code) &&
        +e?.attributes?.code === biome_code,
    );
    if (rangelandType === RANGELAND_BIOMES) {
      return {
        comparisonArea: t("Rangeland types"),
        title: biome?.attributes?.title,
        color: biome?.attributes?.color,
      };
    }
    if (rangelandType === RANGELAND_ECOREGIONS) {
      const ecoregion = biome?.attributes?.ecoregions?.data?.find(
        (e) =>
          e?.attributes?.code &&
          isFinite(+e?.attributes?.code) &&
          +e?.attributes?.code === ecoregion_code,
      );
      return {
        comparisonArea: biome?.attributes?.title,
        title: ecoregion?.attributes?.title,
        subtitle: biome?.attributes?.title,
        color: ecoregion?.attributes?.color,
      };
    }
    return {};
  }, []);

  return (
    <div className="overflow-hidden rounded-lg bg-background">
      <div className="border-t-[12px]" style={{ borderColor: content.color }}></div>
      <div className="space-y-4 p-6 pt-3">
        <div className="space-y-2">
          <p className="text-base font-bold leading-tight">{content.title}</p>
          <p className="text-xs uppercase leading-tight">{content.subtitle}</p>
        </div>

        <p className="text-xs">
          <span className="font-bold">{(percentage || 0).toFixed(2)}%</span> {t("of the")}{" "}
          <span className="font-bold">{content.comparisonArea}</span> {t("is attributed to the ")}{" "}
          {content.title}. ({formatNumber(area)} km²)
        </p>
        <div className="h-2 w-full overflow-hidden rounded-sm bg-gray-300">
          <div
            className="h-2 rounded-sm"
            style={{ width: `${percentage}%`, backgroundColor: content.color }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default RangelandsTooltip;
