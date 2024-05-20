import { PropsWithChildren } from "react";
import { ChevronDown } from "lucide-react";
import GlobeSvg from "@/svgs/globe.svg";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const MapControls = ({ children }: PropsWithChildren) => {
  return (
    <Collapsible className="relative space-y-4 rounded-[20px] px-3 py-2 text-sm transition-colors duration-300 hover:bg-background data-[state=open]:bg-background data-[state=open]:pb-3">
      <CollapsibleTrigger className="group flex items-center gap-2">
        <GlobeSvg className="fill-globe" />
        Map style
        <ChevronDown className="w-5 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3">{children}</CollapsibleContent>
    </Collapsible>
  );
};

export default MapControls;
