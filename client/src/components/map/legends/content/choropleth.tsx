import React, { useMemo } from "react";

import { LegendComponent } from "../../types";

type LegendComponentProps = {
  items: LegendComponent["items"];
};

export const LegendChoropleth: React.FC<LegendComponentProps> = ({ items }) => {
  const validItems = useMemo(() => items?.filter(({ color }) => color) || [], [items]);
  return (
    <div>
      <ul className="flex w-full overflow-hidden rounded-full">
        {validItems?.map(({ color }) => (
          <li
            key={`${color}`}
            className="h-2 flex-shrink-0"
            style={{
              width: `${100 / validItems?.length || 1}%`,
              backgroundColor: color,
            }}
          />
        ))}
      </ul>

      <ul className="mt-1 flex w-full">
        {validItems?.map(({ name }) => (
          <li
            key={`${name}`}
            className="flex-shrink-0 text-center text-xs"
            style={{
              width: `${100 / validItems?.length || 1}%`,
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
