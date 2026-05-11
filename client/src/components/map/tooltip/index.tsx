import { Popup } from "react-map-gl/mapbox";
import { PropsWithChildren } from "react";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

type MapTooltipProps = PropsWithChildren & {
  longitude: number;
  latitude: number;
  onClose: () => void;
};

const MapTooltip = ({ latitude, longitude, onClose, children }: MapTooltipProps) => {
  if (!latitude || !longitude) return null;

  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      closeOnClick={false}
      maxWidth="308px"
      className="z-[60] rounded-lg"
      closeButton={false}
    >
      <Button
        variant="ghost"
        onClick={onClose}
        className="transition-color absolute right-0 z-50 block h-min -translate-x-2 translate-y-2 rounded-full bg-background px-1.5 py-1.5 drop-shadow duration-300 hover:bg-hunter-green-200 focus-visible:bg-global"
      >
        <XIcon className="h-3 w-3 fill-foreground" />
      </Button>
      {children}
    </Popup>
  );
};

export default MapTooltip;
