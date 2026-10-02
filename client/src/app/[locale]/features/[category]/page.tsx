import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Footer from "@/containers/footer";
import Header from "@/containers/header";
import CategoryLanding from "@/containers/features/landing";
import { CATEGORY_DESCRIPTIONS, CATEGORY_ORDER } from "@/containers/features/categories";
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

async function getFeatureCategoriesListOrNotFound() {
  try {
    return await getFeatureCategoriesList();
  } catch (error) {
    console.error("Failed to load feature categories:", error);
    notFound();
  }
}

export async function generateMetadata(props: {
  params: Promise<{ category: string; locale: string }>;
}): Promise<Metadata> {
  const { category, locale } = await props.params;
  const t = await getTranslations({ locale });

  if (!CATEGORY_ORDER.includes(category)) {
    return { title: t("Rangelands Features") };
  }

  const canonical = `/${locale}/features/${category}`;
  const description = CATEGORY_DESCRIPTIONS[category];

  try {
    const response = await getFeatureCategoriesList();
    const title =
      response.data?.find((item) => item.slug === category)?.title ?? t("Rangelands Features");

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
      title: t("Rangelands Features"),
    };
  }
}

export default async function FeatureCategoryLandingPage(props: {
  params: Promise<{ category: string; locale: string }>;
}) {
  const { category } = await props.params;

  if (!CATEGORY_ORDER.includes(category)) {
    notFound();
  }

  const response = await getFeatureCategoriesListOrNotFound();

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
