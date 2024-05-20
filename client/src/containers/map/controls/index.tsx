import MapControls from "@/components/map/controls";
import MapStyleControl from "@/components/map/controls/map-style";
import MapZoomControl from "@/components/map/controls/zoom";
import { MapStyles } from "@/components/map/types";

type MapControlsContainerProps = {
  onChangeMapStyle: (style: MapStyles) => void;
  defaultMapStyle: MapStyles;
};

const MapControlsContainer = ({ onChangeMapStyle, defaultMapStyle }: MapControlsContainerProps) => {
  return (
    <div>
      <div className="pointer-events-none absolute left-0 top-6 flex h-12 w-full justify-center overflow-visible">
        <div className="pointer-events-auto h-12 rounded-[40px] bg-white/40 p-1 backdrop-blur-lg">
          <MapControls>
            <MapStyleControl onChangeMapStyle={onChangeMapStyle} defaultValue={defaultMapStyle} />
          </MapControls>
        </div>
      </div>
      <div className="absolute bottom-5 right-5">
        <MapZoomControl />
      </div>
    </div>
  );
};

export default MapControlsContainer;
