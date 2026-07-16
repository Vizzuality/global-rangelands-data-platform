import { useGetBySlug } from "@/lib/localized-query";
import { clusterFeaturesAtom, deckLayersInteractiveAtom } from "@/store/map";
import { LayerResponse } from "@/types/generated/strapi.schemas";
import { InteractionConfig } from "@/types/layers";
import { useAtomValue } from "jotai";
import { createElement, useMemo } from "react";
import RangelandsTooltip from "@/components/map/tooltip/components/rangelands";
import PastoralistTooltip from "@/components/map/tooltip/components/postoralists";
import { useLocale } from "next-intl";
import EjAtlasTooltip from "@/components/map/tooltip/components/ej-atlas";
import LandmarkTooltip from "@/components/map/tooltip/components/landmark";

const PopupItemComponent = {
  RangelandsTooltip,
  PastoralistTooltip,
  EjAtlasTooltip,
  LandmarkTooltip,
};

type PopupItemComponentType = keyof typeof PopupItemComponent;

type PopupItemProps = {
  slug: string;
};

const Item = ({ slug }: PopupItemProps) => {
  const locale = useLocale();
  const deckInteractiveLayers = useAtomValue(deckLayersInteractiveAtom);
  const clusterFeatures = useAtomValue(clusterFeaturesAtom);
  const info = deckInteractiveLayers[slug];

  const { data: layerData } = useGetBySlug<LayerResponse>(`layers/${slug}`, {
    populate: ["translations"],
    locale,
  });

  const isInteractionConfig = (
    interactionConfig: unknown,
  ): interactionConfig is InteractionConfig => {
    return (
      typeof interactionConfig === "object" && !!interactionConfig && "type" in interactionConfig
    );
  };

  const POPUP_COMPONENT = useMemo(() => {
    const popupConfig = layerData?.data?.interaction_config;

    if (!isInteractionConfig(popupConfig)) return null;

    if (popupConfig.type in PopupItemComponent) {
      const type = popupConfig.type as PopupItemComponentType;
      const props = popupConfig?.values?.reduce<Record<string, unknown>>((acc, curr) => {
        return {
          ...acc,
          [curr.key]: info?.object?.properties?.[curr.value],
        };
      }, {});
      return createElement(PopupItemComponent[type], {
        ...props,
        items: clusterFeatures,
      });
    }
  }, [layerData, clusterFeatures, info?.object?.properties]);

  return <div>{POPUP_COMPONENT}</div>;
};

export default Item;
