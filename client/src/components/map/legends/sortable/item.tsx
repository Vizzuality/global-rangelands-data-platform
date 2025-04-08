import React, { PropsWithChildren, ReactElement, cloneElement } from "react";

import { useSortable, verticalListSortingStrategy, SortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

export interface SortableItemProps extends PropsWithChildren {
  id: string;
}

export const SortableItem: React.FC<SortableItemProps> = ({ id, children }: SortableItemProps) => {
  const { attributes, listeners, transform, transition, isDragging, setNodeRef } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const CHILD = cloneElement(children as ReactElement, {
    listeners,
    attributes,
    isDragging,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn({
        "w-full": true,
        "opacity-0": isDragging,
      })}
      style={style}
    >
      {CHILD}
    </div>
  );
};

export default SortableItem;
