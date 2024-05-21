import { PropsWithChildren } from "react";
import { ChevronDown } from "lucide-react";
import GlobeSvg from "@/svgs/globe.svg";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const MapControls = ({ children }: PropsWithChildren) => {
  return (
    <Collapsible  className="relative space-y-1.5 rounded-[20px] data-[state=open]:bg-background">
      <CollapsibleTrigger className="group flex items-center gap-2 px-2.5 py-1.5 text-sm transition-all duration-300 hover:bg-background focus-visible:border-2 focus-visible:border-orange-100 rounded-[20px] border-2 border-orange-100/0 hover:border-background focus-visible:bg-background focus-visible:outline-0">
        <GlobeSvg className="fill-globe" />
        Map style
        <ChevronDown className="w-5 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pb-3 px-3 text-sm">{children}</CollapsibleContent>
    </Collapsible>
  );
};

export default MapControls;
  