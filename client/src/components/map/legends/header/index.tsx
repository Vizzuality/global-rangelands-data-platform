import { ChevronDown, GridIcon, GripVerticalIcon } from "lucide-react";
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
}: LegendHeaderProps) => {
  return (
    <div>
      <div className="aitems-center flex gap-2">
        <div className="flex flex-1 items-start">
          {sortable && (
            <button
              aria-label="drag"
              type="button"
              className="text-primary-foreground mt-1 cursor-grabbing transition-colors"
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
          <Button onClick={handleChangeIsOpen} variant="link" className="h-fit px-0 py-0">
            <ChevronDown className="h-5 w-5 shrink-0 group-data-[state=closed]:rotate-180" />
          </Button>
        </div>
      </div>
      {subtitle && <span className="px-4 text-xs">{subtitle}</span>}
    </div>
  );
};

export default LegendHeader;
