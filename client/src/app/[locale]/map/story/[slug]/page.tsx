import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getTranslations } from "@/i18n";
import { getStories } from "@/types/generated/story";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const response = await getStories({ "pagination[limit]": 1000, fields: ["slug"] });
    return (response.data ?? [])
      .filter((story) => !!story.attributes?.slug)
      .map((story) => ({ slug: story.attributes!.slug! }));
  } catch {
    return [];
  }
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await props.params;
  const t = await getTranslations({ locale });

  try {
    const response = await getStories({
      filters: { slug: { $eq: slug } },
      populate: ["translations"],
      "pagination[limit]": 1,
    });
    const story = response.data?.[0]?.attributes;

    const title = story?.title ?? t("Rangelands Stories");

    return {
      title: `${title} | ${t("Rangelands Data Platform")}`,
      openGraph: {
        title,
        description: story?.description ?? undefined,
      },
    };
  } catch {
    return {
      title: t("Rangelands Stories"),
    };
  }
}

export default async function StoryDetailPage(props: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await props.params;

  try {
    const response = await getStories({
      filters: { slug: { $eq: slug } },
      populate: ["image", "category", "datasets", "translations", "further_information"],
      "pagination[limit]": 1,
    });

    if (!response.data?.[0]) {
      notFound();
    }
  } catch {
    notFound();
  }

  return null;
}
