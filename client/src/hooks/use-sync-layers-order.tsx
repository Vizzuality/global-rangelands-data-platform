import { useSyncDatasets, useSyncLayers } from "@/store/map";
import { useGetDatasets } from "@/types/generated/dataset";
import { useEffect } from "react";

const useSyncLayersOrder = () => {
  const [syncDatasets] = useSyncDatasets();
  const [, setSyncLayers] = useSyncLayers();

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
        const datasetLayers = dataset.attributes?.layers?.map(
          (layer) => layer.layer?.data?.attributes?.slug,
        );

        const datasetLayerSlug = dataset?.attributes?.layers?.find((layer) => {
          return datasetLayers?.includes(layer.layer?.data?.attributes?.slug);
        })?.layer?.data?.attributes?.slug;

        const index = !!dataset.attributes?.slug && syncDatasets?.indexOf(dataset.attributes?.slug);

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
