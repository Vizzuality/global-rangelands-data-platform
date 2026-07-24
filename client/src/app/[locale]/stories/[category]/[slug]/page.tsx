import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Footer from "@/containers/footer";
import Header from "@/containers/header";
import StoryLanding from "@/containers/stories/story-detail";
import { CATEGORY_ORDER } from "@/containers/stories/categories";
import { getTranslations } from "@/i18n";
import { getStoryCategories } from "@/types/generated/story-category";

async function resolveCategoryStorySlugs(category: string) {
  const response = await getStoryCategories({
    filters: { slug: { $eq: category } },
    populate: ["stories"],
    "pagination[limit]": 1,
  });

  return response.data?.[0]?.stories ?? [];
}

export async function generateMetadata(props: {
  params: Promise<{ category: string; slug: string; locale: string }>;
}): Promise<Metadata> {
  const { category, slug, locale } = await props.params;
  const t = await getTranslations({ locale });

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

export default async function StoryDetailPage(props: {
  params: Promise<{ category: string; slug: string; locale: string }>;
}) {
  const { category, slug } = await props.params;

  if (!CATEGORY_ORDER.includes(category)) {
    notFound();
  }

  try {
    const stories = await resolveCategoryStorySlugs(category);
    if (!stories.some((item) => item.slug === slug)) {
      notFound();
    }
  } catch {
    notFound();
  }

  return (
    <div className="h-auto min-h-screen w-[100vsw] overflow-x-hidden">
      <Header />
      <StoryLanding category={category} slug={slug} />
      <Footer />
    </div>
  );
}
