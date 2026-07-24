"use client";

import { useTranslations } from "@/i18n";
import { useGetLocalizedList } from "@/lib/localized-query";
import { useGetStoryCategories } from "@/types/generated/story-category";
import LandingStoryCard from "@/containers/stories/landing/story-card";
import { getCategoryTheme } from "@/containers/stories/theme";

type KeepExploringGridProps = {
  category: string;
  slug: string;
};

const KeepExploringGrid = ({ category, slug }: KeepExploringGridProps) => {
  const t = useTranslations();

  const storyCategoriesQuery = useGetStoryCategories({
    populate: ["translations", "stories", "stories.image", "stories.translations"],
    sort: "id:asc",
  });
  const { data: storyCategoriesData } = useGetLocalizedList(storyCategoriesQuery);

  const activeCategory = storyCategoriesData?.data?.find((item) => item.slug === category);
  const theme = getCategoryTheme(category);
  const otherStories = (activeCategory?.stories ?? []).filter((story) => story.slug !== slug);

  if (otherStories.length === 0) return null;

  return (
    <section className="space-y-8">
      <h2 className="font-serif text-3xl font-light leading-tight text-green-dark">
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
