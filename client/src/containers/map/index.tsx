"use client";
import MapComponent from "@/components/map";
import { MAPBOX_STYLE } from "@/components/map/constants";
import { AttributionControl, MapLayerMouseEvent, MapProvider, useMap } from "react-map-gl";
import LayerManager from "./layer-manager";
import Navigation from "@/containers/navigation";
import MapStyles from "@/containers/navigation/map-style";
import Controls from "./controls";
import MapLayers from "@/containers/navigation/map-layers";
import { deckLayersInteractiveAtom, useSyncMapStyle } from "@/store/map";
import MapTooltip from "./popups";
import OpenStreetMapAttribution from "@/components/ui/openstreetmap-attribution";
import useSyncLayersOrder from "@/hooks/use-sync-layers-order";
import { useCallback } from "react";
import { useSetAtom } from "jotai";

const Map = () => {
  const [mapStyle] = useSyncMapStyle();
  const { default: mapRef } = useMap();

  useSyncLayersOrder();
  const setDeckInteractiveLayers = useSetAtom(deckLayersInteractiveAtom);

  const handleMapClick = useCallback(
    (event: MapLayerMouseEvent) => {
      if (!mapRef) return;

      const features = mapRef.queryRenderedFeatures(event.point);

      console.log("event", event);
      console.log({ features });

      setDeckInteractiveLayers({ "environmental-justice": { coordinate: event.lngLat.toArray() } });
    },
    [mapRef],
  );

  return (
    <div className="h-full w-full">
      <MapComponent
        mapStyle={MAPBOX_STYLE[mapStyle]}
        projection={{
          name: "mercator",
        }}
        minZoom={2}
        maxZoom={14}
        logoPosition="bottom-left"
        onClick={handleMapClick}
      >
        <AttributionControl style={{ fontSize: "10px" }} position="bottom-right" />
        <LayerManager />
        <Controls />

        <MapTooltip />
      </MapComponent>

      <Navigation>
        <MapStyles />
        <MapLayers />
      </Navigation>
      <OpenStreetMapAttribution />
    </div>
  );
};

export default Map;
