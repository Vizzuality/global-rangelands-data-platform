import { useSyncRangelandRegions } from "@/store/map";
import { useGetRangelands } from "@/types/generated/rangeland";
import { useMemo } from "react";

export const useBiomes = () => {
  const [rangelandRegions] = useSyncRangelandRegions();
  const { data: rangelandsData } = useGetRangelands({
    populate: "*",
    sort: "title:asc",
  });

  return useMemo(() => {
    return (
      rangelandsData?.data?.reduce<Record<string, string>>((acc, curr) => {
        const code = +(curr.attributes?.code || 0);
        if (rangelandRegions.length === 0 || rangelandRegions.includes(`${code}`)) {
          return {
            ...acc,
            [code]: curr.attributes?.color ?? undefined,
          };
        }
        return acc;
      }, {}) ?? {}
    );
  }, [rangelandRegions, rangelandsData]);
};

export const useEcoregions = () => {
  const [rangelandRegions] = useSyncRangelandRegions();
  const { data: rangelandsData } = useGetRangelands({
    populate: "*",
    sort: "title:asc",
  });

  return useMemo(() => {
    return (
      rangelandsData?.data?.slice(1)?.reduce<Record<string, string>>((acc, curr) => {
        const ecoregions =
          curr.attributes?.ecoregions?.data?.reduce<Record<string, string>>((a, c) => {
            const code = +(c.attributes?.code || 0);
            if (rangelandRegions.length === 0 || rangelandRegions.includes(`${code}`)) {
              return {
                ...a,
                [code]: c.attributes?.color ?? undefined,
              };
            }
            return a;
          }, {}) ?? {};
        return {
          ...acc,
          ...ecoregions,
        };
      }, {}) ?? {}
    );
  }, [rangelandRegions, rangelandsData]);
};
