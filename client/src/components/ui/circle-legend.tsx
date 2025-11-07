import { cn } from "@/lib/utils";

export type CircleLegendProps = {
  colors?: string[];
  selected?: boolean;
  removable?: boolean;
  className?: string;
};

const CircleLegend = ({ colors, selected, className }: CircleLegendProps) => {
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
        "flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300",
        selected &&
          "border-[1.5px] border-foreground group-hover:border-white group-disabled:border-hunter-green-300 group-disabled:!bg-white group-disabled:![background-image:none] group-disabled:hover:border-hunter-green-300 ",
        className,
      )}
    ></div>
  );
};

export default CircleLegend;
