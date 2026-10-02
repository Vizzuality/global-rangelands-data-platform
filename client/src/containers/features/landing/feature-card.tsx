"use client";

import { useLocale } from "next-intl";

import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import type { FeatureCategory } from "@/types/generated/strapi.schemas";
import FeatureCardContent from "@/components/feature-card-content";

type FeatureItem = NonNullable<FeatureCategory["features"]>[number];

type LandingFeatureCardProps = {
  feature: FeatureItem;
  category: string;
  variant: string;
  className?: string;
};

const LandingFeatureCard = ({ feature, category, variant, className }: LandingFeatureCardProps) => {
  const t = useTranslations();
  const locale = useLocale();

  const featureSlug = feature.slug;
  if (!featureSlug) return null;

  const localizedTitle =
    feature.translations?.find((tr) => tr.locale === locale)?.title ?? feature.title;
  const imageAttrs = feature.image;

  return (
    <article className={cn("group relative", className)}>
      <FeatureCardContent
        variant={variant}
        href={`/features/${category}/${featureSlug}`}
        title={localizedTitle ?? t("Untitled")}
        imageUrl={imageAttrs?.url}
        imageAlt={imageAttrs?.alternativeText ?? localizedTitle ?? ""}
        imageCaption={imageAttrs?.caption}
      />
    </article>
  );
};

export default LandingFeatureCard;
