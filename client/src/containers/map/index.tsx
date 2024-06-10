"use client";
import MapComponent from "@/components/map";
import { MAPBOX_STYLE } from "@/components/map/constants";
import { AttributionControl } from "react-map-gl";
import LayerManager from "./layer-manager";
import Navigation from "@/containers/navigation";
import MapStyles from "@/containers/navigation/map-style";
import Controls from "./controls";
import MapLayers from "@/containers/navigation/map-layers";
import { useSyncMapStyle } from "@/store/map";

const Map = () => {
  const [mapStyle] = useSyncMapStyle();

  return (
    <div className="h-full w-full">
      <MapComponent
        mapStyle={MAPBOX_STYLE[mapStyle]}
        projection={{
          name: "mercator",
        }}
        minZoom={0}
        maxZoom={14}
        logoPosition="top-left"
      >
        <AttributionControl style={{ fontSize: "0.75rem" }} compact={true} position="top-left" />
        <LayerManager />
        <Controls />
      </MapComponent>

      <Navigation>
        <MapStyles />
        <MapLayers />
      </Navigation>
      {/* <MapController defaultMapStyle={mapStyle} onChangeMapStyle={handleChangeMapStyle} /> */}
    </div>
  );
};

export default Map;
