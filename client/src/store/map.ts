import { atom } from "jotai";
import { createSerializer, useQueryState } from "nuqs";

import { bboxParser, datasetsParser, layersParser, layersSettingsParser } from "./parsers";

export const useSyncDatasets = () => {
  return useQueryState("datasets", datasetsParser);
};

export const useSyncLayers = () => {
  return useQueryState("layers", layersParser);
};

export const useSyncLayersSettings = () => {
  return useQueryState("layers-settings", layersSettingsParser);
};

export const useSyncBbox = () => {
  return useQueryState("bbox", bboxParser);
};

const searchParams = {
  bbox: bboxParser,
  datasets: datasetsParser,
  layers: layersParser,
  layersSettings: layersSettingsParser,
};

const serialize = createSerializer(searchParams);

export const useSyncSearchParams = () => {
  const [bbox] = useSyncBbox();
  const [datasets] = useSyncDatasets();
  const [layers] = useSyncLayers();
  const [layersSettings] = useSyncLayersSettings();

  return serialize({ datasets, layers, layersSettings, bbox });
};

export const layersInteractiveAtom = atom<(number | string)[]>([]);
export const layersInteractiveIdsAtom = atom<(number | string)[]>([]);
