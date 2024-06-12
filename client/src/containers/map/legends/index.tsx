import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSyncDatasets } from "@/store/map";
import { Layers3Icon } from "lucide-react";
import LegendItem from "./item";
import { Button } from "@/components/ui/button";

const Legends = () => {
  const [datasets] = useSyncDatasets();

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
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
          className="w-[348px] -translate-y-10 space-y-4 bg-background"
        >
          {datasets?.map((d) => <LegendItem key={d} dataset={d} />)}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Legends;
