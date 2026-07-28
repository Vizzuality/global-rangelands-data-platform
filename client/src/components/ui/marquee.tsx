"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: ReactNode;
  ariaLabel: string;
  speed?: number;
  scrubSpeed?: number;
  scrub?: number;
  paused?: boolean;
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
  paused = false,
  fade = false,
  className,
  gapClassName,
}: MarqueeProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const hoveringRef = useRef(false);
  const pausedRef = useRef(paused);
  const scrubRef = useRef(scrub);
  const loopWidthRef = useRef(0);
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    scrubRef.current = scrub;
  }, [scrub]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    const firstCopy = el?.firstElementChild as HTMLElement | null;
    if (!el || !firstCopy) return;

    const measure = () => {
      const gap = Number.parseFloat(getComputedStyle(el).columnGap) || 0;
      loopWidthRef.current = firstCopy.getBoundingClientRect().width + gap;
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    observer.observe(firstCopy);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || reducedMotion) return;

    let frame = 0;
    const tick = () => {
      const loop = loopWidthRef.current;
      const scrubbing = scrubRef.current !== 0;
      const shouldPause = hoveringRef.current || pausedRef.current;
      if (loop > 0 && (scrubbing || !shouldPause)) {
        el.scrollLeft += scrubbing ? scrubSpeed * scrubRef.current : speed;
        if (el.scrollLeft >= loop) el.scrollLeft -= loop;
        else if (el.scrollLeft <= 0) el.scrollLeft += loop;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [speed, scrubSpeed, reducedMotion]);

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
