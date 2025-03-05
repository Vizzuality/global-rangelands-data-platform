import { useMemo } from "react";
import { LegendComponent } from "../../types";

type LegendComponentProps = {
  items: LegendComponent["items"];
};

const GradientLegend = ({ items }: LegendComponentProps) => {
  const gradient = useMemo(
    () =>
      items
        ?.reduce<string[]>((acc, { color }) => (color ? [...acc, color] : acc), [])
        ?.join(", " || ""),
    [items],
  );

  const labels = useMemo(
    () => items?.filter(({ name }) => typeof name !== "undefined" && name !== null),
    [items],
  );

  return (
    <div>
      <div
        className="flex h-2 w-full rounded-full"
        style={{
          backgroundImage: `linear-gradient(to right, ${gradient})`,
        }}
      />
      <ul className="mt-1 flex w-full justify-between">
        {labels?.map(({ name }) => (
          <li
            key={`${name}`}
            className="flex-1 flex-shrink-0 text-center text-xs font-light text-foreground first-of-type:text-start last-of-type:text-end"
          >
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GradientLegend;
