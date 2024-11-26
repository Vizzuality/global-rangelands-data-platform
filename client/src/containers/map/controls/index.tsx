import MapZoomControl from "@/components/map/controls/zoom";
import Legends from "../legends";
import SearchLocation from "../search-location";

const MapControlsContainer = () => {
  return (
    <div className="absolute bottom-6 right-5 space-y-1.5">
      <SearchLocation />
      <MapZoomControl />
      <Legends />
    </div>
  );
};

export default MapControlsContainer;
