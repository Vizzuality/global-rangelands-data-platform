import { RadioGroup, RadioGroupIndicator, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { mapStyleOptions } from "../constants";
import { MapStyles } from "../types";

export type MapStyleOptionsProps = {
  onChangeMapStyle: (style: MapStyles) => void;
  defaultValue: MapStyles;
};

const MapStyleControl = ({ onChangeMapStyle, defaultValue }: MapStyleOptionsProps) => {
  return (
    <RadioGroup onValueChange={onChangeMapStyle} defaultValue={defaultValue} className="space-y-2">
      {mapStyleOptions.map((option) => (
        <div key={option.value} className="flex items-center gap-2">
          <RadioGroupItem
            value={option.value}
            id={option.value}
            className="peer flex items-center justify-center border-none"
          >
            <Image src={option.icon} alt={option.label} width={20} height={20} />
            <RadioGroupIndicator asChild>
              <div className="absolute h-[26px] w-[26px] rounded-full border border-global" />
            </RadioGroupIndicator>
          </RadioGroupItem>
          <label
            className="cursor-pointer underline-offset-2 transition-all duration-300 hover:font-medium hover:underline peer-focus-visible:font-medium"
            htmlFor={option.value}
          >
            {option.label}
          </label>
        </div>
      ))}
    </RadioGroup>
  );
};

export default MapStyleControl;
