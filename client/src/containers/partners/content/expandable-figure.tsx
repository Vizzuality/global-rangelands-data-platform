"use client";

import Image, { type StaticImageData } from "next/image";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import FigureExpandIcon from "@/svgs/partner-pages/figure-expand.svg";

type ExpandableFigureProps = {
  src: StaticImageData;
  alt: string;
  caption: string;
  expandLabel: string;
  closeLabel: string;
  className?: string;
  sizes: string;
};

const ExpandableFigure = ({
  src,
  alt,
  caption,
  expandLabel,
  closeLabel,
  className,
  sizes,
}: ExpandableFigureProps) => (
  <Dialog>
    <div className={cn("relative", className)}>
      <Image src={src} alt={alt} sizes={sizes} className="h-auto w-full" />
      <DialogTrigger
        aria-label={`${expandLabel}: ${alt}`}
        className="absolute left-2.5 top-2.5 rounded-full drop-shadow-[0px_3.2px_1.6px_rgba(0,0,0,0.15)] transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-dark"
      >
        <FigureExpandIcon aria-hidden />
      </DialogTrigger>
    </div>
    <DialogPortal>
      <DialogOverlay className="bg-black/80" />
      <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-[22px] bg-white px-6 pb-6 pt-14 text-green-dark">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <div
          className="flex flex-col gap-4"
          style={{
            width: `min(calc(90vw - 3rem), calc((90vh - 9rem) * ${src.width / src.height}))`,
          }}
        >
          <Image src={src} alt="" sizes="90vw" className="h-auto w-full" />
          <DialogDescription className="text-xs font-light leading-4 text-green-dark">
            {caption}
          </DialogDescription>
        </div>
        <DialogClose className="absolute right-5 top-5 rounded-full text-brown-dark transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brown-dark">
          <X className="h-6 w-6" aria-hidden />
          <span className="sr-only">{closeLabel}</span>
        </DialogClose>
      </DialogPrimitive.Content>
    </DialogPortal>
  </Dialog>
);

export default ExpandableFigure;
