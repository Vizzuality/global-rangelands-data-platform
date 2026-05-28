"use client";

import { useState } from "react";
import { Marker } from "react-map-gl/mapbox";
import { usePathname } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useGetStories } from "@/types/generated/story";
import { useSyncSearchParams } from "@/store/map";
import { cn } from "@/lib/utils";
import { CMS_MEDIA_BASE } from "@/lib/cms";

const STORIES_MODE_PREFIXES = ["/map/stories", "/map/story"];

const STORY_SLUG_RE = /^\/map\/story\/([^/]+)/;

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
      populate: ["image", "category"],
      "pagination[limit]": 1000,
    },
    { query: { enabled: isStoriesMode } },
  );

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
              <span
                className={cn(
                  "absolute rounded-full transition-all duration-150",
                  isActive
                    ? "h-14 w-14 bg-green-light/30"
                    : isHovered
                      ? "h-12 w-12 bg-hunter-green-400/20"
                      : "h-0 w-0",
                )}
              />
              <span
                className={cn(
                  "relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 transition-all duration-150",
                  isActive
                    ? "border-green-light shadow-md"
                    : isHovered
                      ? "border-hunter-green-400"
                      : "border-white",
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
