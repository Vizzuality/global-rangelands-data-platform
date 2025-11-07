import { MVTLayer } from "@deck.gl/geo-layers";
import { useDeckMapboxOverlayContext } from "../../provider";
import { env } from "@/env.mjs";
import { useEffect, useMemo, useState } from "react";
import { useSyncLayers, useSyncLayersSettings } from "@/store/map";
import {
  RANGELAND_BIOMES,
  RANGELAND_ECOREGIONS,
  RANGELAND_SYSTEM,
} from "@/containers/datasets/constants";

export interface RangelandsLayerComponentProps {
  id: string;
  data: string;
  opacity?: number;
  visibility?: boolean;
  colorProperty: string;
  lineWidth?: number;
  beforeId?: string;
}

const RANGELANDS_LAYERS_SLUGS = [RANGELAND_SYSTEM, RANGELAND_BIOMES, RANGELAND_ECOREGIONS];

// This is a fix to a bug with the deckgl layers interaction order. The Rangelands layer is always picked, regardless of the layers order. For that reason if there is a layer on top of the rangelands that is pickable, the Rangelands layer should NOT be pickable, so that the top layer can be interactive.
const useIsPickable = () => {
  const [layers] = useSyncLayers();
  const [layerSettings] = useSyncLayersSettings();

  const isPickable = useMemo(() => {
    const rangelandsLayerIndex = layers.findIndex((layer) =>
      RANGELANDS_LAYERS_SLUGS.includes(layer),
    );

    const firstPickableLayerIndex = layers?.findIndex((layer) => {
      const layerSetting = layerSettings?.[layer];
      return layerSetting?.visibility !== false;
    });

    return firstPickableLayerIndex === rangelandsLayerIndex;
  }, [layers, layerSettings]);

  return isPickable;
};

const RangelandsLayerComponent = ({
  id,
  data,
  opacity,
  visibility,
  colorProperty,
  lineWidth = 1,
  beforeId,
  ...props
}: RangelandsLayerComponentProps) => {
  const dataWithMapboxToken = data + `?access_token=${env.NEXT_PUBLIC_MAPBOX_TOKEN}`;
  const [hoveredProperty, setHoveredProperty] = useState(null);
  const i = `${id}-deck`;
  const { addLayer, removeLayer } = useDeckMapboxOverlayContext();
  const isPickable = useIsPickable();

  const config = useMemo(
    () =>
      new MVTLayer({
        id: i,
        data: dataWithMapboxToken,
        beforeId,
        opacity: opacity ?? 1,
        visible: visibility ?? true,
        pickable: isPickable,
        onHover: (info) => {
          setHoveredProperty(info?.object?.properties?.[colorProperty]);
        },
        getLineWidth: (f) => {
          return f?.properties?.[colorProperty] === hoveredProperty ? lineWidth : 0;
        },
        lineWidthUnits: "pixels",
        getLineColor: [255, 255, 255],
        updateTriggers: {
          getLineWidth: hoveredProperty,
        },
        ...props,
      }),
    [id, dataWithMapboxToken, opacity, visibility, props, isPickable],
  );

  useEffect(() => {
    if (!config) return;
    // Give the map a chance to load the background layer before adding the Deck layer
    setTimeout(() => {
      // https://github.com/visgl/deck.gl/blob/c2ba79b08b0ea807c6779d8fe1aaa307ebc22f91/modules/mapbox/src/resolve-layers.ts#L66
      addLayer(config);
    }, 10);
  }, [i, id, config, addLayer]);

  useEffect(() => {
    if (!config) return;
    return () => {
      removeLayer(i);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

export default RangelandsLayerComponent;
