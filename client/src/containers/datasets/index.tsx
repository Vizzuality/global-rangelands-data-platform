"use client";

import { useGetDatasets } from "@/types/generated/dataset";
import DatasetsItem from "@/containers/datasets/item";
import DatasetsHeader from "./header";
import { useEffect } from "react";
import { useSyncDatasets, useSyncLayers } from "@/store/map";

type DatasetsProps = {
  categoryId: number;
};

const Datasets = () => {
  const { data: datasetsData } = useGetDatasets({
    populate: ["layers", "layers.layer"],
    publicationState: "preview",
  });

  const [datasets, setDatasets] = useSyncDatasets();
  const [layers, setLayers] = useSyncLayers();

  // Set the rangelands dataset as the default one when the page loads
  useEffect(() => {
    if (datasets?.length) {
      return;
    }
    if (datasetsData?.data?.length) {
      const defaultDataset = datasetsData.data.find(
        (dataset) => dataset?.attributes?.type === "Group",
      );

      if (defaultDataset?.id) {
        setDatasets([defaultDataset.id]);
        const defaultLayer = defaultDataset?.attributes?.layers[0];

        if (defaultLayer?.id) {
          setLayers([defaultLayer.id]);
        }
      }
    }
  }, [datasetsData]);

  return (
    <div className="space-y-4">
      <DatasetsHeader />
      {datasetsData?.data?.map((dataset) => <DatasetsItem key={dataset?.id} {...dataset} />)}
    </div>
  );
};

export default Datasets;
