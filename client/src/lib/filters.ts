import { useSyncRangelandRegions } from "@/store/map";
import { useGetRangelands } from "@/types/generated/rangeland";
import { useMemo } from "react";

export const useBiomes = () => {
  const [rangelandRegions] = useSyncRangelandRegions();
  const { data: rangelandsData } = useGetRangelands({
    populate: "*",
    sort: "title:asc",
  });

  const biomes = useMemo(() => {
    return (
      rangelandsData?.data?.reduce<Record<string, string | undefined>>((acc, curr) => {
        const code = curr.code;
        if (!!code && (rangelandRegions.length === 0 || rangelandRegions.includes(code))) {
          return {
            ...acc,
            [code]: curr.color,
          };
        }
        return acc;
      }, {}) ?? {}
    );
  }, [rangelandRegions, rangelandsData]);
  return biomes;
};

export const useEcoregions = () => {
  const [rangelandRegions] = useSyncRangelandRegions();
  const { data: rangelandsData } = useGetRangelands({
    populate: "*",
    sort: "title:asc",
  });

  const ecoregions = useMemo(() => {
    return (
      rangelandsData?.data?.reduce((acc, curr) => {
        const e: Record<string, string | undefined> = {};
        curr.ecoregions?.forEach((eco) => {
          const code = eco.code;
          if (!!code && (rangelandRegions.length === 0 || rangelandRegions.includes(code))) {
            e[code] = eco.color;
          }
        });
        return {
          ...acc,
          ...e,
        };
      }, {}) ?? {}
    );
  }, [rangelandRegions, rangelandsData]);

  return ecoregions;
};
