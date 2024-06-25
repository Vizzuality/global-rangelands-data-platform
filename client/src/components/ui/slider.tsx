"use client";

import * as React from "react";

import * as SliderPrimitive from "@radix-ui/react-slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipArrow,
  TooltipProvider,
} from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  const [tooltipOpen, setTooltipOpen] = React.useState(false);

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full border border-foreground bg-background">
        <SliderPrimitive.Range className="absolute h-full bg-foreground/50" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb>
        <TooltipProvider>
          <Tooltip open={tooltipOpen}>
            <TooltipTrigger
              onMouseEnter={() => setTooltipOpen(true)}
              onMouseLeave={() => setTooltipOpen(false)}
            >
              <div className="block h-3 w-3 rounded-full border-2 bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"></div>
            </TooltipTrigger>
            <TooltipContent
              align="center"
              side="bottom"
              className="z-50 w-10 bg-background p-1 text-center text-xs text-foreground drop-shadow-lg"
            >
              {(Number(props.value) * 100).toFixed(0)}%
              <TooltipArrow className="z-50 fill-background" width={10} height={5} />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  );
});
Slider.displayName = SliderPrimitive.Root.displayName;

export default Slider;
