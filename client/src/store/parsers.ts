import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  parseAsJson,
  parseAsBoolean,
  parseAsStringLiteral,
} from "nuqs/server";

import { MAPBOX_STYLE } from "@/components/map/constants";
import { getKeys } from "@/lib/utils";

const DEFAULT_DATASETS = ["rangeland-systems"];
const DEFAULT_LAYERS = ["rangeland-system"];

export const datasetsParser = parseAsArrayOf(parseAsString).withDefault(DEFAULT_DATASETS);

export const layersParser = parseAsArrayOf(parseAsString).withDefault(DEFAULT_LAYERS);
export const layersSettingsParser = parseAsJson<{
  [key: string]: Record<string, unknown>;
}>();
export const rangelandsTypeParser = parseAsString.withDefault(DEFAULT_LAYERS[0]);
export const rangelandRegionsParser = parseAsArrayOf(parseAsString).withDefault([]);

export const mapStyleParser = parseAsStringLiteral(getKeys(MAPBOX_STYLE)).withDefault("light");
export const countryParser = parseAsString;
export const countriesComparisonParser = parseAsArrayOf(parseAsString).withDefault([]);

export const projectParser = parseAsInteger;
export const pillarsParser = parseAsArrayOf(parseAsInteger).withDefault([]);
export const availableForFundingParser = parseAsBoolean.withDefault(false);
export const countriesParser = parseAsArrayOf(parseAsString).withDefault([]);
export const publicationStateParser = parseAsString.withDefault("live");
export const categoryParser = parseAsString;
