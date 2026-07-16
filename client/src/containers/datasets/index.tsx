"use client";

import DatasetsItem from "@/containers/datasets/item";
import DatasetsHeader, { CategoryButtonProps } from "./header";
import { useGetLocalizedList } from "@/lib/localized-query";
import { useGetDatasetCategories } from "@/types/generated/dataset-category";
import { RANGELAND_DATASET_SLUG } from "./constants";
import { useMemo } from "react";
import { Dataset } from "@/types/generated/strapi.schemas";

const Datasets = () => {
  const datasetCategoriesQuery = useGetDatasetCategories({
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
  const { data: datasetCategoriesData } = useGetLocalizedList(datasetCategoriesQuery);

  const categories = useMemo(
    () =>
      datasetCategoriesData?.data?.reduce<CategoryButtonProps[]>(
        (acc, category) =>
          category.title && category.slug
            ? [...acc, { slug: category.slug, title: category.title }]
            : acc,
        [],
      ),
    [datasetCategoriesData],
  );

  return (
    <div>
      <DatasetsHeader categories={categories} />
      <div className="">
        {datasetCategoriesData?.data?.map((category) => (
          <div
            key={category.id}
            className="space-y-5 border-b border-b-foreground last-of-type:border-b-0"
          >
            <h2 id={category?.slug} className="px-6 pt-6 font-serif text-2xl text-green-light">
              {category?.title}
            </h2>
            <div className="">
              {category?.datasets?.map((dataset) => (
                <div key={dataset?.id} className="space-y-7 pt-6 first-of-type:pt-0">
                  <DatasetsItem
                    {...(dataset as Dataset)}
                    className="px-6"
                    showTitle={dataset.slug !== RANGELAND_DATASET_SLUG}
                  />
                  <div className="w-full border-b border-slate-200 group-last-of-type:hidden" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Datasets;
