import { RadioGroup, RadioGroupIndicator, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { mapStyleOptions } from "../../components/map/constants";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";
import GlobeSvg from "@/svgs/globe.svg";
import { useSyncMapStyle } from "@/store/map";
import { MapStylesIds } from "@/components/map/types";

const MapStyle = () => {
  const [mapStyle, setMapStyle] = useSyncMapStyle();

  return (
    <Popover>
      <PopoverTrigger className="group flex items-center gap-2 rounded-[20px] border-2 border-orange-100/0 px-2.5 py-1.5 text-sm transition-colors duration-300 hover:border-background hover:bg-background focus-visible:border-2 focus-visible:border-orange-100 focus-visible:bg-background focus-visible:outline-0 data-[state=open]:rounded-b-none data-[state=open]:bg-background">
        <div className="relative flex h-[26px] w-[26px] items-center justify-center">
          <GlobeSvg className="fill-globe" />
        </div>
        Map style
        <ChevronDown className="w-5 group-data-[state=open]:rotate-180" />
      </PopoverTrigger>

      <PopoverContent
        alignOffset={0}
        sideOffset={0}
        className="relative w-[--radix-popover-trigger-width] rounded-b-[20px] rounded-t-none border-none bg-background px-3 pb-3 pt-2 text-sm"
      >
        <RadioGroup onValueChange={(v) => setMapStyle(v as MapStylesIds)} value={mapStyle}>
          {mapStyleOptions.map((option) => (
            <div key={option.value} className="flex items-center justify-start gap-2">
              <RadioGroupItem
                value={option.value}
                id={option.value}
                className="peer flex w-auto items-center justify-start border-none"
              >
                <div className="relative flex h-6 w-6 items-center justify-center">
                  <Image src={option.icon} alt={option.label} width={16} height={16} />
                  <RadioGroupIndicator asChild>
                    <div className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full border border-global" />
                  </RadioGroupIndicator>
                </div>
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
      </PopoverContent>
    </Popover>
  );
};

export default MapStyle;
