import { MVTLayer } from "deck.gl";
import { useDeckMapboxOverlayContext } from "../../provider";
import { useEffect, useMemo, useState } from "react";

// Indigenous Peoples' Lands — red/orange family
const IP_DOCUMENTED: [number, number, number, number] = [167, 55, 3, 230]; // #a73703
const IP_NOT_DOCUMENTED: [number, number, number, number] = [173, 89, 41, 255]; // #ad5929
const IP_CUSTOMARY: [number, number, number, number] = [254, 218, 162, 230]; // #fedaa2
const IP_FORMAL_CLAIM: [number, number, number, number] = [229, 129, 62, 230]; // #e5813e

// Local Community Lands — blue family
const LC_DOCUMENTED: [number, number, number, number] = [1, 70, 142, 230]; // #01468e
const LC_NOT_DOCUMENTED: [number, number, number, number] = [64, 148, 219, 230]; // #4094db
const LC_CUSTOMARY: [number, number, number, number] = [194, 228, 255, 230]; // #c2e4ff
const LC_FORMAL_CLAIM: [number, number, number, number] = [94, 182, 254, 230]; // #5eb6fe

// Indicative + fallback
const INDICATIVE: [number, number, number, number] = [157, 157, 156, 230]; // #9d9d9c
const DEFAULT_COLOR: [number, number, number, number] = [157, 157, 156, 200];

// Stroke colors per category
const IP_LINE: [number, number, number, number] = [134, 54, 13, 255]; // #86360d
const LC_LINE: [number, number, number, number] = [1, 40, 116, 255]; // #012874
const INDICATIVE_LINE: [number, number, number, number] = [130, 132, 130, 255]; // #828482

// Toggle to disable hover stroke emphasis (LandMark site has none). Flip to false to match exactly.
const HOVER_ENABLED = true;

export function getLandmarkFillColor(
  props: Record<string, unknown>,
): [number, number, number, number] {
  const layer = props?.layer;
  const formRec = props?.form_rec;
  const docStatus = props?.doc_status;

  if (layer === "Indicative") return INDICATIVE;

  const isIP = layer === "Indigenous Lands";
  const isLC = layer === "Community Lands";
  if (!isIP && !isLC) return DEFAULT_COLOR;

  if (formRec === "Acknowledged by govt") {
    if (docStatus === "Documented") return isIP ? IP_DOCUMENTED : LC_DOCUMENTED;
    if (docStatus === "Not documented") return isIP ? IP_NOT_DOCUMENTED : LC_NOT_DOCUMENTED;
    return isIP ? IP_NOT_DOCUMENTED : LC_NOT_DOCUMENTED;
  }

  if (formRec === "Not acknowledged by govt") {
    if (docStatus === "Held or used under customary tenure")
      return isIP ? IP_CUSTOMARY : LC_CUSTOMARY;
    if (docStatus === "Held or used with formal land claim submitted")
      return isIP ? IP_FORMAL_CLAIM : LC_FORMAL_CLAIM;
    return isIP ? IP_CUSTOMARY : LC_CUSTOMARY;
  }

  // form_rec === "Unknown" or anything else → Indicative grey
  return INDICATIVE;
}

export function getLandmarkLineColor(
  props: Record<string, unknown>,
): [number, number, number, number] {
  const layer = props?.layer;
  if (layer === "Indigenous Lands") return IP_LINE;
  if (layer === "Community Lands") return LC_LINE;
  return INDICATIVE_LINE;
}

export type LandmarkCategory = "Indigenous Lands" | "Community Lands" | "Indicative";

export interface LandmarkLayerComponentProps {
  id: string;
  opacity?: number;
  visibility?: boolean;
  beforeId?: string;
  category?: LandmarkCategory;
}

const TRANSPARENT: [number, number, number, number] = [0, 0, 0, 0];

const matchesCategory = (props: Record<string, unknown> | undefined, category?: LandmarkCategory) =>
  !category || props?.layer === category;

