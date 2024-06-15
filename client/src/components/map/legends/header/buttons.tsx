import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Toggle } from "@/components/ui/toggle";
import { CircleHelpIcon } from "lucide-react";
import OpacityIcon from "@/svgs/opacity.svg";
import Slider from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import EyeOffIcon from "@/svgs/eye-off.svg";
import EyeIcon from "@/svgs/eye.svg";

type LayerVisibilityProps = {
  onChangeVisibility: (v: boolean) => void;
  visible?: boolean;
};
const LayerVisibility = ({ onChangeVisibility, visible }: LayerVisibilityProps) => {
  return (
    <Toggle className="group h-min px-0" onPressedChange={onChangeVisibility} pressed={visible}>
      <EyeIcon className="h-5 w-5 fill-foreground group-data-[state=off]:hidden" />
      <EyeOffIcon className="h-5 w-5 fill-foreground group-data-[state=on]:hidden" />
    </Toggle>
  );
};

type LayerOpacityProps = {
  opacity?: number;
  onChangeOpacity: (o: number) => void;
};
const LayerOpacity = ({ opacity = 1, onChangeOpacity }: LayerOpacityProps) => (
  <Popover>
    <PopoverTrigger className="h-min">
      <OpacityIcon
        style={{
          opacity: opacity + 0.2,
        }}
        className="h-5 w-5 fill-foreground stroke-1"
      />
    </PopoverTrigger>
    <PopoverContent side="top" sideOffset={8} className="w-20 bg-background p-3">
      <Slider
        value={[opacity]}
        onValueChange={(v) => onChangeOpacity(v[0])}
        aria-label="Opacity"
        min={0}
        max={1}
        step={0.01}
      />
    </PopoverContent>
  </Popover>
);

type LayerInfoProps = {
  info?: string;
  title?: string;
};

const LayerInfo = ({ info, title }: LayerInfoProps) => (
  <Dialog>
    <DialogTrigger disabled={!info} className="h-min">
      <CircleHelpIcon className="h-5 w-5 stroke-foreground" />
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>{title}</DialogHeader>
      <p className="text-sm">{info}</p>
    </DialogContent>
  </Dialog>
);

export { LayerVisibility, LayerOpacity, LayerInfo };
