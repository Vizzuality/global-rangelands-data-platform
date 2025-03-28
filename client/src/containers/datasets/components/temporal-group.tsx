import { LayerListResponseDataItem } from "@/types/generated/strapi.schemas";
import GroupDataset from "./group";
import { useMemo, useState } from "react";
import TemporalChangesDataset from "./temporal";
import { useSyncLayers } from "@/store/map";

type LayerWithType = LayerListResponseDataItem & {
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
    const selectedLayer = layers?.find(
      (l) => !!l.attributes?.slug && syncLayers?.includes(l.attributes?.slug),
    );

    return { type: selectedLayer?.type || DEFAULT_TYPE, group: selectedLayer?.group };
  }, [layers, syncLayers]);

  const [selectedType, setSelectedType] = useState(selectedLayer.type || DEFAULT_TYPE);

  const layerGroups: LayerWithNameAndType[] = useMemo(
    () =>
      layers?.reduce<LayerWithNameAndType[]>((acc, layer) => {
        if (!layer.group || layer.type !== selectedType) return acc;

        return [
          ...acc,
          {
            ...layer,
            ...(layer.attributes
              ? {
                  attributes: {
                    ...layer.attributes,
                    title: layer.groupName || layer.group,
                  },
                }
              : {}),
            name: layer.group,
          },
        ];
      }, []) || [],
    [layers, selectedType],
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
            ...(layer.attributes
              ? {
                  attributes: {
                    ...layer.attributes,
                    title: name,
                  },
                }
              : {}),
            name,
            type: layer.type || "",
          },
        ];
      }, []) || [],
    [layers, selectedLayer.group],
  );

  const handleChangeType = (value: string) => {
    setSelectedType(value);
  };

  return (
    <div className="space-y-6">
      <GroupDataset layers={layerGroups} slug={slug} />
      <TemporalChangesDataset
        value={selectedType}
        onChange={handleChangeType}
        layers={layerTemporal}
        isTemporalGroup={true}
      />
    </div>
  );
};

export default TemporalGroupDataset;
