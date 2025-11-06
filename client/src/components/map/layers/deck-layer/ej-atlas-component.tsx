import { ScatterplotLayer } from "@deck.gl/layers";
import { useDeckMapboxOverlayContext } from "../../provider";
import { useEffect, useMemo, useState } from "react";
import { TileLayer } from "deck.gl";
import { MVTLoader } from "@loaders.gl/mvt";
import { load } from "@loaders.gl/core";

import { useAtomValue } from "jotai";
import { deckLayersInteractiveAtom } from "@/store/map";

import useMapZoom from "@/hooks/use-map-zoom";
import Supercluster from "supercluster";
import { useMap } from "react-map-gl";
import { features } from "process";

export interface EjAtlasLayerComponentProps {
  id: string;
  data: string;
  opacity?: number;
  visibility?: boolean;
  colorProperty: string;
  lineWidth?: number;
  beforeId?: string;
}

const SUPER_CLUSTER = new Supercluster({ radius: 1, maxZoom: 20 });

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

  useMemo(() => {
    const ejAtlasInteractiveLayer = interactiveLayers["ej-atlas-points"];
    if (!ejAtlasInteractiveLayer) {
      setHoveredProperty(null);
    }
  }, [interactiveLayers]);

  const config = useMemo(
    () =>
      new TileLayer({
        id: i,
        data,
        beforeId,
        opacity,
        visible: visibility,
        pickable: true,
        getTileData: async (props) => {
          const loaderOptions = {
            mvt: {
              coordinates: "wgs84",
              tileIndex: {
                x: props.index.x,
                y: props.index.y,
                z: props.index.z,
              },
            },
          };

          return load(props.url, MVTLoader, loaderOptions).then((data) => {
            const d = SUPER_CLUSTER.load(data).getClusters(
              [props.bbox.west, props.bbox.south, props.bbox.east, props.bbox.north],
              props.zoom,
            );
            return d;
          });
        },
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
          if (!props.data || !props.tile) return null;

          console.log("Rendering sublayers for tile:", props.tile.index, "with data:", props.data);

          return [
            new ScatterplotLayer(props, {
              id: `${props.id}-filled`,
              data: props.data,
              radiusUnits: "pixels",
              radiusScale: 1,
              stroked: false,
              filled: true,
              lineWidthUnits: "pixels",
              lineWidthMinPixels: 0,

              getFillColor: (d) => {
                if (d.properties.cluster) {
                  return [0, 0, 255, 100];
                }
                return [0, 0, 0];
              },
              getRadius: 5,
              getPosition: (f) => {
                return f.geometry.coordinates;
              },
            }),
            new ScatterplotLayer(props, {
              id: `${props.id}-line`,
              data: props.data,
              radiusUnits: "pixels",
              radiusScale: 1,
              stroked: true,
              filled: false,
              lineWidthUnits: "pixels",
              lineWidthMinPixels: 0,
              getLineColor: () => {
                return [0, 0, 0];
              },
              getRadius: 7,
              getLineWidth: 2,
              getPosition: (f) => {
                return f.geometry.coordinates;
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
