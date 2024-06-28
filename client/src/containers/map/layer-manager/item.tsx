"use client";

import { Layer } from "deck.gl";

import { parseConfig } from "@/lib/json-converter";

import { LayerTyped } from "@/types/layers";

import DeckLayer from "@/components/map/layers/deck-layer";
import { useLocale } from "next-intl";
import { useGetBySlug } from "@/lib/localized-query";
import { LayerResponse } from "@/types/generated/strapi.schemas";
import { useBiomes, useEcoregions } from "@/lib/filters";
import { cloneElement, isValidElement } from "react";

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

  if (isValidElement(c)) {
    return cloneElement(c, { id: `${id}-layer`, key: `${id}-layer` });
  }

  return <DeckLayer key={`${id}-layer`} id={`${id}-layer`} beforeId={beforeId} config={c} />;
};

export default LayerManagerItem;
