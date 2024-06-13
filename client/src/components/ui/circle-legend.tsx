import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";

export type CircleLegendProps = {
  colors?: string[];
  selected?: boolean;
  removable?: boolean;
};

const CircleLegend = ({ colors, selected, removable = true }: CircleLegendProps) => {
  if (!colors?.length) return null;

  const stripeGradient = colors.map((color, i) => {
    const p1 = (100 / colors.length) * i;
    const p2 = (100 / colors.length) * (i + 1);
    return `${color} ${p1}%, ${color} ${p2}%`;
  });

  const style = {
    ...(colors.length > 1
      ? { backgroundImage: `linear-gradient(to right, ${stripeGradient.join(", ")})` }
      : { backgroundColor: colors[0] }),
  };
  return (
    <div
      style={style}
      className={cn(
        "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full",
        selected && "border-[1.5px] border-foreground",
      )}
    >
      {selected && removable && <XIcon className="h-3 w-3 flex-shrink-0" />}
    </div>
  );
};

export default CircleLegend;
