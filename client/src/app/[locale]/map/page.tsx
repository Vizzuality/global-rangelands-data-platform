import Datasets from "@/containers/datasets";
import Map from "@/containers/map";
import Sidebar from "@/containers/sidebar";
import getQueryClient from "@/lib/react-query/getQueryClient";
import { getGetDatasetCategoriesQueryOptions } from "@/types/generated/dataset-category";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

async function prefetchQueries() {
  const queryClient = getQueryClient();
  try {
    const { queryKey, queryFn } = getGetDatasetCategoriesQueryOptions({
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
      queryKey,
      queryFn,
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
    <HydrationBoundary state={dehydratedState}>
      <div className="flex h-[var(--content-height)] w-full overflow-y-hidden">
        <Sidebar>
          <Datasets />
        </Sidebar>
        <Map />
      </div>
    </HydrationBoundary>
  );
}
