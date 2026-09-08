"use client";

import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import StoryCardRows from "@/containers/stories/story-card-rows";
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
      <h2
        className={cn(
          "text-center font-serif text-4xl font-light leading-tight sm:text-5xl sm:leading-[56px]",
          theme.chromeText,
        )}
      >
        {t("Keep exploring")}
      </h2>
      <StoryCardRows stories={otherStories} category={category} />
    </section>
  );
};

export default KeepExploringGrid;
