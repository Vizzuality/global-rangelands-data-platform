"use client";

import { GeoJsonLayer } from "@deck.gl/layers";

import DeckLayer from "@/components/map/layers/deck-layer";
import { useMemo } from "react";
import { useSyncRangelandType } from "@/store/map";
import { useBiomes, useEcoregions } from "@/lib/filters";

import DATA from "@/data/rangeland-ecoregions.json";

interface MaskProps {
  beforeId?: string;
  settings: Record<string, unknown>;
  id: string;
}

const Mask = ({ id, beforeId }: MaskProps) => {
  const [rangelandType] = useSyncRangelandType();

  const biomes = useBiomes();
  const ecoregions = useEcoregions();

  const D = useMemo(() => {
    const d = DATA as GeoJSON.FeatureCollection<
      GeoJSON.Geometry,
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
      }
    >;
    const features = d.features.filter((f) => {
      if (rangelandType === "rangeland-biomes")
        return Object.keys(biomes).includes(`${f.properties.biome_num}`);
      if (rangelandType === "rangeland-ecoregions")
        return Object.keys(ecoregions).includes(`${f.properties.eco_id}`);

      return true;
    });

    return {
      ...d,
      features,
    };
  }, [rangelandType, biomes, ecoregions]);

  const c = useMemo(() => {
    return new GeoJsonLayer<{
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
    }>({
      id: `${id}-layer-deck`,
      data: D,
      // @ts-expect-error - TS doesn't know about the beforeId prop
      beforeId,
      operation: "mask",
      visible: true,
      opacity: 1,
      pickable: false,
    });
  }, [id, D, beforeId]);

  return (
    <>
      <DeckLayer id={`${id}-layer`} config={c} />;
    </>
  );
};

export default Mask;
