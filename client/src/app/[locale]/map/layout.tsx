import { Suspense } from "react";

import Map from "@/containers/map";
import Sidebar from "@/containers/sidebar";
import Header from "@/containers/header";
import getQueryClient from "@/lib/react-query/getQueryClient";
import { getGetDatasetCategoriesQueryOptions } from "@/types/generated/dataset-category";
import { getGetRangelandsQueryOptions } from "@/types/generated/rangeland";
import { getGetFeatureCategoriesQueryOptions } from "@/types/generated/feature-category";
import { getGetFeaturesQueryOptions } from "@/types/generated/feature";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

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

    const { queryKey: rangelandsQueryKey, queryFn: rangelandsQueryFn } =
      getGetRangelandsQueryOptions({
        populate: "*",
        sort: "title:asc",
        locale: "all",
      });

    await queryClient.prefetchQuery({
      queryKey: rangelandsQueryKey,
      queryFn: rangelandsQueryFn,
    });

    const { queryKey: featureCategoriesQueryKey, queryFn: featureCategoriesQueryFn } =
      getGetFeatureCategoriesQueryOptions({
        populate: [
          "translations",
          "features",
          "features.image",
          "features.category",
          "features.translations",
        ],
        sort: "id:asc",
      });

    await queryClient.prefetchQuery({
      queryKey: featureCategoriesQueryKey,
      queryFn: featureCategoriesQueryFn,
    });

    const { queryKey: featuresQueryKey, queryFn: featuresQueryFn } = getGetFeaturesQueryOptions({
      populate: ["translations", "image", "category"],
      sort: "id:asc",
    });

    await queryClient.prefetchQuery({
      queryKey: featuresQueryKey,
      queryFn: featuresQueryFn,
    });

    return dehydrate(queryClient);
  } catch (error) {
    console.info(error);
    return null;
  }
}

export default async function MapLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  await props.params;

  const dehydratedState = await prefetchQueries();

  return (
    <div>
      <HydrationBoundary state={dehydratedState}>
        <Header />
        <Suspense fallback={null}>
          <div className="flex h-[var(--content-height)] w-full overflow-y-hidden">
            <Sidebar>{props.children}</Sidebar>
            <Map />
          </div>
        </Suspense>
      </HydrationBoundary>
    </div>
  );
}
