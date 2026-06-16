"use client";

import { Marker } from "react-map-gl/mapbox";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";
import { CMS_MEDIA_BASE } from "@/lib/cms";

export type StoryMarkerVariant = { glow: string; halo: string; border: string };

type StoryMarkerProps = {
  latitude: number;
  longitude: number;
  title?: string;
  imageUrl?: string;
  slug?: string;
  variant: StoryMarkerVariant;
  isActive: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHoverChange: (hovered: boolean) => void;
};

const StoryMarker = ({
  latitude,
  longitude,
  title,
  imageUrl,
  slug,
  variant,
  isActive,
  isHovered,
  onClick,
  onHoverChange,
}: StoryMarkerProps) => (
  <Marker
    latitude={latitude}
    longitude={longitude}
    anchor="center"
    onClick={(e) => {
      e.originalEvent.stopPropagation();
      onClick();
    }}
    style={{
      cursor: slug ? "pointer" : "default",
      zIndex: isActive ? 20 : isHovered ? 10 : 1,
    }}
  >
    <button
      type="button"
      aria-label={title ?? "Story"}
      className="relative flex items-center justify-center focus:outline-none"
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      <AnimatePresence>
        {isActive && (
          <motion.span
            key={`glow-${slug}`}
            initial={{ scale: 0.6, opacity: 0.5 }}
            animate={{ scale: 3.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className={cn("absolute h-9 w-9 rounded-full", variant.glow)}
          />
        )}
      </AnimatePresence>
      <span
        className={cn(
          "absolute rounded-full transition-all duration-150",
          variant.halo,
          isHovered && !isActive ? "h-12 w-12" : "h-0 w-0",
        )}
      />
      <span
        className={cn(
          "relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 transition-all duration-150",
          variant.border,
          isActive && "shadow-md",
        )}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${CMS_MEDIA_BASE}${imageUrl}`}
            alt={title ?? ""}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <span className="h-full w-full bg-hunter-green-200" />
        )}
      </span>
    </button>
  </Marker>
);

export default StoryMarker;
