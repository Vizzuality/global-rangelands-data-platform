"use client";

import { GeoJsonLayer } from "@deck.gl/layers";
import { DataFilterExtension, DataFilterExtensionProps } from "@deck.gl/extensions";

import DeckLayer from "@/components/map/layers/deck-layer";
import { useMemo } from "react";
import { useSyncRangelandRegions, useSyncRangelandType } from "@/store/map";
import { useGetRangelands } from "@/types/generated/rangeland";

interface MaskProps {
  beforeId?: string;
  settings: Record<string, unknown>;
  id: string;
}

const Mask = ({ id, beforeId }: MaskProps) => {
  const [rangelandType] = useSyncRangelandType();
  const [rangelandRegions] = useSyncRangelandRegions();
  const { data: rangelandsData } = useGetRangelands({
    populate: "*",
    sort: "title:asc",
  });

  const biomes = useMemo(() => {
    return (
      rangelandsData?.data
        ?.map((r) => +(r.attributes?.code || 0) ?? [])
        ?.filter((r) => {
          if (rangelandRegions.length === 0) return true;
          return rangelandRegions.includes(`${r}`);
        }) ?? []
    );
  }, [rangelandRegions, rangelandsData]);

  const ecoregions = useMemo(() => {
    return (
      rangelandsData?.data
        ?.map((r) => r.attributes?.ecoregions?.data?.map((e) => +(e.attributes?.code || 0)) ?? [])
        ?.flat()
        ?.filter((r) => {
          if (rangelandRegions.length === 0) return true;
          return rangelandRegions.includes(`${r}`);
        }) ?? []
    );
  }, [rangelandRegions, rangelandsData]);

  const filterCategories = useMemo(() => {
    if (rangelandType === "rangeland-biomes") return biomes;
    if (rangelandType === "rangeland-ecoregions") return ecoregions;
    return [-1];
  }, [rangelandType, biomes, ecoregions]);

  const c = useMemo(() => {
    return new GeoJsonLayer<
      {
        objectid: number;
        eco_name: string;
        biome_num: number;
        biome_name: string;
        realm: string;
        eco_biome_: string;
        nnh: number;
        nnh_name: string;
        eco_id: number;
        shape_leng: number;
        shape_area: number;
        color: string;
        color_bio: string;
        color_nnh: string;
        license: string;
        area_km2: number;
        percentage: number;
      },
      DataFilterExtensionProps
    >({
      id: `${id}-layer-deck`,
      data: "/data/rangeland-ecoregions.json",
      // @ts-expect-error - TS doesn't know about the beforeId prop
      beforeId,
      operation: "mask",
      visible: true,
      opacity: 1,
      pickable: false,
      getFilterCategory: (f) => {
        if (rangelandType === "rangeland-ecoregions") return f.properties.eco_id;
        if (rangelandType === "rangeland-biomes") return f.properties.biome_num;

        return -1;
      },
      filterCategories,
      extensions: [new DataFilterExtension({ categorySize: 1 })],
      updateTriggers: {
        getFilterCategory: rangelandType,
        filterCategories: filterCategories,
      },
    });
  }, [id, beforeId, rangelandType, filterCategories]);

  return (
    <>
      <DeckLayer id={`${id}-layer`} config={c} />;
    </>
  );
};

export default Mask;
