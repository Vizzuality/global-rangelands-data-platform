import MapZoomControl from "@/components/map/controls/zoom";

const MapControlsContainer = () => {
  return (
    <div className="absolute bottom-5 right-5">
      <MapZoomControl />
    </div>
  );
};

export default MapControlsContainer;
