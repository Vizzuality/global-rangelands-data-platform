import { ChevronDown, GripVerticalIcon } from "lucide-react";
import { LayerInfo, LayerOpacity, LayerVisibility } from "./buttons";
import { Button } from "@/components/ui/button";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { DraggableAttributes } from "@dnd-kit/core";

type LegendHeaderProps = {
  title?: string;
  subtitle?: string;
  setOpacity: (o: number) => void;
  opacity?: number;
  setVisibility: (v: boolean) => void;
  visible: boolean;
  info?: string;
  handleChangeIsOpen: () => void;
  listeners?: SyntheticListenerMap | undefined;
  attributes?: DraggableAttributes;
  sortable?: boolean;
  isOpen?: boolean;
};

const LegendHeader = ({
  title,
  subtitle,
  setOpacity,
  setVisibility,
  info,
  opacity,
  visible,
  handleChangeIsOpen,
  attributes,
  listeners,
  sortable,
  isOpen,
}: LegendHeaderProps) => {
  return (
    <div>
      <div className="flex gap-2">
        <div className="flex flex-1 items-start gap-0">
          {sortable && (
            <button
              aria-label="drag"
              type="button"
              className="mt-0.5 flex h-5 w-5 -translate-x-1 cursor-grabbing items-center justify-center rounded-full text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
              {...listeners}
              {...attributes}
            >
              <GripVerticalIcon className="h-4 w-4" />
            </button>
          )}
          <span className="flex-1 font-medium">{title}</span>
        </div>
        <div className="mt-1 flex gap-2">
          <LayerOpacity onChangeOpacity={setOpacity} opacity={opacity} />
          {!!info && <LayerInfo info={info} title={title} />}
          <LayerVisibility onChangeVisibility={setVisibility} visible={visible} />
          <Button
            onClick={handleChangeIsOpen}
            aria-label="toggle legend visibility"
            data-state={isOpen ? "open" : "closed"}
            variant="link"
            className="group h-5 w-5 rounded-full px-0 py-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300 focus-visible:ring-offset-0"
          >
            <ChevronDown className="h-5 w-5 shrink-0 transition-all duration-300 hover:text-hunter-green-400 group-data-[state=open]:-rotate-180" />
          </Button>
        </div>
      </div>
      {subtitle && <span className="px-4 text-xs">{subtitle}</span>}
    </div>
  );
};

export default LegendHeader;
