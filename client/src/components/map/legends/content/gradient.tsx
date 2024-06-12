import CircleLegend from "@/components/circle-legend";
import { LegendComponent } from "../../types";

type LegendComponentProps = {
  items: LegendComponent["items"];
};

const GradientLegend = ({ items }: LegendComponentProps) => {
  return (
    <div>
      <ul>
        {items?.map((i) => (
          <li key={i.name} className="flex gap-4">
            {!!i.color && <CircleLegend colors={[i.color]} />}
            <span className="text-xs font-light">{i.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GradientLegend;
