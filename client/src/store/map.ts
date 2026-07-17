import { atom } from "jotai";
import { createSerializer, useQueryState } from "nuqs";

import {
  categoryParser,
  datasetsParser,
  layersParser,
  layersSettingsParser,
  mapStyleParser,
  rangelandRegionsParser,
  rangelandsTypeParser,
} from "./parsers";
import { PickingInfo } from "deck.gl";
import Supercluster from "supercluster";

export const useSyncDatasets = () => {
  return useQueryState("datasets", datasetsParser);
};

export const useSyncLayers = () => {
  return useQueryState("layers", layersParser);
};

export const useSyncLayersSettings = () => {
  return useQueryState("layers-settings", layersSettingsParser);
};

export const useSyncMapStyle = () => {
  return useQueryState("map-style", mapStyleParser);
};

export const useSyncRangelandType = () => {
  return useQueryState("rangeland-type", rangelandsTypeParser);
};

export const useSyncRangelandRegions = () => {
  return useQueryState("rangeland-regions", rangelandRegionsParser);
};

export const useSyncCategory = () => {
  return useQueryState("category", categoryParser);
};

const searchParams = {
  category: categoryParser,
  datasets: datasetsParser,
  layers: layersParser,
  layersSettings: layersSettingsParser,
  mapStyle: mapStyleParser,
  rangelangType: rangelandsTypeParser,
  rangelandRegion: rangelandRegionsParser,
};

const serialize = createSerializer(searchParams);

export const useSyncSearchParams = () => {
  const [category] = useSyncCategory();
  const [datasets] = useSyncDatasets();
  const [layers] = useSyncLayers();
  const [layersSettings] = useSyncLayersSettings();
  const [mapStyle] = useSyncMapStyle();
  const [rangelangType] = useSyncRangelandType();
  const [rangelandRegion] = useSyncRangelandRegions();

  return serialize({
    category,
    datasets,
    layers,
    layersSettings,
    mapStyle,
    rangelandRegion,
    rangelangType,
  });
};

export const sidebarOpenAtom = atom(true);
export const layersInteractiveAtom = atom<(number | string)[]>([]);
export const deckLayersInteractiveAtom = atom<Record<string, PickingInfo>>({});
export const clusterFeaturesAtom = atom<Supercluster.PointFeature<Supercluster.AnyProps>[]>([]);

export type LandmarkCandidate = {
  properties: Record<string, unknown>;
  id?: string | number;
};
export const landmarkCandidatesAtom = atom<LandmarkCandidate[]>([]);
export const landmarkActiveFidAtom = atom<string | null>(null);
export const layersInteractiveIdsAtom = atom<(number | string)[]>([]);
