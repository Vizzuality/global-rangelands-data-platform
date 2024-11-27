import MapZoomControl from "@/components/map/controls/zoom";
import Legends from "../legends";
import SearchLocation from "../search-location";
import { useState } from "react";

const MapControlsContainer = () => {
  const [legendOpen, setLegendOpen] = useState(true);
  return (
    <div className="absolute bottom-6 right-5 space-y-1.5">
      <SearchLocation onOpenChange={(o: boolean) => o && setLegendOpen(false)} />
      <MapZoomControl />
      <Legends open={legendOpen} onOpenChange={setLegendOpen} />
    </div>
  );
};

export default MapControlsContainer;
