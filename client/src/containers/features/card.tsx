"use client";

import { useLocale } from "next-intl";

import { useTranslations } from "@/i18n";
import type { FeatureCategory } from "@/types/generated/strapi.schemas";
import FeatureCardContent from "@/components/feature-card-content";

type FeatureItem = NonNullable<FeatureCategory["features"]>[number];

type FeatureCardProps = {
  feature: FeatureItem;
  categoryTitle?: string;
  searchParams: string;
  variant: string;
  isChampion?: boolean;
};

const FeatureCard = ({
  feature,
  categoryTitle,
  searchParams,
  variant,
  isChampion = false,
}: FeatureCardProps) => {
  const t = useTranslations();
  const locale = useLocale();

  const featureSlug = feature.slug;
  if (!featureSlug) return null;

  const translation = feature.translations?.find((tr) => tr.locale === locale);
  const localizedTitle = translation?.title ?? feature.title;
  const imageAttrs = feature.image;

  return (
    <article className="group relative">
      <FeatureCardContent
        variant={variant}
        href={`/map/feature/${featureSlug}${searchParams}`}
        categoryTitle={categoryTitle}
        title={localizedTitle ?? t("Untitled")}
        subtitle={isChampion ? translation?.subtitle ?? feature.subtitle : undefined}
        location={isChampion ? feature.location : undefined}
        imageUrl={isChampion ? undefined : imageAttrs?.url}
        imageFormats={imageAttrs?.formats}
        imageAlt={imageAttrs?.alternativeText ?? localizedTitle ?? ""}
        imageCaption={imageAttrs?.caption}
      />
    </article>
  );
};

export default FeatureCard;