const LandmarkLayerComponent = ({
  id,
  opacity,
  visibility,
  beforeId,
  category,
  ...props
}: LandmarkLayerComponentProps) => {
  const [hoveredFeatureId, setHoveredFeatureId] = useState<string | null>(null);
  const polyId = `${id}-deck-poly`;
  const pointsId = `${id}-deck-points`;
  const { addLayer, removeLayer } = useDeckMapboxOverlayContext();

  const polyConfig = useMemo(
    () =>
      new MVTLayer({
        id: polyId,
        data: "https://tiles.globalforestwatch.org/landmark_ip_lc_and_indicative_poly/latest/default/{z}/{x}/{y}.pbf",
        beforeId,
        opacity: opacity ?? 1,
        visible: visibility ?? true,
        pickable: true,
        getFillColor: (f) => {
          const p = f?.properties as Record<string, unknown>;
          if (!matchesCategory(p, category)) return TRANSPARENT;
          return getLandmarkFillColor(p);
        },
        getLineColor: (f) => {
          const p = f?.properties as Record<string, unknown>;
          if (!matchesCategory(p, category)) return TRANSPARENT;
          return getLandmarkLineColor(p);
        },
        getLineWidth: (f) => {
          const p = f?.properties as Record<string, unknown>;
          if (!matchesCategory(p, category)) return 0;
          if (!HOVER_ENABLED) return 1;
          const fid = `${p?.gfw_geostore_id ?? f?.id}`;
          return fid === hoveredFeatureId ? 2 : 1;
        },
        lineWidthUnits: "pixels",
        lineWidthMinPixels: 0.5,
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
          getLineWidth: [hoveredFeatureId, category],
          getFillColor: [category],
          getLineColor: [category],
        },
        binary: false,
        ...props,
      }),
    [beforeId, category, hoveredFeatureId, polyId, opacity, visibility, props],
  );

  const pointsConfig = useMemo(
    () =>
      new MVTLayer({
        id: pointsId,
        data: "https://tiles.globalforestwatch.org/landmark_ip_lc_and_indicative_points/latest/dynamic/{z}/{x}/{y}.pbf",
        beforeId,
        opacity: opacity ?? 1,
        visible: visibility ?? true,
        pickable: true,
        getFillColor: (f) => {
          const p = f?.properties as Record<string, unknown>;
          if (!matchesCategory(p, category)) return TRANSPARENT;
          return getLandmarkFillColor(p);
        },
        getLineColor: (f) => {
          const p = f?.properties as Record<string, unknown>;
          if (!matchesCategory(p, category)) return TRANSPARENT;
          return [0, 0, 0, 255];
        },
        getLineWidth: (f) => {
          const p = f?.properties as Record<string, unknown>;
          return matchesCategory(p, category) ? 1 : 0;
        },
        lineWidthUnits: "pixels",
        pointType: "circle",
        pointRadiusUnits: "pixels",
        pointRadiusMinPixels: 3,
        getPointRadius: (f) => {
          const p = f?.properties as Record<string, unknown>;
          return matchesCategory(p, category) ? 1 : 0;
        },
        onTileError: () => {},
        updateTriggers: {
          getFillColor: [category],
          getLineColor: [category],
          getLineWidth: [category],
          getPointRadius: [category],
        },
        binary: false,
        ...props,
      }),
    [beforeId, category, pointsId, opacity, visibility, props],
  );

  useEffect(() => {
    if (!polyConfig) return;
    // Give the map a chance to load the background layer before adding the Deck layer.
    // See: https://github.com/visgl/deck.gl/blob/c2ba79b08b0ea807c6779d8fe1aaa307ebc22f91/modules/mapbox/src/resolve-layers.ts#L66
    const t = setTimeout(() => {
      addLayer(polyConfig);
    }, 10);
    return () => clearTimeout(t);
  }, [polyConfig, addLayer]);

  useEffect(() => {
    if (!pointsConfig) return;
    const t = setTimeout(() => {
      addLayer(pointsConfig);
    }, 10);
    return () => clearTimeout(t);
  }, [pointsConfig, addLayer]);

  useEffect(() => {
    return () => {
      removeLayer(polyId);
      removeLayer(pointsId);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

export default LandmarkLayerComponent;
