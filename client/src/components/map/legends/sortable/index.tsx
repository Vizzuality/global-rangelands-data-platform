"use client";

import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  UniqueIdentifier,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Children,
  cloneElement,
  isValidElement,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";

type SortableListProps = PropsWithChildren & {
  className?: string;
  onChangeOrder: (newOrder: string[]) => void;
};

import SortableItem from "./item";
import { LegendItemProps } from "@/containers/map/legends/item";
import { useSyncLayersSettings } from "@/store/map";

export const SortableList = ({ children, onChangeOrder }: SortableListProps) => {
  const uid = useId();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [layersSettings, setLayersSettings] = useSyncLayersSettings();

  const ActiveItem = useMemo(() => {
    const activeChildArray = Children.map(children, (Child) => {
      if (isValidElement<LegendItemProps>(Child)) {
        const { props } = Child;
        const { id } = props;

        if (id === activeId) {
          return Child;
        }
        return null;
      }
      return null;
    });

    return activeChildArray?.length ? activeChildArray[0] : null;
  }, [children, activeId]);

  const itemsIds = useMemo(() => {
    return (
      Children?.map(children, (Child) => {
        if (isValidElement<LegendItemProps>(Child)) {
          const { props } = Child;
          const { id } = props;
          return id;
        }
      }) || []
    );
  }, [children]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    if (!active) return;
    setActiveId(active.id);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (active.id !== over?.id) {
        // @ts-expect-error: active.id is number so can be a UniqueIdentifier
        const oldIndex = itemsIds?.indexOf(active.id) || 0;
        // @ts-expect-error: over.id is number so can be a UniqueIdentifier
        const newIndex = itemsIds?.indexOf(over?.id) || 0;
        if (onChangeOrder) {
          const newArr = arrayMove(itemsIds || [], oldIndex, newIndex);
          onChangeOrder(newArr);
        }
      }

      if (active.id === "environmental-justice" || over?.id === "environmental-justice") {
        setLayersSettings((prev) => {
          if (!active.id || !over?.id) return prev;
          return {
            ...prev,
            [active.id]: {
              ...(prev ? prev[active.id] : {}),
              beforeIdIndex: null,
            },
            [over.id]: {
              ...(prev ? prev[over.id] : {}),
              beforeIdIndex: null,
            },
          };
        });
      }
    },
    [itemsIds, onChangeOrder],
  );

  return (
    <DndContext
      id={uid}
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToWindowEdges, restrictToParentElement]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={itemsIds} strategy={verticalListSortingStrategy}>
        {Children.map(children, (Child) => {
          if (isValidElement<LegendItemProps>(Child)) {
            const {
              props: { id },
            } = Child;

            return <SortableItem id={id || ""}>{cloneElement(Child as ReactElement)}</SortableItem>;
          }
          return null;
        })}
      </SortableContext>

      {/* The portal is needed to avoid a style issue with the drag overlay   */}
      {createPortal(
        <DragOverlay>
          {isValidElement(ActiveItem) && (
            <div className="max-h-[200px] overflow-visible">
              {cloneElement(ActiveItem as ReactElement)}
            </div>
          )}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  );
};

export default SortableList;
