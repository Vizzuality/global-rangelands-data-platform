"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface MarqueeHandle {
  scrub: (direction: number) => void;
  release: () => void;
}

interface MarqueeProps {
  children: ReactNode;
  ariaLabel: string;
  speed?: number;
  className?: string;
  gapClassName?: string;
}

const SCRUB_MULTIPLIER = 6;

const Marquee = forwardRef<MarqueeHandle, MarqueeProps>(function Marquee(
  { children, ariaLabel, speed = 0.5, className, gapClassName },
  ref,
) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hoveringRef = useRef(false);
  const scrubDirRef = useRef(0);

  useImperativeHandle(ref, () => ({
    scrub: (direction) => {
      scrubDirRef.current = direction;
    },
    release: () => {
      scrubDirRef.current = 0;
    },
  }));

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const loopWidth = () => {
      const firstCopy = el.firstElementChild as HTMLElement | null;
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      return firstCopy ? firstCopy.getBoundingClientRect().width + gap : 0;
    };

    let frame = 0;
    const tick = () => {
      const scrub = scrubDirRef.current;
      const delta =
        scrub !== 0 ? scrub * speed * SCRUB_MULTIPLIER : hoveringRef.current ? 0 : speed;
      const loop = loopWidth();
      if (loop > 0) {
        el.scrollLeft += delta;
        if (el.scrollLeft >= loop) el.scrollLeft -= loop;
        else if (el.scrollLeft < 0) el.scrollLeft += loop;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [speed]);

  return (
    <section
      aria-label={ariaLabel}
      className={cn("overflow-hidden", className)}
      onMouseEnter={() => (hoveringRef.current = true)}
      onMouseLeave={() => (hoveringRef.current = false)}
    >
      <div ref={scrollRef} className={cn("flex flex-nowrap overflow-x-hidden", gapClassName)}>
        <div className={cn("flex shrink-0 items-center", gapClassName)}>{children}</div>
        <div className={cn("flex shrink-0 items-center", gapClassName)} aria-hidden="true">
          {children}
        </div>
      </div>
    </section>
  );
});

export default Marquee;
