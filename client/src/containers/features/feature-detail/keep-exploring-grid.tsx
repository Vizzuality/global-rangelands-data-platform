"use client";

import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import FeatureCardRows from "@/containers/features/feature-card-rows";
import { getCategoryTheme } from "@/containers/features/theme";
import { useFeatureCategory } from "@/containers/features/use-feature-category";

type KeepExploringGridProps = {
  category: string;
  slug: string;
};

const KeepExploringGrid = ({ category, slug }: KeepExploringGridProps) => {
  const t = useTranslations();

  const activeCategory = useFeatureCategory(category);
  const theme = getCategoryTheme(category);
  const otherFeatures = (activeCategory?.features ?? []).filter((feature) => feature.slug !== slug);

  if (otherFeatures.length === 0) return null;

  return (
    <section className="space-y-8">
      <h2
        className={cn(
          "text-center font-serif text-4xl font-light leading-tight sm:text-5xl sm:leading-[56px]",
          theme.chromeText,
          theme.chromeStroke,
        )}
      >
        {t("Keep exploring")}
      </h2>
      <FeatureCardRows features={otherFeatures} category={category} />
    </section>
  );
};

export default KeepExploringGrid;
