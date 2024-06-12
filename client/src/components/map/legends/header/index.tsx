import { LayerInfo, LayerOpacity, LayerVisibility } from "./buttons";

type LegendHeaderProps = {
  title?: string;
  subtitle?: string;
  setOpacity: (o: number) => void;
  opacity?: number;
  setVisibility: (v: boolean) => void;
  visible: boolean;
  info?: string;
};

const LegendHeader = ({
  title,
  subtitle,
  setOpacity,
  setVisibility,
  info,
  opacity,
  visible,
}: LegendHeaderProps) => {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="flex-1 font-medium">{title}</span>
        <LayerOpacity onChangeOpacity={setOpacity} opacity={opacity} />
        {!!info && <LayerInfo info={info} title={title} />}
        <LayerVisibility onChangeVisibility={setVisibility} visible={visible} />
      </div>
      {subtitle && <span className="text-xs">{subtitle}</span>}
    </div>
  );
};

export default LegendHeader;
