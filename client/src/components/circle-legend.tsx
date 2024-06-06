import { cn } from "@/lib/utils";

type CircleLegendProps = {
  colors: string[];
  selected?: boolean;
};

const CircleLegend = ({ colors, selected }: CircleLegendProps) => {
  if (!colors?.length) return null;
  const style = {
    ...(colors.length > 1
      ? { backgroundImage: `linear-gradient(to right, ${colors.join(", ")})` }
      : { backgroundColor: colors[0] }),
  };
  return (
    <div
      style={style}
      className={cn(
        "h-4 w-4 flex-shrink-0 rounded-full",
        selected && "border-[1.5px] border-foreground",
      )}
    ></div>
  );
};

export default CircleLegend;
