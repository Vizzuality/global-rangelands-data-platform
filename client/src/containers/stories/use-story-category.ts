"use client";

import { useGetLocalizedList } from "@/lib/localized-query";
import { useGetStoryCategories } from "@/types/generated/story-category";
import type {
  GetStoryCategoriesParams,
  StoryCategoryListResponse,
} from "@/types/generated/strapi.schemas";

/**
 * Every consumer (landing grid, keep-exploring grid, detail breadcrumb) must pass
 * this exact params shape — react-query keys on it, so a mismatched `populate`
 * here would split what should be one cached request into several.
 */
const STORY_CATEGORY_PARAMS: GetStoryCategoriesParams = {
  populate: ["translations", "stories", "stories.image", "stories.translations"],
  sort: "id:asc",
};

export function useStoryCategory(category: string, initialData?: StoryCategoryListResponse) {
  const storyCategoriesQuery = useGetStoryCategories(STORY_CATEGORY_PARAMS, {
    query: { initialData },
  });
  const { data } = useGetLocalizedList(storyCategoriesQuery);

  return data?.data?.find((item) => item.slug === category);
}
