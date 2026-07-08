import { useSyncDatasets, useSyncLayers } from "@/store/map";
import { useGetDatasets } from "@/types/generated/dataset";
import { useEffect } from "react";

const useSyncLayersOrder = () => {
  const [syncDatasets] = useSyncDatasets();
  const [layers, setSyncLayers] = useSyncLayers();

  const { data: datasetsData } = useGetDatasets({
    populate: ["layers", "layers.layer"],
    filters: {
      slug: {
        $in: syncDatasets,
      },
    },
  });

  useEffect(() => {
    if (datasetsData?.data?.length) {
      const orderedLayers = [...Array.from(syncDatasets)];

      datasetsData?.data?.forEach((dataset) => {
        const datasetLayers = dataset.layers?.map((layer) => layer.layer?.slug);

        const datasetLayerSlug = layers?.find((layer) => {
          return datasetLayers?.includes(layer);
        });

        const index = !!dataset.slug && syncDatasets?.indexOf(dataset.slug);

        if (datasetLayerSlug && typeof index === "number" && index >= 0) {
          orderedLayers[index] = datasetLayerSlug;
        }
      }, []);

      if (!orderedLayers?.length) return;

      setSyncLayers(orderedLayers);
    }
  }, [datasetsData]);
};

export default useSyncLayersOrder;
