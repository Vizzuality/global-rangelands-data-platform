import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon } from "lucide-react";
import { MouseEvent, useCallback } from "react";
import { useMap } from "react-map-gl";

const MapZoomControl = () => {
  const { current: mapRef } = useMap();

  const increaseZoom = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      mapRef?.zoomIn();
    },
    [mapRef],
  );

  const decreaseZoom = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      mapRef?.zoomOut();
    },
    [mapRef],
  );

  return (
    <div className="rounded-full bg-background p-1.5 shadow-black/10 drop-shadow-md">
      <Button
        onClick={increaseZoom}
        className="transition-color block h-min rounded-full px-1.5 py-1.5 duration-300 hover:bg-global/20 focus-visible:bg-global"
      >
        <PlusIcon className="h-4 w-4" />
        <span className="sr-only">Zoom in</span>
      </Button>
      <Button
        onClick={decreaseZoom}
        className="transition-color block h-min rounded-full px-1.5 py-1.5 duration-300 hover:bg-global/20 focus-visible:bg-global"
      >
        <MinusIcon className="h-4 w-4" />
        <span className="sr-only">Zoom out</span>
      </Button>
    </div>
  );
};

export default MapZoomControl;
