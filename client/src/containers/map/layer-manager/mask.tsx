"use client";

import { GeoJsonLayer } from "@deck.gl/layers";
import { DataFilterExtension, DataFilterExtensionProps } from "@deck.gl/extensions";

import DeckLayer from "@/components/map/layers/deck-layer";
import { useMemo } from "react";

interface MaskProps {
  beforeId?: string;
  settings: Record<string, unknown>;
  id: string;
}

const Mask = ({ id, beforeId }: MaskProps) => {
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
      filterCategories: [7, 8, 9, 10, 11, 12, 13],
      extensions: [new DataFilterExtension({ categorySize: 1 })],
    });
  }, [id, beforeId]);

  return (
    <>
      <DeckLayer id={`${id}-layer`} config={c} />;
    </>
  );
};

export default Mask;
