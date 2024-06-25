import MapZoomControl from "@/components/map/controls/zoom";
import Legends from "../legends";

const MapControlsContainer = () => {
  return (
    <div className="absolute bottom-5 right-5 space-y-1.5">
      <MapZoomControl />
      <Legends />
    </div>
  );
};

export default MapControlsContainer;
