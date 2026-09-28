"use client";

import { useMemo, useState } from "react";

import { usePathname } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useGetFeatures } from "@/types/generated/feature";
import { useGetFeatureCategories } from "@/types/generated/feature-category";
import { useSyncCategory, useSyncSearchParams } from "@/store/map";
import type { Feature } from "@/types/generated/strapi.schemas";
import FeatureMarker, { type FeatureMarkerVariant } from "./marker";

const FEATURES_MODE_PREFIXES = ["/map/features", "/map/feature"];

const FEATURE_SLUG_RE = /^\/map\/feature\/([^/]+)/;

const MARKER_GLOW_BY_CATEGORY: Record<string, FeatureMarkerVariant> = {
  "rangelands-features": {
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
const DEFAULT_MARKER_GLOW = MARKER_GLOW_BY_CATEGORY["rangelands-features"];

const resolveVisibleFeatures = ({
  features,
  activeSlug,
  activeCategory,
  categoryByFeatureId,
}: {
  features: Feature[];
  activeSlug: string | null;
  activeCategory: string | null;
  categoryByFeatureId: Map<string | number, string>;
}): Feature[] => {
  if (activeSlug) return features.filter((s) => s.slug === activeSlug);
  if (activeCategory) {
    return features.filter((s) => s.id != null && categoryByFeatureId.get(s.id) === activeCategory);
  }
  return features;
};

const FeatureMarkers = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSyncSearchParams();
  const [activeCategory] = useSyncCategory();
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);

  const isFeaturesMode = FEATURES_MODE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  const activeSlugMatch = pathname.match(FEATURE_SLUG_RE);
  const activeSlug = activeSlugMatch?.[1] ?? null;

  const { data } = useGetFeatures(
    {
      populate: ["image"],
      "pagination[limit]": 1000,
    },
    { query: { enabled: isFeaturesMode } },
  );

  const { data: categoriesData } = useGetFeatureCategories(
    { populate: ["features"], sort: "id:asc" },
    { query: { enabled: isFeaturesMode } },
  );

  const categoryByFeatureId = useMemo(() => {
    const map = new Map<string | number, string>();
    for (const cat of categoriesData?.data ?? []) {
      const catSlug = cat.slug;
      if (!catSlug) continue;
      for (const feature of cat.features ?? []) {
        if (feature.id != null) map.set(feature.id, catSlug);
      }
    }
    return map;
  }, [categoriesData]);

  if (!isFeaturesMode) return null;

  const features = data?.data ?? [];
  const visibleFeatures = resolveVisibleFeatures({
    features,
    activeSlug,
    activeCategory,
    categoryByFeatureId,
  });

  return (
    <>
      {visibleFeatures.map((item) => {
        const { id, latitude, longitude, title, image, slug } = item;
        if (id == null || latitude == null || longitude == null) return null;

        const categorySlug = categoryByFeatureId.get(id);
        const variant =
          (categorySlug && MARKER_GLOW_BY_CATEGORY[categorySlug]) || DEFAULT_MARKER_GLOW;

        return (
          <FeatureMarker
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
              if (slug) router.push(`/map/feature/${slug}${searchParams}`);
            }}
            onHoverChange={(hovered) => setHoveredId(hovered ? id : null)}
          />
        );
      })}
    </>
  );
};

export default FeatureMarkers;
