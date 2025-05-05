"use client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useGetLocalizedList } from "@/lib/localized-query";
import {
  sidebarModeAtom,
  useSyncLayers,
  useSyncRangelandRegions,
  useSyncRangelandType,
} from "@/store/map";
import { useGetEcoregions } from "@/types/generated/ecoregion";
import { useGetRangelands } from "@/types/generated/rangeland";
import { useAtom } from "jotai";
import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";

const MapLayers = () => {
  const t = useTranslations();

  const [layers] = useSyncLayers();
  const [sidebarMode, setSidebarMode] = useAtom(sidebarModeAtom);
  const [rangelandRegion] = useSyncRangelandRegions();

  const [rangelandType] = useSyncRangelandType();

  const biomesQuery = useGetRangelands(
    {
      populate: "*",
      sort: "title:asc",
      locale: "all",
    },
    {
      query: {
        enabled: rangelandType === "rangeland-biomes" && rangelandRegion.length > 0,
      },
    },
  );
  const biomes = useGetLocalizedList(biomesQuery);

  const ecoregionsQuery = useGetEcoregions(
    {
      populate: "*",
      filters: {
        code: {
          $in: rangelandRegion,
        },
      },
    },
    {
      query: {
        enabled: rangelandType === "rangeland-ecoregions" && rangelandRegion.length > 0,
      },
    },
  );

  const ecoregions = useGetLocalizedList(ecoregionsQuery);

  const layersBadgeTooltip = useMemo(() => {
    const text = `${layers.length - 1} ${t("layer")}${layers.length - 1 === 1 ? "" : "s"} ${"filtered by"}`;
    let data = t("Rangeland Systems");

    if (rangelandType === "rangeland-ecoregions") {
      data = `${t("Rangeland Ecoregions")}${
        ecoregions.data?.data?.length && rangelandRegion.length > 0
          ? ecoregions.data?.data?.map((ecoregion) => ecoregion?.attributes?.title).join(", ")
          : ""
      }`;
    } else if (rangelandType === "rangeland-biomes") {
      data = `${t("Rangeland Biomes")}${
        biomes.data?.data?.length && rangelandRegion.length > 0
          ? ` (${biomes.data?.data
              ?.filter(
                (biome) =>
                  biome?.attributes?.code && rangelandRegion.includes(biome.attributes.code),
              )
              ?.map((biome) => biome?.attributes?.title)
              .join(", ")})`
          : ""
      }`;
    }

    return (
      <p>
        {text} <span className="font-semibold">{data}</span>
      </p>
    );
  }, [layers, ecoregions, biomes, rangelandType, rangelandRegion]);

  const tabs = [
    {
      title: t("Rangelands Layers"),
      id: "layers",
      color: "global",
      badge: layers.length - 1 > 0 ? layers.length - 1 : undefined,
      badgeTooltip: layersBadgeTooltip,
    },
    {
      title: t("Rangelands stories"),
      id: "stories",
      color: "stories",
    },
  ];

  const handleClick = useCallback((id: typeof sidebarMode) => {
    // setSidebarOpen((prev) => !prev);
    setSidebarMode(id);
  }, []);

  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <button
          className="group flex h-10 items-center gap-2 rounded-[20px] border-2 border-orange-100/0 px-2.5 text-sm transition-colors duration-300 hover:bg-background focus-visible:border-2 focus-visible:border-orange-100 focus-visible:bg-background focus-visible:outline-0 data-[state=open]:rounded-b-none "
          style={{
            backgroundColor: sidebarMode === tab.id ? `rgb(var(--${tab.color}-rgb))` : undefined,
            color: sidebarMode === tab.id ? "white" : "var(--foreground)",
          }}
          data-state={sidebarMode === tab.id ? "active" : "inactive"}
          onClick={() => handleClick(tab.id as typeof sidebarMode)}
        >
          {tab.title}
          {tab.badge && (
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div className="relative flex h-[26px] w-[26px] items-center justify-center">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-foreground transition-colors duration-300 group-data-[state=active]:border-white">
                      {tab.badge}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs" sideOffset={16} side="bottom">
                  <div className="text-xs text-green-light">{tab.badgeTooltip}</div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </button>
      ))}
    </div>
  );
};

export default MapLayers;
