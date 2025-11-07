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
import { useGetLocalizedList } from "@/lib/localized-query";
import { useGetEcoregions } from "@/types/generated/ecoregion";

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

  const biomesDataQuery = useGetRangelands(
    {
      populate: ["translations"],
      sort: "title:asc",
      filters: {
        code: `${biome_code}`,
      },
    },
    {
      query: {
        enabled: rangelandType !== RANGELAND_SYSTEM,
      },
    },
  );

  const { data: biomesData } = useGetLocalizedList(biomesDataQuery);

  const ecoregionsDataQuery = useGetEcoregions(
    {
      populate: ["translations"],
      sort: "title:asc",
      filters: {
        code: `${ecoregion_code}`,
      },
    },
    {
      query: {
        enabled: rangelandType === RANGELAND_ECOREGIONS,
      },
    },
  );

  const { data: ecoregionsData } = useGetLocalizedList(ecoregionsDataQuery);

  const content = useMemo(() => {
    if (rangelandType === RANGELAND_SYSTEM) {
      return {
        title: t("Global Rangeland"),
        comparisonArea: t("Earth area"),
        color: RANGELAND_SISTEM_COLOR,
      };
    }
    const biome = biomesData?.data?.[0];
    if (rangelandType === RANGELAND_BIOMES) {
      return {
        comparisonArea: t("Rangeland types"),
        title: biome?.attributes?.title,
        color: biome?.attributes?.color,
      };
    }
    if (rangelandType === RANGELAND_ECOREGIONS) {
      const ecoregion = ecoregionsData?.data?.[0];
      return {
        comparisonArea: biome?.attributes?.title,
        title: ecoregion?.attributes?.title,
        subtitle: biome?.attributes?.title,
        color: ecoregion?.attributes?.color,
      };
    }
    return {};
  }, [rangelandType, biomesData, ecoregionsData, t]);

  return (
    <div className="overflow-hidden bg-background drop-shadow-2xl">
      <div className="border-t-[12px]" style={{ borderColor: content.color }}></div>
      <div className="space-y-4 p-6 pt-3">
        <div className="space-y-2">
          <p className="font-serif text-base leading-tight">{content.title}</p>
          <p className="font-sans text-xs uppercase leading-tight">{content.subtitle}</p>
        </div>

        <p className="text-xs">
          <span className="text-sm font-bold">{(percentage || 0).toFixed(2)}%</span> {t("of the")}{" "}
          <span className="font-bold">{content.comparisonArea}</span> {t("is attributed to the ")}{" "}
          {content.title}. <span className="text-[10px]">({formatNumber(area)} km²)</span>
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
