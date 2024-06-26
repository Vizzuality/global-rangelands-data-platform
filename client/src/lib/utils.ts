import { DefaultLayerComponentLayerDataAttributes } from "@/types/generated/strapi.schemas";
import { ParamsConfig } from "@/types/layers";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getKeys = Object.keys as <T extends object>(obj: T) => Array<keyof T>;

export const getLayerSettings = (
  datasetLayer?: DefaultLayerComponentLayerDataAttributes,
  layersSettings?: {
    [key: string]: Record<string, unknown>;
  } | null,
) => {
  const layerSettings = (!!datasetLayer?.slug && layersSettings?.[datasetLayer?.slug]) || {};

  const params =
    (datasetLayer?.params_config as ParamsConfig)?.reduce((acc, curr) => {
      return {
        ...acc,
        [curr.key]: curr.default,
      };
    }, {}) || {};

  const currSettings = Object.assign({}, params, layerSettings);
  return {
    visibility: (currSettings.visibility as boolean) ?? true,
    opacity: (currSettings.opacity as number) ?? 1,
  };
};
