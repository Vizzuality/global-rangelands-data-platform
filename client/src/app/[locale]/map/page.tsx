import Datasets from "@/containers/datasets";
import Map from "@/containers/map";
import Sidebar from "@/containers/sidebar";
import getQueryClient from "@/lib/react-query/getQueryClient";
import { getGetDatasetsQueryOptions } from "@/types/generated/dataset";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

async function prefetchQueries() {
  const queryClient = getQueryClient();
  try {
    const { queryKey, queryFn } = getGetDatasetsQueryOptions({
      populate: ["layers", "layers.layer", "sources", "citations"],
      sort: "id:asc",
      locale: "all",
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
