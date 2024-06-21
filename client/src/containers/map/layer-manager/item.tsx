"use client";

// import { ReactElement, cloneElement, useCallback } from "react";

import { Layer } from "deck.gl";
// import { useAtomValue, useSetAtom } from "jotai";

import { parseConfig } from "@/lib/json-converter";

// import { LayerResponseDataObject } from "@/types/generated/strapi.schemas";
import { LayerTyped } from "@/types/layers";

// import { layersInteractiveAtom, layersInteractiveIdsAtom } from "@/store/map";

import DeckLayer from "@/components/map/layers/deck-layer";
import { useLocale } from "next-intl";
import { useGetBySlug } from "@/lib/localized-query";
import { LayerResponse } from "@/types/generated/strapi.schemas";
import { useBiomes, useEcoregions } from "@/lib/filters";
// import MapboxLayer from "@/components/map/layers/mapbox-layer";

interface LayerManagerItemProps {
  beforeId?: string;
  settings: Record<string, unknown>;
  id: string;
}

const LayerManagerItem = ({ id, beforeId, settings }: LayerManagerItemProps) => {
  const locale = useLocale();

  const biomes = useBiomes();
  const ecoregions = useEcoregions();

  const { data } = useGetBySlug<LayerResponse>(`layer/${id}`, {
    populate: "dataset,metadata",
    locale,
  });

  if (!data?.data?.attributes) return null;

  const { type } = data.data.attributes as unknown as LayerTyped;

  // The only layer type we are using for now is DeckLayer, but the CMS doesn't support the type "Deck", so we are using the type "Mapbox" for now
  if (type === "Mapbox") {
    const { config, params_config } = data.data.attributes as unknown as LayerTyped;
    const c = parseConfig<Layer>({
      config: {
        ...config,
        id: `${id}-layer-deck`,
        slug: id,
        beforeId: `${id}-layer`,
      },
      params_config,
      settings: {
        ...settings,
        biomes: biomes,
        ecoregions: ecoregions,
      },
    });

    return <DeckLayer key={`${id}-layer`} id={`${id}-layer`} beforeId={beforeId} config={c} />;
  }

  // We are not using component layers for now, but the component will remain in case of future uses
  // if (type === "component") {
  //   const { config, params_config } = data.data.attributes;
  //   const c = parseConfig<ReactElement>({
  //     config,
  //     params_config,
  //     settings,
  //   });

  //   if (!c) return null;
  //   return cloneElement(c, { id: `${id}-layer`, beforeId });
  // }
};

export default LayerManagerItem;
