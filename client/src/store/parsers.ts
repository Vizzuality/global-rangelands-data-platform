import {
  parseAsArrayOf,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  parseAsJson,
  parseAsBoolean,
} from "nuqs/server";

import { DEFAULT_BBOX } from "@/components/map/constants";

const DEFAULT_DATASETS = [1];
const DEFAULT_LAYERS = [1];

export const datasetsParser = parseAsArrayOf(parseAsInteger).withDefault(DEFAULT_DATASETS);

export const layersParser = parseAsArrayOf(parseAsInteger).withDefault(DEFAULT_LAYERS);
export const layersSettingsParser = parseAsJson<{
  [key: string]: Record<string, unknown>;
}>();

export const bboxParser = parseAsArrayOf(parseAsFloat).withDefault(DEFAULT_BBOX);
//   export const mapSettingsParser =
// parseAsJson<typeof DEFAULT_MAP_SETTINGS>().withDefault(DEFAULT_MAP_SETTINGS);

export const countryParser = parseAsString;
export const countriesComparisonParser = parseAsArrayOf(parseAsString).withDefault([]);

export const projectParser = parseAsInteger;
export const pillarsParser = parseAsArrayOf(parseAsInteger).withDefault([]);
export const availableForFundingParser = parseAsBoolean.withDefault(false);
export const countriesParser = parseAsArrayOf(parseAsString).withDefault([]);
export const publicationStateParser = parseAsString.withDefault("live");
