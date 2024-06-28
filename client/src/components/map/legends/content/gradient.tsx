import { LegendComponent } from "../../types";
import { cn } from "@/lib/utils";

type LegendComponentProps = {
  items: LegendComponent["items"];
};

const GradientLegend = ({ items }: LegendComponentProps) => {
  return (
    <div>
      <div
        className="flex h-2 w-full rounded-full"
        style={{
          backgroundImage: `linear-gradient(to right, ${items.map((i) => i.color).join(",")})`,
        }}
      />
      <ul className="mt-1 flex w-full justify-between">
        {items
          .filter(({ name }) => typeof name !== "undefined" && name !== null)
          .map(({ name }) => (
            <li
              key={`${name}`}
              className={cn({
                "flex-shrink-0 text-xs font-light text-foreground": true,
              })}
            >
              {name}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default GradientLegend;
