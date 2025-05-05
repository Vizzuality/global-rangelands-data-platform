import Map from "@/containers/map";
import Sidebar from "@/containers/sidebar";
import getQueryClient from "@/lib/react-query/getQueryClient";
import { getGetDatasetCategoriesQueryOptions } from "@/types/generated/dataset-category";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import Header from "@/containers/header";
import { getGetRangelandsQueryOptions } from "@/types/generated/rangeland";

async function prefetchQueries() {
  const queryClient = getQueryClient();
  try {
    const { queryKey: datasetQueryKey, queryFn: datasetQueryFn } =
      getGetDatasetCategoriesQueryOptions({
        populate: [
          "translations",
          "datasets",
          "datasets.layers",
          "datasets.layers.layer",
          "datasets.sources",
          "datasets.citations",
          "datasets.translations",
        ],
        sort: "id:asc",
      });

    await queryClient.prefetchQuery({
      queryKey: datasetQueryKey,
      queryFn: datasetQueryFn,
    });

    const { queryKey: rangelandsQueryQuey, queryFn: rangelandsQueryFn } =
      getGetRangelandsQueryOptions({
        populate: "*",
        sort: "title:asc",
        locale: "all",
      });

    await queryClient.prefetchQuery({
      queryKey: rangelandsQueryQuey,
      queryFn: rangelandsQueryFn,
    });

    return dehydrate(queryClient);
  } catch (error) {
    console.info(error);
    return null;
  }
}

export default async function Home() {
  const dehydratedState = await prefetchQueries();
  return (
    <div>
      <HydrationBoundary state={dehydratedState}>
        <Header />
        <div className="flex h-[var(--content-height)] w-full overflow-y-hidden">
          <Sidebar />
          <Map />
        </div>
      </HydrationBoundary>
    </div>
  );
}
