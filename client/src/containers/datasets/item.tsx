"use client";

import ColorSwatchIcon from "@/svgs/color-swatch.svg";

import { DatasetListResponseDataItem } from "@/types/generated/strapi.schemas";

import { useSyncDatasets, useSyncLayers } from "@/store/map";
import { Select, SelectContent, SelectTrigger } from "@/components/ui/select";
import CircleLegend from "@/components/circle-legend";
import { Switch } from "@/components/ui/switch";
import { getColorFromConfig } from "@/lib/utils";
import { useMemo } from "react";
import { SelectItem } from "@radix-ui/react-select";

const DatasetsItem = ({ id, attributes }: DatasetListResponseDataItem) => {
  const [datasets, setDatasets] = useSyncDatasets();
  const [layers, setLayers] = useSyncLayers();

  const handleToggleDataset = (checked: boolean) => {
    if (!id) return;
    setDatasets((prev) => {
      if (!checked) {
        return prev.filter((d) => d !== id);
      }
      return [...prev, id];
    });
    if (!checked) {
      setLayers((prev) => prev.filter((l) => !attributes?.layers?.map((l) => l.id)?.includes(l)));
    }
  };

  const datasetLayers = attributes?.layers?.map((l) => l.id);

  const selectedLayer = datasetLayers?.find((l) => layers?.includes(l));

  const handleSelectLayer = (layer: string) => {
    const layerId = Number(layer);

    setLayers((prev) => {
      // If there is already a layer from the same dataset, remove the old layer and add the selected one
      if (datasetLayers?.includes(layerId)) {
        return [
          ...prev.filter((id) => {
            return !datasetLayers?.includes(id);
          }),
          layerId,
        ];
      }

      return [...prev, layerId];
    });
    // setSelectedLayer(layerId);
  };

  const layerColors = useMemo(() => {
    return (
      attributes?.layers?.map((layer) => {
        const colors = layer.layer?.data?.attributes?.params_config?.find(
          (c) => c.key === "colors",
        );
        return {
          id: layer.id,
          colors: getColorFromConfig(colors?.default),
        };
      }) || []
    );
  }, []);

  const selectedLayerColor = useMemo(() => {
    return layerColors.find((l) => l.id === selectedLayer)?.colors || [];
  }, [selectedLayer, layerColors]);

  return (
    <div className="">
      <div className="">
        <div className="flex gap-2">
          <Switch checked={datasets?.includes(id!)} onCheckedChange={handleToggleDataset} />
          <h2>{attributes?.title}</h2>
        </div>
        {attributes?.type === "Group" && (
          <Select open onValueChange={handleSelectLayer}>
            <SelectTrigger className="flex gap-3">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <ColorSwatchIcon />
                  {attributes?.type}
                </div>
                <CircleLegend selected colors={selectedLayerColor} />
              </div>
            </SelectTrigger>
            <SelectContent>
              {attributes?.layers?.map((layer, index) => {
                if (!layer.id || !layer.name) return null;
                return (
                  <SelectItem value={layer.id.toString()} key={layer.id} asChild>
                    <div className="flex w-full justify-between ">
                      <p>{layer.name}</p>
                      <CircleLegend
                        selected={selectedLayer === layer.id}
                        colors={layerColors[index].colors}
                      />
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
};

export default DatasetsItem;
