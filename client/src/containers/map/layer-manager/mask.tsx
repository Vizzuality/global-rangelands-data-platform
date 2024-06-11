"use client";

// import { ReactElement, cloneElement, useCallback } from "react";

import { GeoJsonLayer } from "@deck.gl/layers";
import { Layer } from "react-map-gl";
import { DataFilterExtension, DataFilterExtensionProps } from "@deck.gl/extensions";
// import { useAtomValue, useSetAtom } from "jotai";

// import { layersInteractiveAtom, layersInteractiveIdsAtom } from "@/store/map";

import DeckLayer from "@/components/map/layers/deck-layer";
import { useMemo } from "react";
// import MapboxLayer from "@/components/map/layers/mapbox-layer";

interface MaskProps {
  beforeId?: string;
  settings: Record<string, unknown>;
  id: string;
}

const Mask = ({ id }: MaskProps) => {
  const c = useMemo(() => {
    return new GeoJsonLayer<
      {
        biome_num: number;
      },
      DataFilterExtensionProps
    >({
      id,
      data: "/data/rangeland-ecoregions.json",
      operation: "mask",
      getFilterCategory: (f) => f.properties.biome_num,
      filterCategories: [7, 8, 9, 10, 11, 12, 13],
      extensions: [new DataFilterExtension({ categorySize: 1 })],
    });
  }, [id]);

  return (
    <>
      <Layer id={`${id}-layer`} key={id} type="background" layout={{ visibility: "none" }} />
      <DeckLayer id={`${id}-layer`} config={c} />;
    </>
  );
};

export default Mask;
