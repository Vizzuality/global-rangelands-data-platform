import CircleLegend from "@/components/circle-legend";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import ColorSwatchIcon from "@/svgs/color-swatch.svg";
import { PropsWithChildren } from "react";

export type LayerSelectorItemProps = {
  value: string;
  label: string;
  colors: string[];
};
export const LayerSelectorItem = ({ value, label, colors }: LayerSelectorItemProps) => {
  return (
    <SelectItem className="flex w-full justify-between" value={value} key={value}>
      <p>{label}</p> <CircleLegend colors={colors} />
    </SelectItem>
  );
};

export type LayerSelectorProps = PropsWithChildren & {
  handleSelect: (value: string) => void;
  datas;
};
const LayerSelector = ({ handleSelect, layer }: SelectorProps) => {
  return (
    <Select onValueChange={handleSelect}>
      <SelectTrigger className="flex justify-between">
        <div className="flex items-center gap-2">
          <ColorSwatchIcon />
          {attributes?.type}
        </div>
        <CircleLegend colors={selectedLayerColor} />
      </SelectTrigger>
      <SelectContent>
        {attributes?.layers?.map((layer, index) => {
          if (!layer.id || !layer.name) return null;
          return (
            <SelectItem
              className="flex w-full justify-between"
              value={layer.id.toString()}
              key={layer.id}
            >
              <p>{layer.name}</p> <CircleLegend colors={layerColors[index].colors} />
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default LayerSelector;
