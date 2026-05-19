import { getKeys } from "@/lib/utils";
import {
  deckLayersInteractiveAtom,
  landmarkActiveFidAtom,
  landmarkCandidatesAtom,
} from "@/store/map";
import { useAtomValue, useSetAtom } from "jotai";
import Item from "./item";
import MapTooltip from "@/components/map/tooltip";

const Popup = () => {
  const deckInteractiveLayers = useAtomValue(deckLayersInteractiveAtom);
  const setInteractiveLayers = useSetAtom(deckLayersInteractiveAtom);
  const setLandmarkCandidates = useSetAtom(landmarkCandidatesAtom);
  const setLandmarkActiveFid = useSetAtom(landmarkActiveFidAtom);
  const slugs = getKeys(deckInteractiveLayers);
  const coordinate = deckInteractiveLayers[slugs[0]]?.coordinate || [];

  if (!slugs.length || coordinate?.length != 2) return null;

  const handleClose = () => {
    setInteractiveLayers({});
    setLandmarkCandidates([]);
    setLandmarkActiveFid(null);
  };

  return (
    <MapTooltip
      onClose={handleClose}
      key={coordinate.toString()}
      longitude={coordinate[0]}
      latitude={coordinate[1]}
    >
      {slugs.map((slug) => {
        return <Item slug={slug} key={slug} />;
      })}
    </MapTooltip>
  );
};

export default Popup;
