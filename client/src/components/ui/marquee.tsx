"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: ReactNode;
  ariaLabel: string;
  speed?: number;
  scrubSpeed?: number;
  scrub?: number;
  fade?: boolean;
  className?: string;
  gapClassName?: string;
}

const Marquee = ({
  children,
  ariaLabel,
  speed = 0.5,
  scrubSpeed = 8,
  scrub = 0,
  fade = false,
  className,
  gapClassName,
}: MarqueeProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hoveringRef = useRef(false);
  const scrubRef = useRef(scrub);

  useEffect(() => {
    scrubRef.current = scrub;
  }, [scrub]);

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
      const loop = loopWidth();
      const scrubbing = scrubRef.current !== 0;
      if (loop > 0 && (scrubbing || !hoveringRef.current)) {
        el.scrollLeft += scrubbing ? scrubSpeed * scrubRef.current : speed;
        if (el.scrollLeft >= loop) el.scrollLeft -= loop;
        else if (el.scrollLeft <= 0) el.scrollLeft += loop;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [speed, scrubSpeed]);

  return (
    <section
      aria-label={ariaLabel}
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => (hoveringRef.current = true)}
      onMouseLeave={() => (hoveringRef.current = false)}
    >
      {fade && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-background to-transparent" />
        </>
      )}
      <div ref={scrollRef} className={cn("flex flex-nowrap overflow-x-hidden", gapClassName)}>
        <div className={cn("flex shrink-0 items-center", gapClassName)}>{children}</div>
        <div className={cn("flex shrink-0 items-center", gapClassName)} aria-hidden="true">
          {children}
        </div>
      </div>
    </section>
  );
};

export default Marquee;
