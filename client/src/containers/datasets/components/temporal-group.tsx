import { Layer } from "@/types/generated/strapi.schemas";
import GroupDataset from "./group";
import { useMemo } from "react";
import TemporalChangesDataset from "./temporal";
import { useSyncLayers } from "@/store/map";

type LayerWithType = Layer & {
  type?: string;
  group?: string;
  groupName?: string;
};
type TemporalGroupDatasetProps = {
  layers?: LayerWithType[] | undefined;
  slug?: string | undefined;
};
type LayerWithNameAndType = LayerWithType & {
  name: string;
};

const DEFAULT_TYPE = "absolute";

const TemporalGroupDataset = ({ layers, slug }: TemporalGroupDatasetProps) => {
  const [syncLayers] = useSyncLayers();

  const selectedLayer = useMemo(() => {
    const selectedLayer = layers?.find((l) => !!l.slug && syncLayers?.includes(l.slug));

    return { type: selectedLayer?.type || DEFAULT_TYPE, group: selectedLayer?.group };
  }, [layers, syncLayers]);

  const layerGroups: LayerWithNameAndType[] = useMemo(
    () =>
      layers?.reduce<LayerWithNameAndType[]>((acc, layer) => {
        if (!layer.group || layer.type !== selectedLayer.type) return acc;

        return [
          ...acc,
          {
            ...layer,
            title: layer.groupName || layer.group,
            name: layer.group,
          },
        ];
      }, []) || [],
    [layers, selectedLayer.type],
  );

  const layerTemporal = useMemo(
    () =>
      layers?.reduce<LayerWithNameAndType[]>((acc, layer) => {
        if (!!selectedLayer.group && layer.group !== selectedLayer.group) return acc;

        let name = layer.group || "";

        if (!layer.group) {
          name = layers[0].group || "";
        }

        return [
          ...acc,
          {
            ...layer,
            title: name,
            name,
            type: layer.type || "",
          },
        ];
      }, []) || [],
    [layers, selectedLayer.group],
  );

  return (
    <div className="space-y-6">
      <GroupDataset layers={layerGroups} slug={slug} />
      <TemporalChangesDataset layers={layerTemporal} isTemporalGroup={true} />
    </div>
  );
};

export default TemporalGroupDataset;
