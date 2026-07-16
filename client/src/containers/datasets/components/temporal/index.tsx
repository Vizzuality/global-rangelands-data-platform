"use client";
import { useSyncLayers } from "@/store/map";
import { Layer } from "@/types/generated/strapi.schemas";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { TemporalDatasetItem } from "./absolute";
import { TemporalChangesDatasetItem } from "./changes";
import { cn } from "@/lib/utils";

const selectTypes = ["absolute", "changes"] as const;
type SelectType = (typeof selectTypes)[number];

type TemporalDatasetProps = {
  layers?: (Layer & { type?: string })[];
  isTemporalGroup?: boolean;
};
const TemporalChangesDataset = ({ layers, isTemporalGroup }: TemporalDatasetProps) => {
  const t = useTranslations();

  const [syncLayers, setSyncLayers] = useSyncLayers();

  const absoluteLayer = layers?.find((layer) => layer.type === "absolute");
  const changeLayer = layers?.find((layer) => layer.type === "changes");

  const selectedLayer = useMemo(
    () => layers?.find((l) => l.slug && syncLayers.includes(l.slug)),
    [layers, syncLayers],
  );
  const selectedType: SelectType = useMemo(
    () => selectedLayer?.type,
    [selectedLayer],
  ) as SelectType;

  const handleSelectType = (value: SelectType) => {
    const absoluteLayerSlug = absoluteLayer?.slug;
    const changeLayerSlug = changeLayer?.slug;
    if (value === "absolute" && absoluteLayerSlug) {
      // setSyncLayers((prev) => [
      //   ...prev?.filter((l) => l !== changeLayerSlug && l !== absoluteLayerSlug),
      //   absoluteLayerSlug,
      // ]);
      setSyncLayers((prev) =>
        prev.map((layer) => (layer === changeLayerSlug ? absoluteLayerSlug : layer)),
      );
    } else if (value === "changes" && changeLayerSlug) {
      // setSyncLayers((prev) => [
      //   ...prev?.filter((l) => l !== absoluteLayerSlug && l !== changeLayerSlug),
      //   changeLayerSlug,
      // ]);
      setSyncLayers((prev) =>
        prev.map((layer) => (layer === absoluteLayerSlug ? changeLayerSlug : layer)),
      );
    }
  };

  const isChangesDataset =
    layers?.length === 2 &&
    layers.every((layer) => layer.type === "changes" || layer.type === "absolute");

  if (!layers?.length) return null;

  return isChangesDataset ? (
    <div className="space-y-4">
      <RadioGroup
        className="flex justify-between gap-4 text-xs"
        onValueChange={handleSelectType}
        disabled={!selectedLayer}
        value={selectedType}
      >
        <p className={cn(!selectedType && "text-hunter-green-300")}>{t("Show by")}</p>
        <div className="flex cursor-pointer gap-2">
          <RadioGroupItem
            id="dataset-absolute"
            className="peer flex h-4 w-4 items-center justify-center rounded-full border border-foreground disabled:border-hunter-green-300"
            value="absolute"
          />
          <label
            htmlFor="dataset-absolute"
            className="flex cursor-pointer items-center gap-2 peer-disabled:text-hunter-green-300"
          >
            {t("Absolute value")}
          </label>
        </div>
        <div className="flex gap-2">
          <RadioGroupItem
            id="dataset-changes"
            className="peer flex h-4 w-4 items-center justify-center rounded-full border border-foreground disabled:border-hunter-green-300"
            value="changes"
          />
          <label
            htmlFor="dataset-changes"
            className="flex cursor-pointer items-center gap-2 peer-disabled:text-hunter-green-300"
          >
            {t("Changes over time")}
          </label>
        </div>
      </RadioGroup>
      <TemporalChangesDatasetItem
        isTemporalGroup={isTemporalGroup}
        selectType={selectedType}
        layer={selectedLayer || layers[0]}
      />
    </div>
  ) : (
    <div>
      <div className="space-y-2">
        <TemporalDatasetItem layer={layers[0]} />
      </div>
    </div>
  );
};

export default TemporalChangesDataset;
