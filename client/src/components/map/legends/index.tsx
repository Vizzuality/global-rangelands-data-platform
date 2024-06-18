import { ScrollBar } from "@/components/ui/scroll-area";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

import { PropsWithChildren } from "react";

const Legend = ({ children }: PropsWithChildren) => {
  return (
    <div>
      <ScrollAreaPrimitive.Root type="scroll" className="relative overflow-hidden">
        <ScrollAreaPrimitive.Viewport className="max-h-48 w-full">
          {children}
        </ScrollAreaPrimitive.Viewport>
        <ScrollBar />
        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>
    </div>
  );
};

export default Legend;
