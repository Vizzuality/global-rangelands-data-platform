"use client";

import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectGroup,
} from "@/components/ui/select";
import CircleLegend, { CircleLegendProps } from "@/components/ui/circle-legend";
import {
  RANGELAND_LAYERS_COLORS_LEGEND,
  RANGELAND_DATASET_SLUG,
  RANGELAND_ECOREGIONS,
  RANGELAND_SYSTEM,
} from "../constants";
import ColorSwatchIcon from "@/svgs/color-swatch.svg";

import { Layer } from "@/types/generated/strapi.schemas";
import {
  clusterFeaturesAtom,
  deckLayersInteractiveAtom,
  useSyncDatasets,
  useSyncLayers,
  useSyncRangelandRegions,
  useSyncRangelandType,
} from "@/store/map";
import { useTranslations } from "@/i18n";
import { useEffect, useMemo } from "react";
import { useGetRangelands } from "@/types/generated/rangeland";

import { MultiSelect } from "@/components/ui/multi-select";
import { XIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useSetAtom } from "jotai";
import { useGetLocalizedList } from "@/lib/localized-query";

type GroupDatasetProps = {
  layers?: Layer[];
  slug?: string;
  onChange?: (value: string) => void;
};

const GroupDataset = ({ layers, slug: datasetSlug, onChange }: GroupDatasetProps) => {
  const t = useTranslations();
  const [syncDatasets] = useSyncDatasets();
  const [syncLayers, setSyncLayers] = useSyncLayers();
  const [rangelandType, setRangelandType] = useSyncRangelandType();
  const [rangelandRegion, setRangelandRegion] = useSyncRangelandRegions();
  const setDeckInteractiveLayers = useSetAtom(deckLayersInteractiveAtom);
  const setClusterFeatures = useSetAtom(clusterFeaturesAtom);
  const datasetLayers = useMemo(() => layers?.map((l) => l?.slug), [layers]);

  const isRangelandDataset = datasetSlug === RANGELAND_DATASET_SLUG;

  const handleSelectLayerType = (layerSlug: string) => {
    setSyncLayers((prev) => {
      // If there is already a layer from the same dataset, remove the old layer and add the selected one
      if (datasetLayers?.includes(layerSlug)) {
        const existingLayerInGroup = prev.find((id) => datasetLayers?.includes(id));
        return prev.map((id) => (id === existingLayerInGroup ? layerSlug : id));
      }
      return [...prev, layerSlug];
    });
    if (isRangelandDataset && layerSlug !== rangelandType) {
      setRangelandType(layerSlug);
      setRangelandRegion([]);
    }
    setDeckInteractiveLayers({});
    setClusterFeatures([]);
    onChange?.(layerSlug);
  };
  const selectedLayer = useMemo(() => {
    const selectedLayerId = datasetLayers?.find((l) => !!l && syncLayers?.includes(l));

    return layers?.find((l) => l.slug === selectedLayerId) || layers?.[0];
  }, [layers, datasetLayers, syncLayers]);

  const getLegendColors = (layerSlug?: string) => {
    if (isRangelandDataset) {
      return RANGELAND_LAYERS_COLORS_LEGEND[
        layerSlug as keyof typeof RANGELAND_LAYERS_COLORS_LEGEND
      ];
    }
    if (layerSlug) {
      const layer = layers?.find((l) => l.slug === layerSlug);
      return (
        layer?.legend?.items?.reduce<string[]>(
          (acc, item) => (item.color ? [...acc, item.color] : acc),
          [],
        ) || []
      );
    }

    return [];
  };

  useEffect(() => {
    if (!datasetSlug || !syncDatasets?.includes(datasetSlug)) {
      if (isRangelandDataset) {
        setRangelandRegion([]);
        setRangelandType(null);
      }
    }
  }, [datasetSlug, syncDatasets, isRangelandDataset, setRangelandRegion, setRangelandType]);

  const rangelandsQuery = useGetRangelands(
    {
      populate: "*",
      sort: "title:asc",
      locale: "all",
    },
    {
      query: {
        enabled: isRangelandDataset,
      },
    },
  );

  const { data: rangelandsData } = useGetLocalizedList(rangelandsQuery);

  const handleFilter = (filters: string[]) => {
    setRangelandRegion(filters);
  };

  const filterOptions = useMemo(() => {
    if (rangelandType === RANGELAND_SYSTEM) {
      return [];
    }

    return (
      rangelandsData?.data?.map((rangeland) => ({
        label: rangeland?.title || "",
        icon: ({ selected }: CircleLegendProps) => (
          <CircleLegend selected={selected} colors={[rangeland?.color || ""]} />
        ),
        value: rangeland?.code || "",
        options:
          rangelandType === RANGELAND_ECOREGIONS
            ? rangeland?.ecoregions?.map((ecoregion) => ({
                label: ecoregion.title || "",
                value: ecoregion.code || "",
                icon: ({ selected }: CircleLegendProps) => (
                  <CircleLegend selected={selected} colors={[ecoregion.color || ""]} />
                ),
              }))
            : [],
      })) || []
    );
  }, [rangelandType, rangelandsData]);

  return (
    <div className="space-y-4">
      <Select
        onValueChange={handleSelectLayerType}
        disabled={!datasetSlug || !syncDatasets?.includes(datasetSlug)}
        defaultValue={selectedLayer?.slug}
        value={selectedLayer?.slug}
      >
        <SelectTrigger className="group">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <ColorSwatchIcon />
              <span className="line-clamp-1 max-w-[248px] break-all text-start">
                {selectedLayer?.title || t("Types")}
              </span>
            </div>
            <CircleLegend
              selected
              removable={false}
              colors={getLegendColors(selectedLayer?.slug)}
            />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {layers?.map((layer) => {
              const layerSlug = layer?.slug;
              if (!layer.id || !layerSlug) return null;
              const colors = getLegendColors(layerSlug);
              return (
                <SelectItem
                  value={layerSlug}
                  key={layer.id}
                  className="items-start justify-between gap-1"
                >
                  <p>{layer.title}</p>
                  <CircleLegend colors={colors} />
                </SelectItem>
              );
            })}
          </SelectGroup>
        </SelectContent>
      </Select>

      {!!isRangelandDataset && !!rangelandsData?.data?.length && (
        <div className="space-y-6">
          <MultiSelect
            defaultValue={rangelandRegion || []}
            options={filterOptions}
            onValueChange={handleFilter}
            triggerLabel={
              <div className="flex flex-1 items-center justify-between gap-3">
                <div className="flex flex-1 items-center justify-between gap-2">
                  <span className="">
                    {rangelandRegion?.length
                      ? `${rangelandRegion.length} ${t("selected")}`
                      : t("All categories")}
                  </span>{" "}
                  {!!rangelandRegion?.length && (
                    <TooltipProvider>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <span
                            className="border-input flex h-5 w-5 items-center justify-center rounded-full border bg-background px-0 py-0 text-xs group-hover:text-foreground"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRangelandRegion([]);
                            }}
                          >
                            <XIcon className="h-3 w-3 " />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-background text-xs">
                          {t("Remove all filters")}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <CircleLegend selected removable={false} colors={getLegendColors(rangelandType)} />
              </div>
            }
          />
          <div className="bg-green-light bg-[url(/images/green-pattern.png)] bg-contain p-2.5 ">
            <p className="text-xs font-medium text-white ">
              {t("Note: The filtering of this layer impacts all other layers of the platform")}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDataset;
