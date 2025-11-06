"use client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSyncDatasets } from "@/store/map";
import { Layers3Icon } from "lucide-react";
import LegendItem from "./item";
import { Button } from "@/components/ui/button";
import {
  ScrollArea,
  ScrollAreaCorner,
  ScrollAreaThumb,
  ScrollAreaViewport,
  Scrollbar,
} from "@radix-ui/react-scroll-area";
import SortableList from "@/components/map/legends/sortable";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type LegendsProps = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
};
const Legends = ({ open, onOpenChange }: LegendsProps) => {
  const [datasets, setDatasets] = useSyncDatasets();

  console.log({ datasets });

  const currDatasets = useRef<string[]>(datasets);

  const handleSortChange = (newOrder: string[]) => {
    setDatasets(newOrder);
  };

  const [openLegends, setOpenLegends] = useState<string[]>(datasets);

  useEffect(() => {
    const newDataset = datasets.find((d) => !currDatasets.current.includes(d));
    if (newDataset) {
      setOpenLegends((prev) => [...prev, newDataset]);
    }
    currDatasets.current = datasets;
  }, [datasets]);

  return (
    <div>
      <Popover open={open}>
        <PopoverTrigger asChild>
          <Button
            onClick={() => onOpenChange(!open)}
            variant="ghost"
            className="transition-color block h-min rounded-full border-2 border-background bg-background px-2 py-2 shadow-black/10 drop-shadow-md duration-300 hover:bg-hunter-green-200 focus-visible:bg-global data-[state=open]:bg-green-light data-[state=open]:text-white"
          >
            <Layers3Icon className="h-5 w-5 stroke-[1.5px]" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={20}
          side="left"
          className="w-[348px] bg-background px-0 py-0 shadow-lg drop-shadow-2xl"
        >
          <ScrollArea type="always" className="relative">
            <ScrollAreaViewport className="max-h-[70vh] w-full">
              <div className="my-4 space-y-4 px-4">
                <SortableList onChangeOrder={handleSortChange}>
                  {datasets?.map((d, index) => (
                    <LegendItem
                      sortable
                      isOpen={openLegends.includes(d)}
                      onOpenChange={() => {
                        if (!openLegends.includes(d)) {
                          setOpenLegends((prev) => [...prev, d]);
                        } else {
                          setOpenLegends((prev) => prev.filter((l) => l !== d));
                        }
                      }}
                      key={d}
                      id={d}
                      dataset={d}
                      className={cn(
                        "border-b border-gray-300 pb-4",
                        index === datasets.length - 1 ? "border-b-0 pb-0" : "",
                      )}
                    />
                  ))}
                </SortableList>
              </div>
              <div className="absolute bottom-0 z-50 h-5 w-[calc(100%-8px)] bg-gradient-to-b from-background/0 to-background"></div>
            </ScrollAreaViewport>
            <Scrollbar className="w-1.5">
              <ScrollAreaThumb className="rounded-md bg-gray-300" />
            </Scrollbar>
            <ScrollAreaCorner />
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Legends;
