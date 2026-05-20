import { MVTLayer } from "deck.gl";
import { useDeckMapboxOverlayContext } from "../../provider";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { landmarkActiveFidAtom, landmarkCandidatesAtom, type LandmarkCandidate } from "@/store/map";
import type { PickingInfo } from "deck.gl";

type DeckPicker = {
  pickMultipleObjects: (params: {
    x: number;
    y: number;
    radius?: number;
    depth?: number;
    layerIds?: string[];
  }) => Array<{ object?: { properties?: Record<string, unknown>; id?: string | number } }>;
};

const getDeckPicker = (info: PickingInfo): DeckPicker | undefined => {
  const layer = info?.layer as unknown as { context?: { deck?: DeckPicker } } | null;
  return layer?.context?.deck;
};

const getFeatureFid = (obj: { properties?: Record<string, unknown>; id?: string | number }) =>
  `${obj.properties?.gfw_geostore_id ?? obj.id ?? ""}`;

const IP_DOCUMENTED: [number, number, number, number] = [167, 55, 3, 230];
const IP_NOT_DOCUMENTED: [number, number, number, number] = [173, 89, 41, 255];
const IP_CUSTOMARY: [number, number, number, number] = [254, 218, 162, 230];
const IP_FORMAL_CLAIM: [number, number, number, number] = [229, 129, 62, 230];

const LC_DOCUMENTED: [number, number, number, number] = [1, 70, 142, 230];
const LC_NOT_DOCUMENTED: [number, number, number, number] = [64, 148, 219, 230];
const LC_CUSTOMARY: [number, number, number, number] = [194, 228, 255, 230];
const LC_FORMAL_CLAIM: [number, number, number, number] = [94, 182, 254, 230];

const INDICATIVE: [number, number, number, number] = [157, 157, 156, 230];
const DEFAULT_COLOR: [number, number, number, number] = [157, 157, 156, 200];

const IP_LINE: [number, number, number, number] = [134, 54, 13, 255];
const LC_LINE: [number, number, number, number] = [1, 40, 116, 255];
const INDICATIVE_LINE: [number, number, number, number] = [130, 132, 130, 255];

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

const isEmphasized = (fid: string, hovered: string | null, selected: string | null) =>
  fid === hovered || fid === selected;

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
  const setCandidates = useSetAtom(landmarkCandidatesAtom);
  const setLandmarkActiveFid = useSetAtom(landmarkActiveFidAtom);
  const selectedFeatureId = useAtomValue(landmarkActiveFidAtom);

  const handlePick = useCallback(
    (info: PickingInfo) => {
      const deck = getDeckPicker(info);
      if (!deck || info?.x == null || info?.y == null) return;
      const picks = deck.pickMultipleObjects({
        x: info.x,
        y: info.y,
        radius: 1,
        layerIds: [polyId, pointsId],
      });
      const seen = new Set<string>();
      const uniqueObjects: LandmarkCandidate[] = [];
      for (const p of picks) {
        const obj = p?.object;
        if (!obj?.properties) continue;
        const fid = getFeatureFid(obj);
        if (!fid || seen.has(fid)) continue;
        seen.add(fid);
        uniqueObjects.push({ properties: obj.properties, id: obj.id });
      }
      if (uniqueObjects.length === 0) return;
      if (uniqueObjects.length === 1) {
        setCandidates([]);
        setLandmarkActiveFid(getFeatureFid(uniqueObjects[0]));
      } else {
        setCandidates(uniqueObjects);
        setLandmarkActiveFid(null);
      }
    },
    [polyId, pointsId, setCandidates, setLandmarkActiveFid],
  );

  const polyConfig = useMemo(
    () =>
      new MVTLayer({
        id: polyId,
        data: "https://tiles.globalforestwatch.org/landmark_ip_lc_and_indicative_poly/latest/default/{z}/{x}/{y}.pbf",
        beforeId,
        minZoom: 0,
        maxZoom: 10,
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
          return isEmphasized(fid, hoveredFeatureId, selectedFeatureId) ? 2 : 1;
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
        onClick: handlePick,
        onTileError: () => {},
        updateTriggers: {
          getLineWidth: [hoveredFeatureId, selectedFeatureId, category],
          getFillColor: [category],
          getLineColor: [category],
        },
        binary: false,
        ...props,
      }),
    [
      beforeId,
      category,
      hoveredFeatureId,
      selectedFeatureId,
      polyId,
      opacity,
      visibility,
      props,
      handlePick,
    ],
  );

  const pointsConfig = useMemo(
    () =>
      new MVTLayer({
        id: pointsId,
        data: "https://tiles.globalforestwatch.org/landmark_ip_lc_and_indicative_points/latest/dynamic/{z}/{x}/{y}.pbf",
        beforeId,
        minZoom: 0,
        maxZoom: 14,
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
          if (!matchesCategory(p, category)) return 0;
          const fid = `${p?.gfw_geostore_id ?? f?.id}`;
          return isEmphasized(fid, hoveredFeatureId, selectedFeatureId) ? 2 : 1;
        },
        lineWidthUnits: "pixels",
        pointType: "circle",
        pointRadiusUnits: "pixels",
        pointRadiusMinPixels: 3,
        getPointRadius: (f) => {
          const p = f?.properties as Record<string, unknown>;
          return matchesCategory(p, category) ? 1 : 0;
        },
        onHover: (info) => {
          if (!info?.object) {
            setHoveredFeatureId(null);
            return;
          }
          const fid = `${info.object.properties?.gfw_geostore_id ?? info.object.id}`;
          setHoveredFeatureId(fid);
        },
        onClick: handlePick,
        onTileError: () => {},
        updateTriggers: {
          getFillColor: [category],
          getLineColor: [category],
          getLineWidth: [category, hoveredFeatureId, selectedFeatureId],
          getPointRadius: [category],
        },
        binary: false,
        ...props,
      }),
    [
      beforeId,
      category,
      hoveredFeatureId,
      selectedFeatureId,
      pointsId,
      opacity,
      visibility,
      props,
      handlePick,
    ],
  );

  useEffect(() => {
    if (!polyConfig) return;
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
