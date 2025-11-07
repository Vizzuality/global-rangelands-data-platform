import { IconLayer, ScatterplotLayer } from "@deck.gl/layers";
import { useDeckMapboxOverlayContext } from "../../provider";
import { useEffect, useMemo, useState } from "react";
import { MVTLayer } from "deck.gl";

import { Feature, Geometry } from "@turf/helpers";
import { useAtomValue } from "jotai";
import { deckLayersInteractiveAtom } from "@/store/map";

import RBush from "rbush";
import useMapZoom from "@/hooks/use-map-zoom";

export interface PastoralistLayerComponentProps {
  id: string;
  data: string;
  opacity?: number;
  visibility?: boolean;
  colorProperty: string;
  lineWidth?: number;
  beforeId?: string;
}

const VARIANT_PROPERTY = "variantname";
const OVERLAPPING_RADIUS = 0.025;
const ICON_RADIUS_BASE = 8;

const getIconSize = (zoom: number) => Math.min(Math.max(20, zoom * ICON_RADIUS_BASE), 80);

const getId = (f: Feature) => `${f?.properties?.name}-${f?.id}`;

function filterOverlappingIcons(data: Feature<Geometry>[], iconSize: number) {
  try {
    const tree = new RBush();
    const nonOverlappingData: Feature[] = [];

    if (!data) return [];

    data?.forEach((feature) => {
      const point =
        feature.geometry && "coordinates" in feature.geometry && feature.geometry.coordinates;

      if (!point) return;
      const [x, y] = (point as [number, number]) || [0, 0];
      const bbox = {
        minX: x - iconSize / 2,
        minY: y - iconSize / 2,
        maxX: x + iconSize / 2,
        maxY: y + iconSize / 2,
        id: getId(feature),
      };

      // Check for collisions
      const collisions = tree.search(bbox);
      const collisionIds = collisions.map((c) => (c as typeof bbox)?.id);

      if (
        collisions.length === 0 ||
        !nonOverlappingData.some((f) => collisionIds.includes(getId(f)))
      ) {
        nonOverlappingData.push(feature);
        tree.insert(bbox);
      }
    });

    return nonOverlappingData;
  } catch (error) {
    console.error("Error filtering overlapping icons", error);
    return data;
  }
}

const PastoralistLayerComponent = ({
  id,
  data,
  opacity,
  visibility,
  beforeId,
  ...props
}: PastoralistLayerComponentProps) => {
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);
  const i = `${id}-deck`;
  const { addLayer, removeLayer } = useDeckMapboxOverlayContext();
  const interactiveLayers = useAtomValue(deckLayersInteractiveAtom);

  const zoom = useMapZoom();

  useMemo(() => {
    const pastoralistInteractiveLayer = interactiveLayers["pastoralists"];
    if (!pastoralistInteractiveLayer) {
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
          const data = filterOverlappingIcons(
            props.data as unknown as Feature<Geometry>[],
            OVERLAPPING_RADIUS * (1 + zoom / 10), // Adjust radius based on zoom level
          );

          return [
            new IconLayer(props, {
              // @ts-expect-error: data is a valid IconLayer data prop
              data: data,
              id: `${props.id}-icon`,
              pickable: true,
              getIcon: (f) => {
                const iconPath = `/images/pastoralist-icons/${f?.properties?.[VARIANT_PROPERTY]}.png`;
                return {
                  url: iconPath,
                  height: 40,
                  width: 40,
                  mask: false,
                };
              },
              getPosition: (f) => {
                return f.geometry.coordinates;
              },
              getSize: () => {
                return getIconSize(zoom);
              }, // Scale icon size based on zoom level
              updateTriggers: {
                getSize: [zoom],
              },
            }),
            new ScatterplotLayer(props, {
              id: `${props.id}-line`,
              radiusUnits: "pixels",
              radiusScale: 1,
              stroked: true,
              filled: false,
              lineWidthUnits: "pixels",
              lineWidthMinPixels: 0,
              getLineColor: () => {
                return [255, 255, 255];
              },
              getRadius: (f) => {
                if (getId(f) === hoveredProperty) {
                  return getIconSize(zoom);
                }
                return 0;
              },
              getLineWidth: (f) => {
                if (getId(f) === hoveredProperty) {
                  return 2;
                }
                return 0;
              },
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

export default PastoralistLayerComponent;
