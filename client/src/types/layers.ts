import { AnyLayer, AnySource } from "react-map-gl";

import { FormatProps } from "@/lib/json-converter/utils/formats";

// import type { Layer } from "@/types/generated/strapi.schemas";

export type Config = {
  source?: AnySource;
  styles?: AnyLayer[];
};

export type ParamsConfigValue = {
  key: string;
  default: unknown;
};

export type ParamsConfig = ParamsConfigValue[];

export type LegendConfig = {
  type: "basic" | "gradient" | "choropleth";
  items: {
    value: string;
    color: string;
  }[];
};

export type InteractionConfig = {
  event: "click" | "hover";
  type: string;
  values: {
    key: string;
    value: string;
    format?: FormatProps;
  }[];
};

export type LayerProps = {
  slug?: string;
  id?: string;
  zIndex?: number;
  onAdd?: (props: Config) => void;
  onRemove?: (props: Config) => void;
};

export type LayerTyped = {
  id: number;
  type: string;
  config: Config;
  params_config: ParamsConfig;
  legend_config: LegendConfig;
  interaction_config: InteractionConfig;
  metadata: Record<string, unknown>;
};
