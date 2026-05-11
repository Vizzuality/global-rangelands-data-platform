import CircleLegend from "@/components/ui/circle-legend";
import { LegendComponent } from "../../types";
import { FC } from "react";

type LegendComponentProps = {
  items: LegendComponent["items"];
};

const LegendList: FC<LegendComponentProps> = ({ items }) => (
  <ul className="space-y-2">
    {items?.map((i) => (
      <li key={i.name} className="flex gap-4">
        {!!i.color && i.style === "outline" ? (
          <div
            className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300"
            style={{ borderColor: i.color }}
          ></div>
        ) : i.color ? (
          <CircleLegend colors={[i.color]} />
        ) : null}
        <span className="text-xs font-light">{i.name}</span>
      </li>
    ))}
  </ul>
);

const BasicLegend = ({ items }: LegendComponentProps) => {
  const groups = Array.from(
    new Set(items.map((item) => item.group).filter((g): g is string => g !== undefined)),
  );

  if (groups.length > 0) {
    return (
      <div className="space-y-4">
        {groups.map((group) => (
          <div key={`legend-group-${group}`}>
            <h2 className="mb-2 text-xs font-normal">{group}</h2>
            <LegendList items={items.filter((item) => item.group === group)} />
          </div>
        ))}
      </div>
    );
  }

  return <LegendList items={items} />;
};

export default BasicLegend;
