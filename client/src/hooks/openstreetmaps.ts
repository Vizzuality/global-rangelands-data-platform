import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

import { Bbox } from "@/components/map/types";
import { APIOpenStreetMapLocation } from "@/services/api/location-search";

export type Location = {
  boundingbox: Bbox;
  place_id: number;
  display_name: string;
  name: string;
};

const DEFAULT_QUERY_OPTIONS = {
  refetchOnWindowFocus: false,
  refetchOnMount: false,
  refetchOnReconnect: false,
  retry: false,
  staleTime: Infinity,
};
export function useOpenStreetMapsLocations(
  params?: {
    q: string;
    format: string;
    limit?: number;
  },
  queryOptions?: Partial<UseQueryOptions<Location[], Error>>,
) {
  const fetchOpenStreetMapsLocation = () =>
    APIOpenStreetMapLocation.request({
      method: "GET",
      url: "/search",
      params,
    }).then((response: AxiosResponse<Location[]>) => response.data);
  return useQuery({
    queryKey: ["openstreetmaps", params],
    queryFn: fetchOpenStreetMapsLocation,
    ...DEFAULT_QUERY_OPTIONS,
    ...queryOptions,
  });
}
