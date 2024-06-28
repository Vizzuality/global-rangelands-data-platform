"use client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSyncDatasets } from "@/store/map";
import { Layers3Icon } from "lucide-react";
import LegendItem from "./item";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  ScrollArea,
  ScrollAreaCorner,
  ScrollAreaThumb,
  ScrollAreaViewport,
  Scrollbar,
} from "@radix-ui/react-scroll-area";

const Legends = () => {
  const [datasets] = useSyncDatasets();
  const [open, setOpen] = useState(true);

  return (
    <div>
      <Popover open={open}>
        <PopoverTrigger asChild>
          <Button
            onClick={() => setOpen(!open)}
            variant="ghost"
            className="transition-color block h-min rounded-full border-2 border-background bg-background px-2 py-2 shadow-black/10 drop-shadow-md duration-300 hover:bg-orange-100 focus-visible:bg-global data-[state=open]:bg-global"
          >
            <Layers3Icon className="h-5 w-5 stroke-foreground stroke-[1.5px]" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          alignOffset={20}
          sideOffset={20}
          side="left"
          className="w-[348px] -translate-y-10 rounded-lg bg-background px-0 py-0 shadow-lg drop-shadow-2xl"
        >
          <ScrollArea type="scroll" className="relative overflow-hidden">
            <ScrollAreaViewport className="max-h-[70vh] w-full">
              <div className="my-6 space-y-4 px-6">
                {datasets?.map((d) => <LegendItem key={d} dataset={d} />)}
              </div>
              <div className="absolute bottom-0 z-50 h-7 w-[calc(100%-8px)] translate-y-2 bg-background blur-sm"></div>
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
