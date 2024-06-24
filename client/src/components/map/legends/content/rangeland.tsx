"use client";
import { useMemo } from "react";
import { LegendComponent } from "../../types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import CircleLegend from "@/components/ui/circle-legend";
import { ChevronDownIcon } from "lucide-react";
import { RANGELAND_BIOMES, RANGELAND_ECOREGIONS } from "@/containers/datasets/constants";
import { useGetRangelands } from "@/types/generated/rangeland";
import { useSyncRangelandRegions, useSyncRangelandType } from "@/store/map";
import { useTranslations } from "@/i18n";
import { useGetLocalizedList } from "@/lib/localized-query";

const RangelandLegend = () => {
  const t = useTranslations();
  const [rangelandType] = useSyncRangelandType();
  const [rangelandRegions] = useSyncRangelandRegions();

  const rangelandsQuery = useGetRangelands({
    populate: "*",
    sort: "title:asc",
    locale: "all",
  });

  const { data: rangelandsData } = useGetLocalizedList(rangelandsQuery);

  const items = useMemo((): LegendComponent["items"] => {
    const biomes =
      rangelandType === RANGELAND_BIOMES && !!rangelandRegions?.length
        ? rangelandsData?.data?.filter((rd) => rangelandRegions.includes(`${rd?.attributes?.code}`))
        : rangelandsData?.data;

    const biomesItems = biomes?.map((rd) => {
      const ecoregions =
        rangelandType === RANGELAND_ECOREGIONS
          ? !!rangelandRegions?.length
            ? rd?.attributes?.ecoregions?.data?.filter((rd) =>
                rangelandRegions.includes(`${rd?.attributes?.code}`),
              )
            : rd?.attributes?.ecoregions?.data
          : [];
      return {
        name: rd?.attributes?.title,
        color: rd?.attributes?.color,
        items: ecoregions?.map((e) => ({
          name: e?.attributes?.title,
          color: e?.attributes?.color,
        })),
      };
    });

    return biomesItems
      ? rangelandType === RANGELAND_BIOMES
        ? biomesItems
        : biomesItems.filter((i) => !!i.items?.length)
      : [];
  }, [rangelandRegions, rangelandsData, rangelandType]);

  const subtitle = useMemo(() => {
    if (rangelandType === RANGELAND_BIOMES) {
      return t("Types");
    }
    if (rangelandType === RANGELAND_ECOREGIONS) {
      return t("Ecoregions");
    }
  }, [rangelandType]);

  return (
    <div className="space-y-2">
      {!!subtitle && <p className="text-xs">{subtitle}</p>}
      <ul className="space-y-2">
        {items?.map((i) => (
          <li key={i.name} className="flex gap-4">
            {i.items?.length ? (
              <Collapsible>
                <CollapsibleTrigger className="group flex gap-2.5">
                  <ChevronDownIcon className="h-4 w-4 flex-shrink-0 opacity-50 group-data-[state=open]:rotate-180" />
                  {!!i.color && <CircleLegend className="h-3.5 w-3.5" colors={[i.color]} />}
                  <span className="text-start text-xs font-light">{i.name}</span>
                </CollapsibleTrigger>
                <CollapsibleContent asChild>
                  <ul className="space-y-1.5 pl-12 pt-2">
                    {i.items.map((subItem) => (
                      <li key={subItem.name} className="flex gap-2.5">
                        {!!subItem.color && (
                          <CircleLegend className="h-3.5 w-3.5" colors={[subItem.color]} />
                        )}
                        <span className="text-xs font-light">{subItem.name}</span>
                      </li>
                    ))}
                  </ul>
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <>
                {!!i.color && <CircleLegend colors={[i.color]} />}
                <span className="text-xs font-light">{i.name}</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RangelandLegend;
