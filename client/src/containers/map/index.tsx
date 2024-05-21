"use client";
import MapComponent from "@/components/map";
import MapController from "./controls";
import { MAPBOX_STYLE } from "@/components/map/constants";
import { useState } from "react";
import { MapStyles } from "@/components/map/types";
import { AttributionControl } from "react-map-gl";

const Map = () => {
  const [mapStyle, setMapStyle] = useState<MapStyles>("light");

  const handleChangeMapStyle = (style: MapStyles) => {
    setMapStyle(style);
  };

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
        <MapController defaultMapStyle={mapStyle} onChangeMapStyle={handleChangeMapStyle} />
      </MapComponent>
    </div>
  );
};

export default Map;
