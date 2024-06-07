import {
  parseAsArrayOf,
  parseAsFloat,
  parseAsInteger,
  parseAsString,
  parseAsJson,
  parseAsBoolean,
} from "nuqs/server";

import { DEFAULT_BBOX } from "@/components/map/constants";

const DEFAULT_DATASETS = ["rangeland-systems"];
const DEFAULT_LAYERS = ["rangeland-system"];

export const datasetsParser = parseAsArrayOf(parseAsString).withDefault(DEFAULT_DATASETS);

export const layersParser = parseAsArrayOf(parseAsString).withDefault(DEFAULT_LAYERS);
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
