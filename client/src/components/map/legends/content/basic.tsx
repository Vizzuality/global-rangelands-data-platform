import CircleLegend from "@/components/ui/circle-legend";
import { LegendComponent } from "../../types";

type LegendComponentProps = {
  items: LegendComponent["items"];
};

const BasicLegend = ({ items }: LegendComponentProps) => {
  return (
    <ul className="space-y-2">
      {items?.map((i) => (
        <li key={i.name} className="flex gap-4">
          {!!i.color && <CircleLegend colors={[i.color]} />}
          <span className="text-xs font-light">{i.name}</span>
        </li>
      ))}
    </ul>
  );
};

export default BasicLegend;
