import { Popup } from "react-map-gl";
import { PropsWithChildren } from "react";

type MapTooltipProps = PropsWithChildren & {
  longitude: number;
  latitude: number;
};

const MapTooltip = ({ latitude, longitude, children }: MapTooltipProps) => {
  if (!latitude || !longitude) return null;

  return (
    <Popup
      longitude={longitude}
      latitude={latitude}
      anchor="bottom"
      closeOnClick={false}
      className="w-[300px] rounded-lg"
    >
      {children}
    </Popup>
  );
};

export default MapTooltip;
