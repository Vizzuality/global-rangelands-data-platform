"use client";

import { useGetLocalizedList } from "@/lib/localized-query";
import { useGetFeatureCategories } from "@/types/generated/feature-category";
import type {
  GetFeatureCategoriesParams,
  FeatureCategory,
  FeatureCategoryListResponse,
} from "@/types/generated/strapi.schemas";

/**
 * Every consumer (landing grid, keep-exploring grid, detail breadcrumb) must pass
 * this exact params shape — react-query keys on it, so a mismatched `populate`
 * here would split what should be one cached request into several.
 */
const FEATURE_CATEGORY_PARAMS: GetFeatureCategoriesParams = {
  populate: ["translations", "features", "features.image", "features.translations"],
  sort: "id:asc",
};

export function useFeatureCategories(initialData?: FeatureCategoryListResponse) {
  const featureCategoriesQuery = useGetFeatureCategories(FEATURE_CATEGORY_PARAMS, {
    query: { initialData },
  });
  const { data } = useGetLocalizedList(featureCategoriesQuery);

  return data?.data ?? [];
}

export function useFeatureCategory(category: string, initialData?: FeatureCategoryListResponse) {
  return useFeatureCategories(initialData).find((item) => item.slug === category);
}

export type CategorizedFeature = {
  feature: NonNullable<FeatureCategory["features"]>[number];
  categorySlug: string;
};

/**
 * A feature's category lives only on the category → features relation, and
 * `/features/[category]/[slug]` 404s on a mismatch — so featured slugs must
 * resolve their category from the CMS rather than hardcode it.
 */
export function useCategorizedFeatures(slugs: string[]): CategorizedFeature[] {
  const categories = useFeatureCategories();

  return slugs
    .map((slug) => {
      const category = categories.find((item) =>
        item.features?.some((feature) => feature.slug === slug),
      );
      const feature = category?.features?.find((item) => item.slug === slug);

      return feature && category?.slug ? { feature, categorySlug: category.slug } : null;
    })
    .filter((item): item is CategorizedFeature => Boolean(item));
}
