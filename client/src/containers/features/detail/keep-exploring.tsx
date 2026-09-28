"use client";

import { useMemo } from "react";

import { useLocale } from "next-intl";

import { useTranslations } from "@/i18n";
import { Link } from "@/i18n/navigation";
import { useGetFeatureCategories } from "@/types/generated/feature-category";
import { useSyncSearchParams } from "@/store/map";
import FeatureCardSmall from "@/components/feature-card-small";
import type { FeatureCategory } from "@/types/generated/strapi.schemas";

import { FEATURE_CARD_VARIANTS, FEATURE_CARD_DEFAULT_VARIANT } from "../categories";

type FeatureItem = NonNullable<FeatureCategory["features"]>[number];

type KeepExploringProps = {
  slug: string;
};

const pickRandomSiblings = <T,>(siblings: T[]): T[] => {
  const shuffled = [...siblings];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 2);
};

const KeepExploring = ({ slug }: KeepExploringProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSyncSearchParams();

  const { data } = useGetFeatureCategories({
    populate: ["features", "features.image", "features.translations"],
    sort: "id:asc",
  });

  const category = data?.data?.find((cat) => cat.features?.some((s) => s.slug === slug));
  const siblings =
    category?.features?.filter(
      (s): s is FeatureItem & { slug: string } => !!s.slug && s.slug !== slug,
    ) ?? [];
  const siblingsKey = siblings.map((s) => s.slug).join(",");
  const variant =
    (category?.slug && FEATURE_CARD_VARIANTS[category.slug]) || FEATURE_CARD_DEFAULT_VARIANT;

  // Keyed on `siblingsKey` (not `siblings`) so the random pick is stable across re-renders and only reshuffles when the sibling set changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const selected = useMemo(() => pickRandomSiblings(siblings), [siblingsKey]);

  if (siblings.length === 0) return null;

  return (
    <div className="space-y-4 border-t border-hunter-green-50 pt-6">
      <h2 className="text-base font-medium">{t("Keep exploring")}</h2>
      <div className="flex gap-2">
        {selected.map((feature) => {
          const localizedTitle =
            feature.translations?.find((tr) => tr.locale === locale)?.title ?? feature.title;

          return (
            <FeatureCardSmall
              key={feature.slug}
              variant={variant}
              className="flex-1"
              href={`/map/feature/${feature.slug}${searchParams}`}
              title={localizedTitle ?? t("Untitled")}
              imageUrl={feature.image?.url}
              imageAlt={feature.image?.alternativeText ?? localizedTitle ?? ""}
            />
          );
        })}
      </div>
      <Link
        href={`/map/features${searchParams}`}
        className="inline-block text-xs font-medium uppercase underline underline-offset-2"
      >
        {t("Features")}
      </Link>
    </div>
  );
};

export default KeepExploring;
