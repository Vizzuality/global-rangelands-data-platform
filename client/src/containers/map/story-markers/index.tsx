"use client";

import { useMemo, useState } from "react";
import { Marker } from "react-map-gl/mapbox";
import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useGetStories } from "@/types/generated/story";
import { useGetStoryCategories } from "@/types/generated/story-category";
import { useSyncSearchParams } from "@/store/map";
import { cn } from "@/lib/utils";
import { CMS_MEDIA_BASE } from "@/lib/cms";

const STORIES_MODE_PREFIXES = ["/map/stories", "/map/story"];

const STORY_SLUG_RE = /^\/map\/story\/([^/]+)/;

const MARKER_GLOW_BY_CATEGORY: Record<string, { glow: string; halo: string; border: string }> = {
  "rangelands-atlas-stories": {
    glow: "bg-brown-dark",
    halo: "bg-brown-dark/20",
    border: "border-brown-dark",
  },
  "investment-cases": {
    glow: "bg-orange-bright",
    halo: "bg-orange-bright/30",
    border: "border-orange-bright",
  },
  "rangelands-restorations-champions": {
    glow: "bg-green-light",
    halo: "bg-green-light/20",
    border: "border-green-light",
  },
};
const DEFAULT_MARKER_GLOW = MARKER_GLOW_BY_CATEGORY["rangelands-atlas-stories"];

const StoryMarkers = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSyncSearchParams();
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const isStoriesMode = STORIES_MODE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  const activeSlugMatch = pathname.match(STORY_SLUG_RE);
  const activeSlug = activeSlugMatch?.[1] ?? null;

  const { data } = useGetStories(
    {
      populate: ["image"],
      "pagination[limit]": 1000,
    },
    { query: { enabled: isStoriesMode } },
  );

  const { data: categoriesData } = useGetStoryCategories(
    { populate: ["stories"], sort: "id:asc" },
    { query: { enabled: isStoriesMode } },
  );

  const categoryByStoryId = useMemo(() => {
    const map = new Map<number, string>();
    for (const cat of categoriesData?.data ?? []) {
      const catSlug = cat.attributes?.slug;
      if (!catSlug) continue;
      for (const story of cat.attributes?.stories?.data ?? []) {
        if (story.id) map.set(story.id, catSlug);
      }
    }
    return map;
  }, [categoriesData]);

  if (!isStoriesMode) return null;

  const stories = data?.data ?? [];

  return (
    <>
      {stories.map((item) => {
        const { id, attributes } = item;
        if (!id || !attributes) return null;

        const { latitude, longitude, title, image, slug } = attributes;
        if (latitude == null || longitude == null) return null;

        const imageUrl = image?.data?.attributes?.url;
        const categorySlug = categoryByStoryId.get(id);
        const variant =
          (categorySlug && MARKER_GLOW_BY_CATEGORY[categorySlug]) || DEFAULT_MARKER_GLOW;
        const isHovered = hoveredId === id;
        const isActive = !!slug && activeSlug === slug;

        return (
          <Marker
            key={id}
            latitude={latitude}
            longitude={longitude}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              if (slug) router.push(`/map/story/${slug}${searchParams}`);
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
              onMouseEnter={() => setHoveredId(id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    key={`glow-${activeSlug}`}
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
      })}
    </>
  );
};

export default StoryMarkers;
