import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Footer from "@/containers/footer";
import Header from "@/containers/header";
import CategoryLanding from "@/containers/stories/landing";
import { CATEGORY_DESCRIPTIONS, CATEGORY_ORDER } from "@/containers/stories/categories";
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

async function getStoryCategoriesListOrNotFound() {
  try {
    return await getStoryCategoriesList();
  } catch (error) {
    console.error("Failed to load story categories:", error);
    notFound();
  }
}

export async function generateMetadata(props: {
  params: Promise<{ category: string; locale: string }>;
}): Promise<Metadata> {
  const { category, locale } = await props.params;
  const t = await getTranslations({ locale });

  if (!CATEGORY_ORDER.includes(category)) {
    return { title: t("Rangelands Stories") };
  }

  const canonical = `/${locale}/stories/${category}`;
  const description = CATEGORY_DESCRIPTIONS[category];

  try {
    const response = await getStoryCategoriesList();
    const title =
      response.data?.find((item) => item.slug === category)?.title ?? t("Rangelands Stories");

    return {
      title: `${title} | ${t("Rangelands Data Platform")}`,
      description,
      alternates: { canonical },
      openGraph: {
        type: "website",
        url: canonical,
        title,
        description,
      },
    };
  } catch {
    return {
      title: t("Rangelands Stories"),
    };
  }
}

export default async function StoryCategoryLandingPage(props: {
  params: Promise<{ category: string; locale: string }>;
}) {
  const { category } = await props.params;

  if (!CATEGORY_ORDER.includes(category)) {
    notFound();
  }

  const response = await getStoryCategoriesListOrNotFound();

  if (!response.data?.some((item) => item.slug === category)) {
    notFound();
  }

  return (
    <div className="h-auto min-h-screen w-full overflow-x-hidden">
      <Header />
      <CategoryLanding category={category} initialData={response} />
      <Footer />
    </div>
  );
}
