import { ScatterplotLayer } from "@deck.gl/layers";
import { useDeckMapboxOverlayContext } from "../../provider";
import { useEffect, useMemo, useState } from "react";
import { MVTLayer } from "deck.gl";

import { useAtomValue } from "jotai";
import { deckLayersInteractiveAtom } from "@/store/map";

import useMapZoom from "@/hooks/use-map-zoom";
import Supercluster from "supercluster";
import { useMap } from "react-map-gl";

export interface EjAtlasLayerComponentProps {
  id: string;
  data: string;
  opacity?: number;
  visibility?: boolean;
  colorProperty: string;
  lineWidth?: number;
  beforeId?: string;
}

const SUPER_CLUSTER = new Supercluster();
const EjAtlasLayerComponent = ({
  id,
  data,
  opacity,
  visibility,
  colorProperty,
  lineWidth = 1,
  beforeId,
  ...props
}: EjAtlasLayerComponentProps) => {
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);
  const i = `${id}-deck`;
  const { addLayer, removeLayer } = useDeckMapboxOverlayContext();
  const interactiveLayers = useAtomValue(deckLayersInteractiveAtom);

  const zoom = useMapZoom();
  const { current: mapRef } = useMap();

  useMemo(() => {
    const ejAtlasInteractiveLayer = interactiveLayers["ej-atlas-points"];
    if (!ejAtlasInteractiveLayer) {
      setHoveredProperty(null);
    }
  }, [interactiveLayers]);

  const config = useMemo(
    () =>
      new MVTLayer({
        id: i,
        data,
        beforeId,
        opacity,
        visible: visibility,
        pickable: true,
        onClick: (info) => {
          if (!info?.object) return;
          setHoveredProperty(`${info?.object?.properties.name}-${info?.object?.id}`);
        },
        onTileError: () => {},
        updateTriggers: {
          getLineWidth: [hoveredProperty],
          getRadius: [hoveredProperty, zoom],
        },
        binary: false,
        renderSubLayers: (props) => {
          if (!props.data) return null;
          console.log(props);
          const bbox = mapRef?.getBounds().toArray().flat();
          const zoom = mapRef?.getZoom();
          const data = SUPER_CLUSTER.load(props.data).getClusters(bbox, zoom);

          console.log({ bbox, zoom });
          console.log("supercluster", data);
          return [
            new ScatterplotLayer(props, {
              id: `${props.id}-filled`,
              data,
              radiusUnits: "pixels",
              radiusScale: 1,
              stroked: false,
              filled: true,
              lineWidthUnits: "pixels",
              lineWidthMinPixels: 0,
              getLineColor: () => {
                return [255, 255, 255];
              },
              getRadius: 10,
              getPosition: (f) => {
                return f.geometry.coordinates;
              },
              updateTriggers: {
                getRadius: [hoveredProperty, zoom],
                getLineWidth: [hoveredProperty],
              },
            }),
            new ScatterplotLayer(props, {
              id: `${props.id}-line`,
              data,
              radiusUnits: "pixels",
              radiusScale: 1,
              stroked: true,
              filled: false,
              lineWidthUnits: "pixels",
              lineWidthMinPixels: 0,
              getLineColor: () => {
                return [0, 0, 0];
              },
              getRadius: 12,
              getLineWidth: 2,
              getPosition: (f) => {
                return f.geometry.coordinates;
              },
              updateTriggers: {
                getRadius: [hoveredProperty, zoom],
                getLineWidth: [hoveredProperty],
              },
            }),
          ];
        },
        ...props,
      }),

    [id, opacity, visibility, props, zoom],
  );

  useEffect(() => {
    if (!config) return;
    // Give the map a chance to load the background layer before adding the Deck layer
    setTimeout(() => {
      // https://github.com/visgl/deck.gl/blob/c2ba79b08b0ea807c6779d8fe1aaa307ebc22f91/modules/mapbox/src/resolve-layers.ts#L66
      addLayer(config);
      console.log("test", config.getRenderedFeatures());
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

export default EjAtlasLayerComponent;
