import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PartnerButtonProps = {
  className?: string;
  children: ReactNode;
};

const PartnerButton = ({ className, children }: PartnerButtonProps) => (
  <Button
    asChild
    className={cn(
      "h-auto rounded-none bg-brown-dark px-6 py-3 text-base leading-6 hover:bg-brown-light",
      className,
    )}
  >
    {children}
  </Button>
);

export default PartnerButton;
