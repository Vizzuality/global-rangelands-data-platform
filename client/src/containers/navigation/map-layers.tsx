"use client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useGetLocalizedList } from "@/lib/localized-query";
import {
  useSyncLayers,
  useSyncRangelandRegions,
  useSyncRangelandType,
  useSyncSearchParams,
} from "@/store/map";
import { useGetEcoregions } from "@/types/generated/ecoregion";
import { useGetRangelands } from "@/types/generated/rangeland";
import { usePathname } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

const MapLayers = () => {
  const t = useTranslations();

  const [layers] = useSyncLayers();
  const pathname = usePathname();
  const searchParams = useSyncSearchParams();
  const [rangelandRegion] = useSyncRangelandRegions();
  const [rangelandType] = useSyncRangelandType();

  const isStoriesMode = pathname.startsWith("/map/stories") || pathname.startsWith("/map/story");

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
    const text = `${layers.length - 1} ${t("layer")}${layers.length - 1 === 1 ? "" : "s"} ${"filtered by"}:`;
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
      <p className="text-start">
        {text} <span className="font-semibold">{data}</span>
      </p>
    );
  }, [layers, ecoregions, biomes, rangelandType, rangelandRegion, t]);

  const tabs = [
    {
      title: t("Rangelands Layers"),
      id: "layers",
      href: `/map${searchParams}` as const,
      color: "global",
      badge: layers.length - 1 > 0 ? layers.length - 1 : undefined,
      badgeTooltip: layersBadgeTooltip,
      isActive: !isStoriesMode,
    },
    {
      title: t("Rangelands Stories"),
      id: "stories",
      href: `/map/stories${searchParams}` as const,
      color: "stories",
      isActive: isStoriesMode,
    },
  ];

  return (
    <div className="flex gap-2">
      {tabs.map((tab) => (
        <Link
          key={`map-tab-${tab.id}`}
          href={tab.href}
          className="group flex h-10 items-center gap-2 rounded-[20px] border-2 border-orange-100/0 px-2.5 text-sm transition-colors duration-300 hover:bg-background focus-visible:border-2 focus-visible:border-orange-100 focus-visible:bg-background focus-visible:outline-0 data-[state=open]:rounded-b-none"
          style={{
            backgroundColor: tab.isActive ? `rgb(var(--${tab.color}-rgb))` : undefined,
            color: tab.isActive ? "white" : "var(--foreground)",
          }}
          data-state={tab.isActive ? "active" : "inactive"}
        >
          {tab.title}
          {"badge" in tab && tab.badge && (
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <div className="relative flex h-[26px] w-[26px] items-center justify-center rounded-full">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full border border-foreground transition-colors duration-300 group-data-[state=active]:border-white group-data-[state=inactive]:hover:border-green-light group-data-[state=active]:hover:bg-white group-data-[state=active]:hover:text-green-light group-data-[state=inactive]:hover:text-green-light">
                      {tab.badge}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent asChild sideOffset={16} side="bottom">
                  <div className="max-w-[150px] border-0 text-xs group-data-[state=active]:bg-background group-data-[state=inactive]:bg-foreground group-data-[state=active]:text-green-light group-data-[state=inactive]:text-white">
                    {tab.badgeTooltip}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </Link>
      ))}
    </div>
  );
};

export default MapLayers;
