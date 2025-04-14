import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

type OpenCloseArrowProps = {
  className?: string;
};
const OpenCloseArrow = ({ className }: OpenCloseArrowProps) => (
  <ChevronDown className={cn("h-5 w-5 shrink-0 group-data-[state=open]:rotate-180", className)} />
);

export default OpenCloseArrow;
