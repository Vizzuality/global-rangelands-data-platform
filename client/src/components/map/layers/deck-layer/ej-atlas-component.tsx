import { ScatterplotLayer, TextLayer } from "@deck.gl/layers";
import { useDeckMapboxOverlayContext } from "../../provider";
import { useEffect, useMemo, useState } from "react";
import { TileLayer } from "deck.gl";
import { MVTLoader } from "@loaders.gl/mvt";
import { load } from "@loaders.gl/core";

import { useAtomValue, useSetAtom } from "jotai";
import { clusterFeaturesAtom, deckLayersInteractiveAtom } from "@/store/map";

import useMapZoom from "@/hooks/use-map-zoom";
import Supercluster from "supercluster";

type Coordinates = [number, number] | [number, number, number];
interface FeatureWithProps {
  geometry: { coordinates: Coordinates };
  properties: {
    cluster?: boolean;
    cluster_id?: number;
    point_count?: number;
    First_level_category?: string;
    Conflict_intensity_cual?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

const fillColorMap: Record<string, [number, number, number, number]> = {
  "Fossil Fuels and Climate Justice/Energy": [26, 33, 162, 255],
  "Biomass and land conflicts (Forests, agriculture, fisheries and livestock management)": [
    147, 81, 26, 255,
  ],
  "Biodiversity conservation conflicts": [99, 182, 103, 255],
  "Water Management": [36, 117, 204, 255],
  "Tourism Recreation": [142, 64, 191, 255],
  "Infrastructure and built environment": [132, 222, 225, 255],
  "Waste Management": [82, 128, 85, 255],
  "Industrial and utilities conflicts": [233, 67, 12, 255],
  "Mineral Ores and Building Materials Extraction": [239, 159, 159, 255],
  Nuclear: [224, 200, 41, 255],
  Other: [102, 102, 102, 255],
};

const lineColorMap: Record<string, [number, number, number, number]> = {
  KNOWN: [0, 0, 0, 255],
  LATENT: [49, 181, 246, 255],
  LOW: [225, 192, 71, 255],
  MEDIUM: [218, 62, 62, 255],
  HIGH: [105, 7, 7, 255],
};

export interface EjAtlasLayerComponentProps {
  id: string;
  data: string;
  opacity?: number;
  visibility?: boolean;
  colorProperty: string;
  lineWidth?: number;
  beforeId?: string;
}

const EjAtlasLayerComponent = ({
  id,
  data,
  opacity,
  visibility,
  ...props
}: EjAtlasLayerComponentProps) => {
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);
  const [superclusterInstances, setSuperclusterInstances] = useState<Map<string, Supercluster>>(
    new Map(),
  );
  const i = `${id}-deck`;
  const { addLayer, removeLayer } = useDeckMapboxOverlayContext();
  const interactiveLayers = useAtomValue(deckLayersInteractiveAtom);
  const setClusterFeatures = useSetAtom(clusterFeaturesAtom);

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
        beforeId: undefined,
        opacity,
        visible: visibility,
        pickable: true,
        getTileData: async (tileProps) => {
          const loaderOptions = {
            mvt: {
              coordinates: "wgs84",
              tileIndex: {
                x: tileProps.index.x,
                y: tileProps.index.y,
                z: tileProps.index.z,
              },
            },
          };

          if (!tileProps.url) return [];

          return load(tileProps.url, MVTLoader, loaderOptions).then((data) => {
            // Create a unique key for this tile
            const tileKey = `${tileProps.index.z}-${tileProps.index.x}-${tileProps.index.y}`;

            // Create a new Supercluster instance for this tile
            const tileSupercluster = new Supercluster({ radius: 1, maxZoom: 20 });
            const bboxAny = tileProps.bbox as Record<string, number>;
            const west = "west" in bboxAny ? bboxAny.west : bboxAny.left;
            const south = "south" in bboxAny ? bboxAny.south : bboxAny.bottom;
            const east = "east" in bboxAny ? bboxAny.east : bboxAny.right;
            const north = "north" in bboxAny ? bboxAny.north : bboxAny.top;

            const clusters = tileSupercluster
              .load(data)
              .getClusters([west, south, east, north], tileProps.index.z);

            // Store the supercluster instance
            setSuperclusterInstances((prev) => {
              const newMap = new Map(prev);
              newMap.set(tileKey, tileSupercluster);
              return newMap;
            });

            // Attach tile key to each cluster/point for later reference
            return clusters.map((c) => ({
              ...c,
              _tileKey: tileKey,
            }));
          });
        },
        onClick: (info) => {
          if (!info?.object) return;

          // Check if clicked object is a cluster
          if (info.object.properties.cluster) {
            const tileKey = info.object._tileKey;
            const clusterId = info.object.properties.cluster_id;

            // Get the supercluster instance for this tile
            const tileSupercluster = superclusterInstances.get(tileKey);

            if (tileSupercluster) {
              setClusterFeatures(tileSupercluster.getLeaves(clusterId, Infinity));
            }
          }
        },
        onTileError: () => {},
        updateTriggers: {
          getLineWidth: [hoveredProperty],
          getRadius: [hoveredProperty, zoom],
        },
        binary: false,
        renderSubLayers: (props) => {
          if (!props.data || !props.tile) return null;

          const typedData = props.data as FeatureWithProps[];
          const individualPoints = typedData.filter((d: FeatureWithProps) => !d.properties.cluster);
          const clusterPoints = typedData.filter((d: FeatureWithProps) => d.properties.cluster);

          return [
            // Individual points - filled (rendered first, at bottom)
            new ScatterplotLayer(props, {
              id: `${props.id}-individual-filled`,
              data: individualPoints,
              radiusUnits: "pixels",
              radiusScale: 1,
              stroked: false,
              filled: true,
              lineWidthUnits: "pixels",
              lineWidthMinPixels: 0,
              getFillColor: (d) => {
                return fillColorMap[d.properties.First_level_category] ?? [102, 102, 102, 255];
              },
              getRadius: 5,
              getPosition: (f) => f.geometry.coordinates,
            }),
            // Individual points - stroked
            new ScatterplotLayer(props, {
              id: `${props.id}-individual-line`,
              data: individualPoints,
              radiusUnits: "pixels",
              radiusScale: 1,
              stroked: true,
              filled: false,
              lineWidthUnits: "pixels",
              lineWidthMinPixels: 0,
              getLineColor: (d) => {
                return lineColorMap[d.properties.Conflict_intensity_cual] ?? [0, 0, 0, 255];
              },
              getRadius: 8,
              getLineWidth: 2,
              getPosition: (f) => f.geometry.coordinates,
            }),
            // Cluster points - filled (rendered after individual points)
            new ScatterplotLayer(props, {
              id: `${props.id}-cluster-filled`,
              data: clusterPoints,
              radiusUnits: "pixels",
              radiusScale: 1,
              stroked: false,
              filled: true,
              lineWidthUnits: "pixels",
              lineWidthMinPixels: 0,
              getFillColor: [64, 133, 64, 255],
              getRadius: 12,
              getPosition: (f) => f.geometry.coordinates,
            }),
            // Cluster text (rendered last, on top of everything)
            new TextLayer(props, {
              id: `${props.id}-cluster-text`,
              data: clusterPoints,
              getPosition: (f) => f.geometry.coordinates,
              getText: (d) => String(d.properties.point_count),
              getColor: [255, 255, 255, 255],
              getSize: 12,
              getAlignmentBaseline: "center",
              getTextAnchor: "middle",
              fontFamily: "Arial, sans-serif",
              fontWeight: "normal",
            }),
          ];
        },
        ...props,
      }),

    [
      data,
      hoveredProperty,
      i,
      setClusterFeatures,
      superclusterInstances,
      opacity,
      visibility,
      props,
      zoom,
    ],
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
