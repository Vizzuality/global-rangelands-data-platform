"use client";

import type { ComponentType, SVGProps } from "react";
import Image, { type StaticImageData } from "next/image";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import {
  Dialog,
  DialogClose,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import FigureCollapseIcon from "@/svgs/partner-pages/figure-collapse.svg";
import FigureCollapseHoverIcon from "@/svgs/partner-pages/figure-collapse-hover.svg";
import FigureExpandIcon from "@/svgs/partner-pages/figure-expand.svg";
import FigureExpandHoverIcon from "@/svgs/partner-pages/figure-expand-hover.svg";

type SvgIcon = ComponentType<SVGProps<SVGSVGElement>>;

type ToggleIconProps = {
  Icon: SvgIcon;
  HoverIcon: SvgIcon;
};

const ToggleIcon = ({ Icon, HoverIcon }: ToggleIconProps) => (
  <>
    <span className="block group-hover:hidden group-focus-visible:hidden">
      <Icon aria-hidden />
    </span>
    <span className="hidden group-hover:block group-focus-visible:block">
      <HoverIcon aria-hidden />
    </span>
  </>
);

const TOGGLE_BUTTON_CLASS_NAME =
  "group absolute rounded-full drop-shadow-[0px_3.2px_1.6px_rgba(0,0,0,0.15)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

type ExpandableFigureProps = {
  src: StaticImageData;
  alt: string;
  expandLabel: string;
  collapseLabel: string;
  sizes: string;
  className?: string;
  expandedClassName?: string;
};

const ExpandableFigure = ({
  src,
  alt,
  expandLabel,
  collapseLabel,
  sizes,
  className,
  expandedClassName,
}: ExpandableFigureProps) => (
  <Dialog>
    <div className={cn("relative", className)}>
      <Image src={src} alt={alt} sizes={sizes} className="h-auto w-full" />
      <DialogTrigger
        aria-label={`${expandLabel}: ${alt}`}
        className={cn(
          TOGGLE_BUTTON_CLASS_NAME,
          "left-2.5 top-2.5 focus-visible:outline-green-dark",
        )}
      >
        <ToggleIcon Icon={FigureExpandIcon} HoverIcon={FigureExpandHoverIcon} />
      </DialogTrigger>
    </div>
    <DialogPortal>
      <DialogOverlay className="bg-black/80" />
      <DialogPrimitive.Content
        aria-describedby={undefined}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden",
          expandedClassName,
        )}
        style={{ width: `min(840px, 90vw, calc(90vh * ${src.width / src.height}))` }}
      >
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <Image src={src} alt="" sizes="840px" className="h-auto w-full" />
        <DialogClose
          aria-label={`${collapseLabel}: ${alt}`}
          className={cn(TOGGLE_BUTTON_CLASS_NAME, "left-[13px] top-[12.72px]")}
        >
          <ToggleIcon Icon={FigureCollapseIcon} HoverIcon={FigureCollapseHoverIcon} />
        </DialogClose>
      </DialogPrimitive.Content>
    </DialogPortal>
  </Dialog>
);

export default ExpandableFigure;
