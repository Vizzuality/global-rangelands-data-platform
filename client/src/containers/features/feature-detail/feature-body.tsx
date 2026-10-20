"use client";

import { useCallback, useRef, useState } from "react";

import { useTranslations } from "@/i18n";
import RichText, { type RichTextVariant } from "@/components/ui/rich-text";

type FeatureBodyProps = {
  description: string;
  variant?: RichTextVariant;
};

function getRichTextClassName(variant: RichTextVariant): string | undefined {
  return variant === "feature" ? "text-champion-ink [&>h2:nth-of-type(2)+*]:!mt-2" : undefined;
}

const FeatureBody = ({ description, variant = "default" }: FeatureBodyProps) => {
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
          expanded ? "text-body-16-loose" : "max-h-[592px] overflow-hidden text-body-16-loose"
        }
      >
        <RichText variant={variant} className={getRichTextClassName(variant)}>
          {description}
        </RichText>
      </div>

      {(isOverflowing || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-sm font-medium underline underline-offset-2 transition-opacity hover:opacity-80"
        >
          {expanded ? t("Read less") : t("Read more")}
        </button>
      )}
    </div>
  );
};

export default FeatureBody;
