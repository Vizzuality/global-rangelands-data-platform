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
      rangelandsData?.data
        ?.map((r) => +(r.attributes?.code || 0) ?? [])
        ?.filter((r) => {
          if (rangelandRegions.length === 0) return true;
          return rangelandRegions.includes(`${r}`);
        }) ?? []
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
      rangelandsData?.data
        ?.map((r) => r.attributes?.ecoregions?.data?.map((e) => +(e.attributes?.code || 0)) ?? [])
        ?.flat()
        ?.filter((r) => {
          if (rangelandRegions.length === 0) return true;
          return rangelandRegions.includes(`${r}`);
        }) ?? []
    );
  }, [rangelandRegions, rangelandsData]);

  return ecoregions;
};
