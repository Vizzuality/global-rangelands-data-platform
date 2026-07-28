"use client";

import { useGetLocalizedList } from "@/lib/localized-query";
import { useGetStoryCategories } from "@/types/generated/story-category";
import type {
  GetStoryCategoriesParams,
  StoryCategory,
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

export function useStoryCategories(initialData?: StoryCategoryListResponse) {
  const storyCategoriesQuery = useGetStoryCategories(STORY_CATEGORY_PARAMS, {
    query: { initialData },
  });
  const { data } = useGetLocalizedList(storyCategoriesQuery);

  return data?.data ?? [];
}

export function useStoryCategory(category: string, initialData?: StoryCategoryListResponse) {
  return useStoryCategories(initialData).find((item) => item.slug === category);
}

export type CategorizedStory = {
  story: NonNullable<StoryCategory["stories"]>[number];
  categorySlug: string;
};

/**
 * A story's category lives only on the category → stories relation, and
 * `/stories/[category]/[slug]` 404s on a mismatch — so featured slugs must
 * resolve their category from the CMS rather than hardcode it.
 */
export function useCategorizedStories(slugs: string[]): CategorizedStory[] {
  const categories = useStoryCategories();

  return slugs
    .map((slug) => {
      const category = categories.find((item) =>
        item.stories?.some((story) => story.slug === slug),
      );
      const story = category?.stories?.find((item) => item.slug === slug);

      return story && category?.slug ? { story, categorySlug: category.slug } : null;
    })
    .filter((item): item is CategorizedStory => Boolean(item));
}
