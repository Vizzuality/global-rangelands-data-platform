import CircleLegend from "@/components/ui/circle-legend";
import { LegendComponent } from "../../types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDownIcon } from "lucide-react";

type LegendComponentProps = {
  items: LegendComponent["items"];
};

const BasicLegend = ({ items }: LegendComponentProps) => {
  return (
    <ul className="space-y-2">
      {items?.map((i) => (
        <li key={i.name} className="flex gap-4">
          {i.items ? (
            <Collapsible>
              <CollapsibleTrigger className="group flex gap-2.5">
                <ChevronDownIcon className="h-4 w-4 flex-shrink-0 opacity-50 group-data-[state=open]:rotate-180" />
                {!!i.color && <CircleLegend className="h-3.5 w-3.5" colors={[i.color]} />}
                <span className="text-start text-xs font-light">{i.name}</span>
              </CollapsibleTrigger>
              <CollapsibleContent asChild>
                <ul className="space-y-1.5 pl-12 pt-2">
                  {i.items.map((subItem) => (
                    <li key={subItem.name} className="flex gap-2.5">
                      {!!subItem.color && (
                        <CircleLegend className="h-3.5 w-3.5" colors={[subItem.color]} />
                      )}
                      <span className="text-xs font-light">{subItem.name}</span>
                    </li>
                  ))}
                </ul>
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <>
              {!!i.color && <CircleLegend colors={[i.color]} />}
              <span className="text-xs font-light">{i.name}</span>
            </>
          )}
        </li>
      ))}
    </ul>
  );
};

export default BasicLegend;
