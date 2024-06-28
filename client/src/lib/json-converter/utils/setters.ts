import { RANGELAND_SISTEM_COLOR } from "@/containers/datasets/constants";
import { env } from "@/env.mjs";
import { LegendConfig } from "@/types/layers";
import Color from "color";
import { Feature, Geometry } from "geojson";
/**
 * *`setOpacity`*
 * Set opacity
 * @param {Number} o
 * @param {Number} base
 * @returns {Number} opacity
 */
type SetOpacityProps = { o: number; base: number };
export const setOpacity = ({ o = 1, base = 1 }: SetOpacityProps) => {
  return o * base;
};

/**
 * *`setVisibility`*
 * Set visibility
 * @param {Boolean} v
 * @param {String} type
 * @returns {String | Boolean} visibility
 */
type SetVisibilityProps = { v: boolean; type: "mapbox" | "deck" };
export const setVisibility = ({ v = true, type = "mapbox" }: SetVisibilityProps) => {
  if (type === "mapbox") {
    return v ? "visible" : "none";
  }

  return v;
};

type SetColorsReturn = Uint8Array & number[];

type SetColorProps = {
  colors_config: {
    type?: LegendConfig["type"];
    property?: string;
    values?: Record<string, string | number[]> | string[];
    defaultColor?: string | number[];
  };
};

/** Set color from a property or default color */
export const setColor = ({ colors_config }: SetColorProps) => {
  const { defaultColor, property, type, values } = colors_config || {};
  if (type === "choropleth" && property && values) {
    let colorValues = values;
    if (Array.isArray(values)) {
      colorValues = values.reduce<Record<string, string | number[]>>((acc, value, index) => {
        if (index % 2 === 0) {
          acc[value] = values[index + 1];
        }
        return acc;
      }, {});
    }
    return (f: Feature<Geometry>) => {
      return Color(
        (colorValues as Record<string, string | number[]>)[f.properties?.[property]] ||
          defaultColor,
      )
        .rgb()
        .array() as SetColorsReturn;
    };
  }
  return Color(defaultColor).rgb().array() as SetColorsReturn;
};

const _setDataUrlAsStringArray = (dataUrls: string[] | string) => {
  if (!Array.isArray(dataUrls) && typeof dataUrls === "string") {
    return [dataUrls];
  }
  return dataUrls;
};

type SetDataWithMapboxTokenProps = {
  dataUrls: string[] | string;
};
const setDataWithMapboxToken = ({ dataUrls }: SetDataWithMapboxTokenProps) => {
  return _setDataUrlAsStringArray(dataUrls).map((url) =>
    url.concat(`?access_token=${env.NEXT_PUBLIC_MAPBOX_TOKEN}`),
  );
};

type SetRasterTilesProps = {
  src: string;
  searchparams?: Record<string, string | number>;
};
const setRasterTiles = ({ src, searchparams = {} }: SetRasterTilesProps) => {
  const searchParams = new URLSearchParams();
  Object.entries(searchparams).forEach(([key, value]) => {
    searchParams.append(key, value as string);
  });

  return `${src}?${searchParams.toString()}`;
};

type SetTimeChangeRasterTilesProps = {
  src: string;
  searchparams?: Record<string, string | number>;
  tilesetSingle?: string;
  tilesetChange?: string;
};
const setTimeChangeRasterTiles = ({
  src,
  searchparams = {},
  tilesetChange = "",
  tilesetSingle = "",
}: SetTimeChangeRasterTilesProps) => {
  const searchParams = new URLSearchParams();
  Object.entries(searchparams).forEach(([key, value]) => {
    if (value) {
      searchParams.append(key, value as string);
    }
  });
  searchParams.append("tileset", searchparams.endYear ? tilesetChange : tilesetSingle);

  return `${src}?${searchParams.toString()}`;
};

type SetRangelandsColorProps = {
  colors: Record<string, string | number[]>;
  property: string;
};
export const setRangelandsColor = ({ colors, property }: SetRangelandsColorProps) => {
  return (f: Feature<Geometry>) => {
    const color = colors[f.properties?.[property]];
    if (color) {
      return Color(color || "#000000")
        .rgb()
        .array() as SetColorsReturn;
    }
    return Color(RANGELAND_SISTEM_COLOR).rgb().array() as SetColorsReturn;
  };
};

type SetFilterCategoriesProps = {
  categories: Record<string, string>;
};
const setFilterCategories = ({ categories }: SetFilterCategoriesProps) => {
  return !!categories && typeof categories === "object" ? Object.keys(categories) : [];
};

const SETTERS = {
  setOpacity,
  setVisibility,
  setColor,
  setDataWithMapboxToken,
  setRasterTiles,
  setTimeChangeRasterTiles,
  setRangelandsColor,
  setFilterCategories,
} as const;

export default SETTERS;
