"use client";

import { useGetDatasets } from "@/types/generated/dataset";
import DatasetsItem from "@/containers/datasets/item";
import DatasetsHeader from "./header";

const Datasets = () => {
  const { data: datasetsData } = useGetDatasets({
    populate: ["layers", "layers.layer"],
  });

  return (
    <div className="mb-10 space-y-10">
      <DatasetsHeader />
      <div className="space-y-7">
        {datasetsData?.data?.map((dataset) => (
          <div key={dataset?.id} className="group space-y-7">
            <DatasetsItem {...dataset} className="px-6" />
            <div className="w-full border-b border-slate-200 group-last-of-type:hidden" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Datasets;
