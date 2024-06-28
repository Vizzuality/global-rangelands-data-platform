import { ChevronDown } from "lucide-react";
import { LayerInfo, LayerOpacity, LayerVisibility } from "./buttons";
import { Button } from "@/components/ui/button";

type LegendHeaderProps = {
  title?: string;
  subtitle?: string;
  setOpacity: (o: number) => void;
  opacity?: number;
  setVisibility: (v: boolean) => void;
  visible: boolean;
  info?: string;
  handleChangeIsOpen: () => void;
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
}: LegendHeaderProps) => {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="flex-1 font-medium">{title}</span>
        <LayerOpacity onChangeOpacity={setOpacity} opacity={opacity} />
        {!!info && <LayerInfo info={info} title={title} />}
        <LayerVisibility onChangeVisibility={setVisibility} visible={visible} />
        <Button onClick={handleChangeIsOpen} variant="link" className="h-fit px-0 py-0">
          <ChevronDown className="h-5 w-5 shrink-0 group-data-[state=open]:rotate-180" />
        </Button>
      </div>
      {subtitle && <span className="text-xs">{subtitle}</span>}
    </div>
  );
};

export default LegendHeader;
