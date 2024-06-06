"use client";

import ColorSwatchIcon from "@/svgs/color-swatch.svg";

import { DatasetListResponseDataItem } from "@/types/generated/strapi.schemas";

import { useSyncDatasets, useSyncLayers } from "@/store/map";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectGroup,
} from "@/components/ui/select";
import CircleLegend from "@/components/circle-legend";
import { Switch } from "@/components/ui/switch";
import { rangelandLayersCircleColors } from "./constants";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

const DatasetsItem = ({ id, attributes }: DatasetListResponseDataItem) => {
  const t = useTranslations();
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
    if (checked) {
      const firstDatasetLayer = attributes?.layers?.[0]?.id;
      if (firstDatasetLayer) {
        setLayers((prev) => [...prev, firstDatasetLayer]);
      }
    }
  };

  const datasetLayers = useMemo(() => attributes?.layers?.map((l) => l.id), [attributes?.layers]);

  const selectedLayer = datasetLayers?.find((l) => !!l && layers?.includes(l));

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
  };

  const selectedLayerName = useMemo(
    () => attributes?.layers?.find((l) => l.id === selectedLayer)?.name,
    [attributes, selectedLayer],
  );

  return (
    <div>
      <div className="space-y-6">
        <div className="flex items-center gap-3 font-medium">
          <Switch
            id={`toggle-${id}`}
            checked={datasets?.includes(id!)}
            onCheckedChange={handleToggleDataset}
          />
          <label htmlFor={`toggle-${id}`}>{attributes?.title}</label>
        </div>
        {attributes?.type === "Group" && (
          <div>
            <Select
              onValueChange={handleSelectLayer}
              defaultValue={selectedLayer ? selectedLayer.toString() : undefined}
            >
              <SelectTrigger className="flex gap-3">
                <div className="flex w-full items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ColorSwatchIcon />
                    {selectedLayerName || t("Types")}
                  </div>
                  <CircleLegend
                    selected
                    colors={rangelandLayersCircleColors[selectedLayer || "1"]}
                  />
                </div>
              </SelectTrigger>
              <SelectContent className="">
                <SelectGroup>
                  {attributes?.layers?.map((layer, index) => {
                    if (!layer.id || !layer.name) return null;
                    return (
                      <SelectItem
                        value={layer.id.toString()}
                        key={layer.id}
                        className="justify-between"
                      >
                        <p>{layer.name}</p>
                        <CircleLegend colors={rangelandLayersCircleColors[layer.id]} />
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatasetsItem;
