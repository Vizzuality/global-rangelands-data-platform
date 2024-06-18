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

import { DefaultLayerComponent } from "@/types/generated/strapi.schemas";
import {
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

type GroupDatasetProps = {
  layers: DefaultLayerComponent[];
  slug?: string;
};

const GroupDataset = ({ layers, slug: datasetSlug }: GroupDatasetProps) => {
  const t = useTranslations();
  const [syncDatasets] = useSyncDatasets();
  const [syncLayers, setSyncLayers] = useSyncLayers();
  const [rangelandType, setRangelandType] = useSyncRangelandType();
  const [rangelandRegion, setRangelandRegion] = useSyncRangelandRegions();

  const datasetLayers = useMemo(
    () => layers?.map((l) => l.layer?.data?.attributes?.slug),
    [layers],
  );

  const handleSelectLayerType = (layerSlug: string) => {
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
    if (layerSlug !== rangelandType) {
      setRangelandType(layerSlug);
      setRangelandRegion([]);
    }
  };

  const selectedLayer = useMemo(() => {
    const selectedLayerId = datasetLayers?.find((l) => !!l && syncLayers?.includes(l));
    return layers?.find((l) => l.layer?.data?.attributes?.slug === selectedLayerId);
  }, [layers, datasetLayers, syncLayers]);

  const isRangelandDataset = datasetSlug === RANGELAND_DATASET_SLUG;

  const getLegendColors = (layerSlug?: string) => {
    if (!layerSlug) return;
    if (isRangelandDataset) {
      return RANGELAND_LAYERS_COLORS_LEGEND[
        layerSlug as keyof typeof RANGELAND_LAYERS_COLORS_LEGEND
      ];
    }
  };

  useEffect(() => {
    if (!datasetSlug || !syncDatasets?.includes(datasetSlug)) {
      if (isRangelandDataset) {
        setRangelandRegion([]);
        setRangelandType(null);
      }
    }
  }, [datasetSlug, syncDatasets, isRangelandDataset, setRangelandRegion, setRangelandType]);

  const { data: rangelandsData } = useGetRangelands(
    {
      populate: "*",
      sort: "title:asc",
    },
    {
      query: {
        enabled: isRangelandDataset,
      },
    },
  );

  const handleFilter = (filters: string[]) => {
    setRangelandRegion(filters);
  };

  const filterOptions = useMemo(() => {
    if (rangelandType === RANGELAND_SYSTEM) {
      return [];
    }

    return (
      rangelandsData?.data?.map(({ attributes }) => ({
        label: attributes?.title || "",
        icon: ({ selected }: CircleLegendProps) => (
          <CircleLegend selected={selected} colors={[attributes?.color || ""]} />
        ),
        value: attributes?.code || "",
        options:
          rangelandType === RANGELAND_ECOREGIONS
            ? attributes?.ecoregions?.data?.map((ecoregion) => ({
                label: ecoregion.attributes?.title || "",
                value: ecoregion.attributes?.code || "",
                icon: ({ selected }: CircleLegendProps) => (
                  <CircleLegend selected={selected} colors={[ecoregion.attributes?.color || ""]} />
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
        defaultValue={selectedLayer?.layer?.data?.attributes?.slug}
        value={selectedLayer?.layer?.data?.attributes?.slug}
      >
        <SelectTrigger>
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <ColorSwatchIcon />
              {selectedLayer?.name || t("Types")}
            </div>
            {isRangelandDataset && selectedLayer?.layer?.data?.attributes?.slug && (
              <CircleLegend
                selected
                removable={false}
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

      {!!rangelandsData?.data?.length && (
        <MultiSelect
          defaultValue={rangelandRegion || []}
          options={filterOptions}
          onValueChange={handleFilter}
          triggerLabel={
            <div className="flex flex-1 items-center justify-between gap-3">
              <div className="flex flex-1 items-center justify-between gap-2">
                <span className="">
                  {!!rangelandRegion?.length
                    ? `${rangelandRegion.length} ${t("selected")}`
                    : t("All categories")}
                </span>{" "}
                {!!rangelandRegion?.length && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span
                          className="border-input hover:bg-accent hover:text-accent-foreground flex h-5 w-5 items-center justify-center rounded-full border bg-background px-0 py-0 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRangelandRegion([]);
                          }}
                        >
                          <XIcon className="h-3 w-3" />
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
      )}
    </div>
  );
};

export default GroupDataset;
