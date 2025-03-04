import { MVTLayer } from "@deck.gl/geo-layers";
import { useDeckMapboxOverlayContext } from "../../provider";
import { env } from "@/env.mjs";
import { useEffect, useMemo, useState } from "react";

export interface RangelandsLayerComponentProps {
  id: string;
  data: string;
  opacity?: number;
  visibility?: boolean;
  colorProperty: string;
  lineWidth?: number;
  beforeId?: string;
}

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
  const config = useMemo(
    () =>
      new MVTLayer({
        id: i,
        data: dataWithMapboxToken,
        beforeId,
        opacity: opacity ?? 1,
        visible: visibility ?? true,

        pickable: true,
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
    [id, dataWithMapboxToken, opacity, visibility, props],
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
