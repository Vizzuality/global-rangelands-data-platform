"use client";

import { GeoJsonLayer } from "@deck.gl/layers";
import { DataFilterExtension, DataFilterExtensionProps } from "@deck.gl/extensions";

import DeckLayer from "@/components/map/layers/deck-layer";
import { useMemo } from "react";
import { useSyncRangelandRegions } from "@/store/map";
import { useGetRangelands } from "@/types/generated/rangeland";

interface MaskProps {
  beforeId?: string;
  settings: Record<string, unknown>;
  id: string;
}

const Mask = ({ id, beforeId }: MaskProps) => {
  const [rangelandRegions] = useSyncRangelandRegions();
  const { data: rangelandsData } = useGetRangelands({
    populate: "*",
    sort: "title:asc",
  });

  console.log(rangelandsData);

  const biomes = useMemo(() => {
    return rangelandsData?.data
      ?.filter((r) => {
        if (rangelandRegions.length === 0) return true;
        return rangelandRegions.includes(r.attributes?.code || "");
      })
      ?.map((r) => +(r.attributes?.code || 0));
  }, [rangelandRegions, rangelandsData]);

  const c = useMemo(() => {
    return new GeoJsonLayer<
      {
        biome_num: number;
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
      getFilterCategory: (f) => f.properties.biome_num,
      filterCategories: biomes,
      extensions: [new DataFilterExtension({ categorySize: 1 })],
    });
  }, [id, beforeId, biomes]);

  return (
    <>
      <DeckLayer id={`${id}-layer`} config={c} />;
    </>
  );
};

export default Mask;
