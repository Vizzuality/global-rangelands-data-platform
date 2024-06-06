"use client";

import { useGetDatasets } from "@/types/generated/dataset";
import DatasetsItem from "@/containers/datasets/item";
import DatasetsHeader from "./header";

const Datasets = () => {
  const { data: datasetsData } = useGetDatasets({
    populate: ["layers", "layers.layer"],
    publicationState: "preview",
  });

  return (
    <div className="space-y-4">
      <DatasetsHeader />
      {datasetsData?.data?.map((dataset) => <DatasetsItem key={dataset?.id} {...dataset} />)}
    </div>
  );
};

export default Datasets;
