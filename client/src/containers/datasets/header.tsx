"use client";

// import { useSyncDatasets } from "@/app/store";
import { Button } from "@/components/ui/button";

const DatasetsHeader = () => {
  // const [datasets] = useSyncDatasets();

  return (
    <header className="space-y-3 text-center">
      <h1 className="text-[54px] font-bold">Rangelands</h1>
      <h2 className="text-xl font-medium">Grasslands vital for biodiversity.</h2>
      <p className="text-sm leading-relaxed">
        Rangelands are expansive areas characterized by a variety of vegetation, including grasses,
        shrubs, and occasional trees.
      </p>
      <Button variant="default">Know more</Button>
    </header>
  );
};

export default DatasetsHeader;
