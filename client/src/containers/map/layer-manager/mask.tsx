"use client";

import { MVTLayer } from "@deck.gl/geo-layers";
import { DataFilterExtension } from "@deck.gl/extensions";

import DeckLayer from "@/components/map/layers/deck-layer";
import { useMemo } from "react";
import { useSyncRangelandType } from "@/store/map";
import { useBiomes, useEcoregions } from "@/lib/filters";
import { env } from "@/env.mjs";

const TILESET_URL = "https://api.mapbox.com/v4/grass2024.969ld3cp/{z}/{x}/{y}.mvt";

interface MaskProps {
  beforeId?: string;
  settings: Record<string, unknown>;
  id: string;
}

const Mask = ({ id, beforeId }: MaskProps) => {
  const [rangelandType] = useSyncRangelandType();

  const biomes = useBiomes();
  const ecoregions = useEcoregions();

  const data = TILESET_URL + `?access_token=${env.NEXT_PUBLIC_MAPBOX_TOKEN}`;

  const filterEnabled =
    rangelandType === "rangeland-biomes" || rangelandType === "rangeland-ecoregions";

  const filterCategories = useMemo(() => {
    if (rangelandType === "rangeland-biomes") {
      return Object.keys(biomes).map(Number);
    }
    if (rangelandType === "rangeland-ecoregions") {
      return Object.keys(ecoregions).map(Number);
    }
    return [];
  }, [rangelandType, biomes, ecoregions]);

  const getFilterCategory = useMemo(
    () => (f: { properties: Record<string, unknown> }) => {
      if (rangelandType === "rangeland-biomes") {
        return f.properties.biome_num as number;
      }
      return f.properties.eco_id as number;
    },
    [rangelandType],
  );

  const c = useMemo(() => {
    return new MVTLayer({
      id: `${id}-layer-deck`,
      data,
      beforeId,
      operation: "mask",
      binary: false,
      visible: true,
      opacity: 1,
      pickable: false,
      extensions: [new DataFilterExtension({ filterSize: 0, categorySize: 1 })],
      filterEnabled,
      getFilterCategory,
      filterCategories,
      updateTriggers: {
        getFilterCategory: rangelandType,
        filterCategories: [rangelandType, biomes, ecoregions],
      },
    });
  }, [
    id,
    data,
    beforeId,
    filterEnabled,
    getFilterCategory,
    filterCategories,
    rangelandType,
    biomes,
    ecoregions,
  ]);

  return (
    <>
      <DeckLayer id={`${id}-layer`} config={c} />;
    </>
  );
};

export default Mask;
