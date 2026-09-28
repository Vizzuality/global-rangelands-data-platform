import type { Metadata } from "next";
import { notFound } from "next/navigation";

import FeatureDetail from "@/containers/features/detail";
import { getTranslations } from "@/i18n";
import { getFeatures } from "@/types/generated/feature";

export async function generateMetadata(props: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await props.params;
  const t = await getTranslations({ locale });

  try {
    const response = await getFeatures({
      filters: { slug: { $eq: slug } },
      populate: ["translations"],
      "pagination[limit]": 1,
    });
    const feature = response.data?.[0];

    const title = feature?.title ?? t("Rangelands Features");

    return {
      title: `${title} | ${t("Rangelands Data Platform")}`,
      openGraph: {
        title,
        description: feature?.description ?? undefined,
      },
    };
  } catch {
    return {
      title: t("Rangelands Features"),
    };
  }
}

export default async function FeatureDetailPage(props: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await props.params;

  try {
    const response = await getFeatures({
      filters: { slug: { $eq: slug } },
      populate: ["image", "datasets", "translations", "further_information"],
      "pagination[limit]": 1,
    });

    if (!response.data?.[0]) {
      notFound();
    }
  } catch {
    notFound();
  }

  return <FeatureDetail slug={slug} />;
}
