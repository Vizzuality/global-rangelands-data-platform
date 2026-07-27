import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Footer from "@/containers/footer";
import Header from "@/containers/header";
import CategoryLanding from "@/containers/stories/landing";
import { CATEGORY_DESCRIPTIONS, CATEGORY_ORDER } from "@/containers/stories/categories";
import { getTranslations } from "@/i18n";
import { getStoryCategories } from "@/types/generated/story-category";

export async function generateMetadata(props: {
  params: Promise<{ category: string; locale: string }>;
}): Promise<Metadata> {
  const { category, locale } = await props.params;
  const t = await getTranslations({ locale });
  const canonical = `/${locale}/stories/${category}`;
  const description = CATEGORY_DESCRIPTIONS[category];

  try {
    const response = await getStoryCategories({
      filters: { slug: { $eq: category } },
      "pagination[limit]": 1,
    });
    const title = response.data?.[0]?.title ?? t("Rangelands Stories");

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

  try {
    const response = await getStoryCategories({
      filters: { slug: { $eq: category } },
      "pagination[limit]": 1,
    });

    if (!response.data?.[0]) {
      notFound();
    }
  } catch {
    notFound();
  }

  return (
    <div className="h-auto min-h-screen w-[100vsw] overflow-x-hidden">
      <Header />
      <CategoryLanding category={category} />
      <Footer />
    </div>
  );
}
