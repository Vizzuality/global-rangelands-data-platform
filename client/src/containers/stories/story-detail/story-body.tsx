"use client";

import { useCallback, useRef, useState } from "react";

import { useTranslations } from "@/i18n";
import RichText from "@/components/ui/rich-text";

type StoryBodyProps = {
  description: string;
};

const StoryBody = ({ description }: StoryBodyProps) => {
  const t = useTranslations();
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const observerRef = useRef<ResizeObserver | null>(null);

  const measureRef = useCallback((el: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;

    if (!el) return;

    const measure = () => setIsOverflowing(el.scrollHeight > el.clientHeight);
    measure();

    // Async images inside RichText can grow the content after mount, so
    // re-measure whenever the element's own size changes (e.g. an <img> loads).
    observerRef.current = new ResizeObserver(measure);
    observerRef.current.observe(el);
  }, []);

  return (
    <div className="space-y-4">
      <div
        ref={measureRef}
        className={
          expanded ? "text-sm leading-6" : "max-h-[592px] overflow-hidden text-sm leading-6"
        }
      >
        <RichText>{description}</RichText>
      </div>

      {(isOverflowing || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-sm font-medium underline underline-offset-2 hover:text-green-light"
        >
          {expanded ? t("Read less") : t("Read more")}
        </button>
      )}
    </div>
  );
};

export default StoryBody;
