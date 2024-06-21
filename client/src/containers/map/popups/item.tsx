import { useGetBySlug } from "@/lib/localized-query";
import { deckLayersInteractiveAtom } from "@/store/map";
import { LayerResponse } from "@/types/generated/strapi.schemas";
import { InteractionConfig } from "@/types/layers";
import { useAtomValue } from "jotai";
import { createElement, useMemo } from "react";
import RangelandsTooltip from "@/components/map/tooltip/components/rangelands";
import { useLocale } from "next-intl";

const PopupItemComponent = {
  RangelandsTooltip,
};

type PopupItemComponentType = keyof typeof PopupItemComponent;

type PopupItemProps = {
  slug: string;
};

const Item = ({ slug }: PopupItemProps) => {
  const locale = useLocale();
  const deckInteractiveLayers = useAtomValue(deckLayersInteractiveAtom);
  const info = deckInteractiveLayers[slug];

  const { data: layerData } = useGetBySlug<LayerResponse>(`layer/${slug}`, {
    populate: "dataset,metadata",
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
    const popupConfig = layerData?.data?.attributes?.interaction_config;

    if (!isInteractionConfig(popupConfig)) return null;

    if (popupConfig.type in PopupItemComponent) {
      const type = popupConfig.type as PopupItemComponentType;
      const props = popupConfig?.values?.reduce<Record<string, unknown>>((acc, curr) => {
        return {
          ...acc,
          [curr.key]: info?.object.properties?.[curr.value],
        };
      }, {});
      return createElement(PopupItemComponent[type], props);
    }
  }, [layerData]);

  return <div>{POPUP_COMPONENT}</div>;
};

export default Item;
