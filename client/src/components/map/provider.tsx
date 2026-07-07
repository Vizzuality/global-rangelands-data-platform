/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { useControl, useMap } from "react-map-gl/mapbox";

import { MapboxOverlay, MapboxOverlayProps } from "@deck.gl/mapbox";
import { Layer } from "deck.gl";
import { useSetAtom } from "jotai";
import { deckLayersInteractiveAtom } from "@/store/map";

interface DeckMapboxOverlayContext {
  addLayer: (layer: any) => void;
  removeLayer: (id: string) => void;
}

const Context = createContext<DeckMapboxOverlayContext>({
  addLayer: () => {
    console.info("addLayer");
  },
  removeLayer: () => {
    console.info("removeLayer");
  },
});

function useMapboxOverlay(
  props: MapboxOverlayProps & {
    interleaved?: boolean;
  },
) {
  const { default: map } = useMap();
  const setDeckInteractiveLayers = useSetAtom(deckLayersInteractiveAtom);
  const overlay = useControl<MapboxOverlay>(
    () =>
      new MapboxOverlay({
        ...props,
        onClick: (info) => {
          setDeckInteractiveLayers(() => {
            const layerProps = info?.layer?.props;
            const slug = layerProps && "slug" in layerProps && (layerProps.slug as string);
            if (!slug) return {};
            return {
              [slug]: info,
            };
          });
        },
        getCursor: () => map?.getCanvas().style.cursor || "",
      }),
  );
  overlay.setProps(props);

  return overlay;
}

export const DeckMapboxOverlayProvider = ({ children }: PropsWithChildren) => {
  const layersRef = useRef<any[]>([]);
  const { default: map } = useMap();

  const OVERLAY = useMapboxOverlay({
    interleaved: true,
  });

  // A layer's beforeId can point at a mapbox background layer that was already
  // removed from the map (e.g. toggling the layer off unmounts it), which makes
  // deck.gl's resolveLayerGroups call map.moveLayer on a nonexistent id and throw.
  // Strip beforeId in that case so the layer is appended to the top instead.
  const withValidBeforeId = useCallback(
    (layers: any[]) => {
      const mapInstance = map?.getMap?.();
      if (!mapInstance) return layers;
      return layers.map((layer) => {
        const beforeId = layer?.props?.beforeId;
        if (beforeId && !mapInstance.getLayer(beforeId)) {
          return layer.clone({ beforeId: undefined });
        }
        return layer;
      });
    },
    [map],
  );

  const addLayer = useCallback(
    (layer: any) => {
      const newLayers = [...layersRef.current.filter((l) => l.id !== layer.id), layer];

      layersRef.current = newLayers;
      return OVERLAY.setProps({ layers: withValidBeforeId(newLayers) });
    },
    [OVERLAY, withValidBeforeId],
  );

  const removeLayer = useCallback(
    (id: string) => {
      const newLayers = [...layersRef.current.filter((l) => l.id !== id)];

      layersRef.current = newLayers;
      OVERLAY.setProps({ layers: withValidBeforeId(newLayers) });
    },
    [OVERLAY, withValidBeforeId],
  );

  const context = useMemo(
    () => ({
      addLayer,
      removeLayer,
    }),
    [addLayer, removeLayer],
  );

  return (
    <Context.Provider key="deck-mapbox-provider" value={context}>
      {children}
    </Context.Provider>
  );
};

export const useDeckMapboxOverlayContext = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("useDeckMapboxOverlayContext must be used within a DeckMapboxOverlayProvider");
  }

  return context;
};

export const useDeckMapboxOverlay = ({
  id,
  layer,
  did,
}: {
  id: string;
  layer: Layer | null;
  did?: string;
}) => {
  const i = did ? `${id}-${did}-deck` : `${id}-deck`;
  const { addLayer, removeLayer } = useDeckMapboxOverlayContext();

  useEffect(() => {
    if (!layer) return;
    // Give the map a chance to load the background layer before adding the Deck layer
    setTimeout(() => {
      // https://github.com/visgl/deck.gl/blob/c2ba79b08b0ea807c6779d8fe1aaa307ebc22f91/modules/mapbox/src/resolve-layers.ts#L66

      addLayer(layer);
    }, 10);
  }, [i, id, layer, addLayer]);

  useEffect(() => {
    if (!layer) return;
    return () => {
      removeLayer(i);
    };
  }, [i, removeLayer]); // eslint-disable-line react-hooks/exhaustive-deps

  return { addLayer, removeLayer };
};
