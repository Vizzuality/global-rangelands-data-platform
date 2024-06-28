import { getKeys } from "@/lib/utils";
import { deckLayersInteractiveAtom } from "@/store/map";
import { useAtomValue, useSetAtom } from "jotai";
import Item from "./item";
import MapTooltip from "@/components/map/tooltip";

const Popup = () => {
  const deckInteractiveLayers = useAtomValue(deckLayersInteractiveAtom);
  const setInteractiveLayers = useSetAtom(deckLayersInteractiveAtom);
  const slugs = getKeys(deckInteractiveLayers);

  const coordinate = deckInteractiveLayers[slugs[0]]?.coordinate || [];

  if (!slugs.length || coordinate?.length != 2) return null;

  const handleClose = () => {
    setInteractiveLayers({});
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
