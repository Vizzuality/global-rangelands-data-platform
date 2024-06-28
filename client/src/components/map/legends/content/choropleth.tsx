import React from "react";

import { LegendComponent } from "../../types";

type LegendComponentProps = {
  items: LegendComponent["items"];
};

export const LegendChoropleth: React.FC<LegendComponentProps> = ({ items }) => {
  return (
    <div>
      <ul className="flex w-full overflow-hidden rounded-full">
        {items.map(({ color }) => (
          <li
            key={`${color}`}
            className="h-2 flex-shrink-0"
            style={{
              width: `${100 / items.length}%`,
              backgroundColor: color,
            }}
          />
        ))}
      </ul>

      <ul className="mt-1 flex w-full">
        {items.map(({ name }) => (
          <li
            key={`${name}`}
            className="flex-shrink-0 text-center text-xs"
            style={{
              width: `${100 / items.length}%`,
            }}
          >
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LegendChoropleth;
