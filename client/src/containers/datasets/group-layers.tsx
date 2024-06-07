import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectGroup,
} from "@/components/ui/select";
import CircleLegend from "@/components/circle-legend";
import { RANGELAND_LAYERS_COLORS_LEGEND, RANGELAND_DATASET_SLUG } from "./constants";
import ColorSwatchIcon from "@/svgs/color-swatch.svg";

import { DefaultLayerComponent } from "@/types/generated/strapi.schemas";
import { useSyncLayers } from "@/store/map";
import { useTranslations } from "@/i18n";
import { useMemo } from "react";

type RangelandLayersProps = {
  layers: DefaultLayerComponent[];
  slug?: string;
};

const RangelandLayers = ({ layers, slug: datasetSlug }: RangelandLayersProps) => {
  const t = useTranslations();
  const [syncLayers, setSyncLayers] = useSyncLayers();

  const datasetLayers = useMemo(
    () => layers?.map((l) => l.layer?.data?.attributes?.slug),
    [layers],
  );

  const selectedLayerId = datasetLayers?.find((l) => !!l && syncLayers?.includes(l));

  const handleSelectLayer = (layerSlug: string) => {
    setSyncLayers((prev) => {
      // If there is already a layer from the same dataset, remove the old layer and add the selected one
      if (datasetLayers?.includes(layerSlug)) {
        return [
          ...prev.filter((id) => {
            return !datasetLayers?.includes(id);
          }),
          layerSlug,
        ];
      }
      return [...prev, layerSlug];
    });
  };

  const selectedLayer = useMemo(
    () => layers?.find((l) => l.id === selectedLayerId),
    [layers, selectedLayerId],
  );
  const isRangelandDataset = datasetSlug === RANGELAND_DATASET_SLUG;

  const getLegendColors = (layerSlug?: string) => {
    if (!layerSlug) return;
    if (!isRangelandDataset) {
      return RANGELAND_LAYERS_COLORS_LEGEND[
        layerSlug as keyof typeof RANGELAND_LAYERS_COLORS_LEGEND
      ];
    }
  };

  return (
    <div>
      <Select
        onValueChange={handleSelectLayer}
        defaultValue={selectedLayer ? selectedLayer.toString() : undefined}
      >
        <SelectTrigger className="flex gap-3">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <ColorSwatchIcon />
              {selectedLayer?.name || t("Types")}
            </div>
            {isRangelandDataset && selectedLayer?.layer?.data?.attributes?.slug && (
              <CircleLegend
                selected
                colors={getLegendColors(selectedLayer.layer.data.attributes.slug)}
              />
            )}
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {layers?.map((layer) => {
              const layerSlug = layer?.layer?.data?.attributes?.slug;
              if (!layer.id || !layerSlug) return null;
              const colors = getLegendColors(layerSlug);
              return (
                <SelectItem value={layerSlug} key={layer.id} className="justify-between">
                  <p>{layer.name}</p>
                  {isRangelandDataset && <CircleLegend colors={colors} />}
                </SelectItem>
              );
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default RangelandLayers;
