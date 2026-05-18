import { MVTLayer } from "deck.gl";
import { useDeckMapboxOverlayContext } from "../../provider";
import { useEffect, useMemo, useState } from "react";

// Category values as confirmed from live GFW tile data (GET on dynamic/{z}/{x}/{y}.pbf).
// Update here if WRI changes the enum in a future dataset version.
export const LANDMARK_CATEGORY_VALUES = ["Indigenous", "Community", "Indicative"] as const;
export type LandmarkCategory = (typeof LANDMARK_CATEGORY_VALUES)[number];

// Color map: LandMark blue family, distinguishable at low zoom, WCAG 3:1 on light basemap.
// Source: https://landmarkmap.org official legend palette adapted to 3-category model.
const CATEGORY_COLOR_MAP: Record<LandmarkCategory, [number, number, number, number]> = {
  Indigenous: [0, 71, 142, 220], // #00478E — documented/acknowledged dark blue
  Community: [64, 149, 218, 220], // #4095DA — medium blue
  Indicative: [194, 228, 255, 180], // #C2E4FF — light blue (lower alpha for subtle polygons)
};

const DEFAULT_COLOR: [number, number, number, number] = [120, 120, 120, 180];

export function getLandmarkFillColor(
  category: string | undefined,
): [number, number, number, number] {
  if (!category) return DEFAULT_COLOR;

  if (CATEGORY_COLOR_MAP[category as LandmarkCategory]) {
    return CATEGORY_COLOR_MAP[category as LandmarkCategory];
  }

  // Collapse 5-value LandMark typology if encountered in the future
  if (category.startsWith("IP")) return CATEGORY_COLOR_MAP["Indigenous"];
  if (category.startsWith("CL")) return CATEGORY_COLOR_MAP["Community"];

  if (process.env.NODE_ENV === "development") {
    console.warn(`[LandmarkComponent] Unknown category value: "${category}"`);
  }
  return DEFAULT_COLOR;
}

export interface LandmarkLayerComponentProps {
  id: string;
  data: string;
  opacity?: number;
  visibility?: boolean;
  beforeId?: string;
}

const LandmarkLayerComponent = ({
  id,
  data,
  opacity,
  visibility,
  beforeId,
  ...props
}: LandmarkLayerComponentProps) => {
  const [hoveredFeatureId, setHoveredFeatureId] = useState<string | null>(null);
  const i = `${id}-deck`;
  const { addLayer, removeLayer } = useDeckMapboxOverlayContext();

  const config = useMemo(
    () =>
      new MVTLayer({
        id: i,
        data,
        beforeId,
        opacity: opacity ?? 1,
        visible: visibility ?? true,
        pickable: true,
        getFillColor: (f) => getLandmarkFillColor(f?.properties?.category as string | undefined),
        getLineColor: [255, 255, 255, 160],
        getLineWidth: (f) => {
          const fid = `${f?.properties?.gfw_geostore_id ?? f?.id}`;
          return fid === hoveredFeatureId ? 1 : 0;
        },
        lineWidthUnits: "pixels",
        onHover: (info) => {
          if (!info?.object) {
            setHoveredFeatureId(null);
            return;
          }
          const fid = `${info.object.properties?.gfw_geostore_id ?? info.object.id}`;
          setHoveredFeatureId(fid);
        },
        onTileError: () => {},
        updateTriggers: {
          getLineWidth: [hoveredFeatureId],
          getFillColor: [],
        },
        binary: false,
        ...props,
      }),
    [beforeId, data, hoveredFeatureId, i, opacity, visibility, props],
  );

  useEffect(() => {
    if (!config) return;
    // Give the map a chance to load the background layer before adding the Deck layer.
    // See: https://github.com/visgl/deck.gl/blob/c2ba79b08b0ea807c6779d8fe1aaa307ebc22f91/modules/mapbox/src/resolve-layers.ts#L66
    setTimeout(() => {
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

export default LandmarkLayerComponent;
