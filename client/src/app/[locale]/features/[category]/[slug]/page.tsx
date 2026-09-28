import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Footer from "@/containers/footer";
import Header from "@/containers/header";
import FeatureDetailPage from "@/containers/features/feature-detail";
import { CATEGORY_ORDER } from "@/containers/features/categories";
import { getTranslations } from "@/i18n";
import { getFeatureCategories } from "@/types/generated/feature-category";

/**
 * Populate shape must match `useFeatureCategory`'s client params exactly — the
 * fetched response is handed to the client hook as `initialData`, so a
 * mismatched shape would seed the wrong react-query cache key and be ignored.
 */
const getFeatureCategoriesList = cache(async () =>
  getFeatureCategories({
    populate: ["translations", "features", "features.image", "features.translations"],
    sort: "id:asc",
  }),
);

async function resolveCategoryFeatureSlugs(category: string) {
  const response = await getFeatureCategoriesList();
  return response.data?.find((item) => item.slug === category)?.features ?? [];
}

async function getFeatureCategoriesListOrNotFound() {
  try {
    return await getFeatureCategoriesList();
  } catch (error) {
    console.error("Failed to load feature categories:", error);
    notFound();
  }
}

export async function generateMetadata(props: {
  params: Promise<{ category: string; slug: string; locale: string }>;
}): Promise<Metadata> {
  const { category, slug, locale } = await props.params;
  const t = await getTranslations({ locale });

  if (!CATEGORY_ORDER.includes(category)) {
    return { title: t("Rangelands Features") };
  }

  try {
    const features = await resolveCategoryFeatureSlugs(category);
    const feature = features.find((item) => item.slug === slug);
    const title = feature?.title ?? t("Rangelands Features");

    return {
      title: `${title} | ${t("Rangelands Data Platform")}`,
    };
  } catch {
    return {
      title: t("Rangelands Features"),
    };
  }
}

export default async function FeatureDetailRoute(props: {
  params: Promise<{ category: string; slug: string; locale: string }>;
}) {
  const { category, slug } = await props.params;

  if (!CATEGORY_ORDER.includes(category)) {
    notFound();
  }

  const response = await getFeatureCategoriesListOrNotFound();
  const features = response.data?.find((item) => item.slug === category)?.features ?? [];

  if (!features.some((item) => item.slug === slug)) {
    notFound();
  }

  return (
    <div className="h-auto min-h-screen w-full overflow-x-hidden">
      <Header />
      <FeatureDetailPage category={category} slug={slug} initialCategoryData={response} />
      <Footer />
    </div>
  );
}
