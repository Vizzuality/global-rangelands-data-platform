import { LegendConfig } from "@/types/layers";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getColorFromConfig = (config: { type: LegendConfig['type'], values: string[] | Record<string, string>, defaultColor?: string }) => {
  if (!config) return [];
  const { values, defaultColor, type } = config;

  if (type === 'choropleth') {
    if (Array.isArray(values) && values?.length) {
      return values.reduce<string[]>((acc, value, index) => {
        if (index % 2 !== 0) {
          return [...acc, value];
        }
        return acc;
      }, [])
    }
    return Object.values(values);
  }
  return [defaultColor || '#EB8731']
}
