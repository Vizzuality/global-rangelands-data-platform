import { cn } from "@/lib/utils";

type CircleLegendProps = {
  colors: string[];
  selected: boolean;
};

const CircleLegend = ({ colors, selected }: CircleLegendProps) => {
  const gradient = `linear-gradient(to right, ${colors.join(", ")})`;
  const color = colors[0];

  return (
    <div
      style={{ backgroundImage: gradient, backgroundColor: color }}
      className={cn(
        "h-4 w-4 flex-shrink-0 rounded-full",
        selected && "border-[1.5px] border-foreground",
      )}
    ></div>
  );
};

export default CircleLegend;
