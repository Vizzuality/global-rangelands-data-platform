"use client";
import { useSyncLayers } from "@/store/map";
import { LayerListResponseDataItem } from "@/types/generated/strapi.schemas";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { TemporalDatasetItem } from "./absolute";
import { TemporalChangesDatasetItem } from "./changes";

const selectTypes = ["absolute", "changes"] as const;
type SelectType = (typeof selectTypes)[number];

type TemporalDatasetProps = {
  layers?: (LayerListResponseDataItem & { type?: string })[];
  value?: string;
  onChange?: (value: string) => void;
  isTemporalGroup?: boolean;
};
const TemporalChangesDataset = ({
  layers,
  value,
  onChange,
  isTemporalGroup,
}: TemporalDatasetProps) => {
  const t = useTranslations();

  const [syncLayers, setSyncLayers] = useSyncLayers();

  const absoluteLayer = layers?.find((layer) => layer.type === "absolute");
  const changeLayer = layers?.find((layer) => layer.type === "changes");

  const selectedLayer = useMemo(
    () => layers?.find((l) => l.attributes?.slug && syncLayers.includes(l.attributes?.slug)),
    [layers, syncLayers],
  );
  const selectedType: SelectType = useMemo(
    () => value || selectedLayer?.type,
    [selectedLayer, value],
  ) as SelectType;

  const handleSelectType = (value: SelectType) => {
    const absoluteLayerSlug = absoluteLayer?.attributes?.slug;
    const changeLayerSlug = changeLayer?.attributes?.slug;
    if (value === "absolute" && absoluteLayerSlug) {
      setSyncLayers((prev) => [...prev?.filter((l) => l !== changeLayerSlug), absoluteLayerSlug]);
    } else if (value === "changes" && changeLayerSlug) {
      setSyncLayers((prev) => [...prev?.filter((l) => l !== absoluteLayerSlug), changeLayerSlug]);
    }
    onChange?.(value);
  };

  const isChangesDataset =
    layers?.length === 2 &&
    layers.every((layer) => layer.type === "changes" || layer.type === "absolute");

  if (!layers?.length) return null;

  return isChangesDataset ? (
    <div className="space-y-4">
      <RadioGroup
        className="flex gap-4 text-xs"
        onValueChange={handleSelectType}
        disabled={!selectedLayer}
        value={selectedType}
      >
        <div className="flex gap-2">
          <RadioGroupItem
            id="dataset-absolute"
            className="flex h-4 w-4 items-center justify-center rounded-full border border-foreground"
            value="absolute"
          />
          <label htmlFor="dataset-absolute" className="flex items-center gap-2">
            {t("See absolute value")}
          </label>
        </div>
        <div className="flex gap-2">
          <RadioGroupItem
            id="dataset-changes"
            className="flex h-4 w-4 items-center justify-center rounded-full border border-foreground"
            value="changes"
          />
          <label htmlFor="dataset-changes" className="flex items-center gap-2">
            {t("See changes over time")}
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
