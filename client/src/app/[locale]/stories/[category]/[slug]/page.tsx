import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Footer from "@/containers/footer";
import Header from "@/containers/header";
import StoryDetailPage from "@/containers/stories/story-detail";
import { CATEGORY_ORDER } from "@/containers/stories/categories";
import { getTranslations } from "@/i18n";
import { getStoryCategories } from "@/types/generated/story-category";

/**
 * Populate shape must match `useStoryCategory`'s client params exactly — the
 * fetched response is handed to the client hook as `initialData`, so a
 * mismatched shape would seed the wrong react-query cache key and be ignored.
 */
const getStoryCategoriesList = cache(async () =>
  getStoryCategories({
    populate: ["translations", "stories", "stories.image", "stories.translations"],
    sort: "id:asc",
  }),
);

async function resolveCategoryStorySlugs(category: string) {
  const response = await getStoryCategoriesList();
  return response.data?.find((item) => item.slug === category)?.stories ?? [];
}

async function getStoryCategoriesListOrNotFound() {
  try {
    return await getStoryCategoriesList();
  } catch (error) {
    console.error("Failed to load story categories:", error);
    notFound();
  }
}

export async function generateMetadata(props: {
  params: Promise<{ category: string; slug: string; locale: string }>;
}): Promise<Metadata> {
  const { category, slug, locale } = await props.params;
  const t = await getTranslations({ locale });

  if (!CATEGORY_ORDER.includes(category)) {
    return { title: t("Rangelands Stories") };
  }

  try {
    const stories = await resolveCategoryStorySlugs(category);
    const story = stories.find((item) => item.slug === slug);
    const title = story?.title ?? t("Rangelands Stories");

    return {
      title: `${title} | ${t("Rangelands Data Platform")}`,
    };
  } catch {
    return {
      title: t("Rangelands Stories"),
    };
  }
}

export default async function StoryDetailRoute(props: {
  params: Promise<{ category: string; slug: string; locale: string }>;
}) {
  const { category, slug } = await props.params;

  if (!CATEGORY_ORDER.includes(category)) {
    notFound();
  }

  const response = await getStoryCategoriesListOrNotFound();
  const stories = response.data?.find((item) => item.slug === category)?.stories ?? [];

  if (!stories.some((item) => item.slug === slug)) {
    notFound();
  }

  return (
    <div className="h-auto min-h-screen w-full overflow-x-hidden">
      <Header />
      <StoryDetailPage category={category} slug={slug} initialCategoryData={response} />
      <Footer />
    </div>
  );
}
