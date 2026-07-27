"use client";

import { useTranslations } from "@/i18n";
import LandingStoryCard from "@/containers/stories/landing/story-card";
import { getCategoryTheme } from "@/containers/stories/theme";
import { useStoryCategory } from "@/containers/stories/use-story-category";

type KeepExploringGridProps = {
  category: string;
  slug: string;
};

const KeepExploringGrid = ({ category, slug }: KeepExploringGridProps) => {
  const t = useTranslations();

  const activeCategory = useStoryCategory(category);
  const theme = getCategoryTheme(category);
  const otherStories = (activeCategory?.stories ?? []).filter((story) => story.slug !== slug);

  if (otherStories.length === 0) return null;

  return (
    <section className="space-y-8">
      <h2 className="text-center font-serif text-3xl font-light leading-tight text-green-dark">
        {t("Keep exploring")}
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {otherStories.map((story) => (
          <LandingStoryCard
            key={story.id}
            story={story}
            category={category}
            variant={theme.cardVariant}
          />
        ))}
      </div>
    </section>
  );
};

export default KeepExploringGrid;
