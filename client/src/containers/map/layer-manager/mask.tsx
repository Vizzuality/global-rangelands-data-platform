"use client";

import { MVTLayer } from "@deck.gl/geo-layers";
import { GeoJsonLayer } from "@deck.gl/layers";

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

type MaskFeature = GeoJSON.Feature<GeoJSON.Geometry, { biome_num?: number; eco_id?: number }>;

const Mask = ({ id, beforeId }: MaskProps) => {
  const [rangelandType] = useSyncRangelandType();

  const biomes = useBiomes();
  const ecoregions = useEcoregions();

  const data = TILESET_URL + `?access_token=${env.NEXT_PUBLIC_MAPBOX_TOKEN}`;

  const allowedCodes = useMemo(() => {
    if (rangelandType === "rangeland-biomes") {
      return new Set(Object.keys(biomes).map(Number));
    }
    if (rangelandType === "rangeland-ecoregions") {
      return new Set(Object.keys(ecoregions).map(Number));
    }
    return null;
  }, [rangelandType, biomes, ecoregions]);

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
      renderSubLayers: (props) => {
        const tileData = props.data as MaskFeature[] | null | undefined;
        const features =
          allowedCodes && Array.isArray(tileData)
            ? tileData.filter((f) => {
                const code =
                  rangelandType === "rangeland-biomes"
                    ? f.properties.biome_num
                    : f.properties.eco_id;
                return typeof code === "number" && allowedCodes.has(code);
              })
            : tileData;
        return new GeoJsonLayer({ ...props, data: features as unknown as MaskFeature[] });
      },
      updateTriggers: {
        renderSubLayers: [rangelandType, allowedCodes],
      },
    });
  }, [id, data, beforeId, rangelandType, allowedCodes]);

  return (
    <>
      <DeckLayer id={`${id}-layer`} config={c} />;
    </>
  );
};

export default Mask;
