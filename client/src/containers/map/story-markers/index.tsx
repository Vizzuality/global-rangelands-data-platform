"use client";

import { useMemo, useState } from "react";

import { usePathname } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useGetStories } from "@/types/generated/story";
import { useGetStoryCategories } from "@/types/generated/story-category";
import { useSyncCategory, useSyncSearchParams } from "@/store/map";
import type { Story } from "@/types/generated/strapi.schemas";
import StoryMarker, { type StoryMarkerVariant } from "./marker";

const STORIES_MODE_PREFIXES = ["/map/stories", "/map/story"];

const STORY_SLUG_RE = /^\/map\/story\/([^/]+)/;

const MARKER_GLOW_BY_CATEGORY: Record<string, StoryMarkerVariant> = {
  "atlas-stories": {
    glow: "bg-brown-dark",
    halo: "bg-brown-dark/20",
    border: "border-brown-dark",
  },
  "restoration-investments": {
    glow: "bg-orange-bright",
    halo: "bg-orange-bright/30",
    border: "border-orange-bright",
  },
  "restoration-champions": {
    glow: "bg-green-light",
    halo: "bg-green-light/20",
    border: "border-green-light",
  },
};
const DEFAULT_MARKER_GLOW = MARKER_GLOW_BY_CATEGORY["atlas-stories"];

const resolveVisibleStories = ({
  stories,
  activeSlug,
  activeCategory,
  categoryByStoryId,
}: {
  stories: Story[];
  activeSlug: string | null;
  activeCategory: string | null;
  categoryByStoryId: Map<string | number, string>;
}): Story[] => {
  if (activeSlug) return stories.filter((s) => s.slug === activeSlug);
  if (activeCategory) {
    return stories.filter((s) => s.id != null && categoryByStoryId.get(s.id) === activeCategory);
  }
  return stories;
};

const StoryMarkers = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSyncSearchParams();
  const [activeCategory] = useSyncCategory();
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);

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
    const map = new Map<string | number, string>();
    for (const cat of categoriesData?.data ?? []) {
      const catSlug = cat.slug;
      if (!catSlug) continue;
      for (const story of cat.stories ?? []) {
        if (story.id != null) map.set(story.id, catSlug);
      }
    }
    return map;
  }, [categoriesData]);

  if (!isStoriesMode) return null;

  const stories = data?.data ?? [];
  const visibleStories = resolveVisibleStories({
    stories,
    activeSlug,
    activeCategory,
    categoryByStoryId,
  });

  return (
    <>
      {visibleStories.map((item) => {
        const { id, latitude, longitude, title, image, slug } = item;
        if (id == null || latitude == null || longitude == null) return null;

        const categorySlug = categoryByStoryId.get(id);
        const variant =
          (categorySlug && MARKER_GLOW_BY_CATEGORY[categorySlug]) || DEFAULT_MARKER_GLOW;

        return (
          <StoryMarker
            key={id}
            latitude={latitude}
            longitude={longitude}
            title={title}
            imageUrl={image?.url}
            slug={slug}
            variant={variant}
            isActive={!!slug && activeSlug === slug}
            isHovered={hoveredId === id}
            onClick={() => {
              if (slug) router.push(`/map/story/${slug}${searchParams}`);
            }}
            onHoverChange={(hovered) => setHoveredId(hovered ? id : null)}
          />
        );
      })}
    </>
  );
};

export default StoryMarkers;
