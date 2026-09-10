import { cn } from "@/lib/utils";

type StoryIntroTipProps = {
  edge: "top" | "bottom";
  accentClassName: string;
  outlineClassName: string;
};

const StoryIntroTip = ({ edge, accentClassName, outlineClassName }: StoryIntroTipProps) => (
  <div
    aria-hidden
    className={cn(
      "pointer-events-none absolute inset-x-0 h-20 overflow-hidden",
      edge === "top" ? "top-0 -translate-y-full" : "bottom-0 translate-y-full",
    )}
  >
    <div
      className={cn(
        "absolute left-1/2 size-[113px] -translate-x-1/2 rotate-45",
        edge === "top" ? "bottom-0 translate-y-1/2" : "top-0 -translate-y-1/2",
        accentClassName,
      )}
    />
    <div
      className={cn(
        "absolute left-1/2 size-[102px] -translate-x-1/2 rotate-45 border-[5px]",
        edge === "top"
          ? "bottom-0 translate-y-[calc(50%+26px)]"
          : "top-0 -translate-y-[calc(50%+26px)]",
        outlineClassName,
      )}
    />
  </div>
);

export default StoryIntroTip;
