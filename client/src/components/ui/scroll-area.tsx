"use client";

import * as React from "react";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { cn } from "@/lib/utils";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar className="w-1.5">
      <ScrollAreaPrimitive.Thumb className="bg-gray-300" />
    </ScrollBar>
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="bg-border relative flex-1 rounded-full" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

type ScrollAreaWithThumbProps = React.PropsWithChildren & {
  className?: string;
};
const ScrollAreaWithThumb = ({ children, className }: ScrollAreaWithThumbProps) => {
  return (
    <ScrollArea className={cn("relative", className)}>
      <ScrollAreaPrimitive.ScrollAreaViewport className="h-full w-full">
        {children}
        <div className="absolute bottom-0 z-50 h-12 w-[calc(100%-8px)] bg-gradient-to-b from-background/10 via-background/70 to-background"></div>
      </ScrollAreaPrimitive.ScrollAreaViewport>
      <ScrollAreaPrimitive.ScrollAreaScrollbar className="w-1.5">
        <ScrollAreaPrimitive.ScrollAreaThumb className="rounded-md bg-gray-300" />
      </ScrollAreaPrimitive.ScrollAreaScrollbar>
      <ScrollAreaPrimitive.ScrollAreaCorner />
    </ScrollArea>
  );
};

export { ScrollArea, ScrollBar, ScrollAreaWithThumb };
