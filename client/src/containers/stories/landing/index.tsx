"use client";

import { useMemo } from "react";
import Image from "next/image";

import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import { useGetLocalizedList } from "@/lib/localized-query";
import { useGetStoryCategories } from "@/types/generated/story-category";

import { CATEGORY_DESCRIPTIONS } from "../categories";
import { getCategoryTheme } from "../theme";
import LandingStoryCard from "./story-card";

type CategoryLandingProps = {
  category: string;
};

const CategoryLanding = ({ category }: CategoryLandingProps) => {
  const t = useTranslations();

  const storyCategoriesQuery = useGetStoryCategories({
    populate: ["translations", "stories", "stories.image", "stories.translations"],
    sort: "id:asc",
  });
  const { data: storyCategoriesData } = useGetLocalizedList(storyCategoriesQuery);

  const activeCategory = useMemo(
    () => storyCategoriesData?.data?.find((item) => item.slug === category),
    [storyCategoriesData, category],
  );

  const theme = getCategoryTheme(category);
  const stories = activeCategory?.stories ?? [];
  const title = activeCategory?.title ?? "";
  const description = CATEGORY_DESCRIPTIONS[category] ?? "";

  return (
    <main
      className={cn("relative overflow-hidden pt-[var(--header-height)]", theme.pageBackground)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[url(/images/stories-pattern.png)] bg-repeat opacity-20 [background-size:640px_480px]"
      />
      <div className="relative">
        <section className="container relative mx-auto px-6 pt-16 sm:px-[100px]">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-16 z-0 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rotate-45 border-2 border-green-light bg-green-dark"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-0 left-1/2 z-0 h-20 w-20 -translate-x-1/2 translate-y-1/2 rotate-45 border-2 border-green-light bg-green-dark"
          />
          <div className={cn("flex justify-center p-8", theme.heroAccent)}>
            <div className="relative z-10 flex w-full flex-col items-center gap-6 bg-white px-6 py-16 text-center sm:px-24">
              <h1 className="max-w-2xl font-serif text-4xl font-light leading-tight text-green-dark sm:text-5xl">
                {title}
              </h1>
              {description && (
                <p className="max-w-2xl text-body-22-tight text-green-dark/80 sm:text-body-22">
                  {description}
                </p>
              )}
              <Image
                src="/images/stories/story-category-accent.png"
                alt=""
                aria-hidden
                width={207}
                height={62}
                className="h-auto w-[180px] sm:w-[207px]"
              />
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-16 sm:px-[100px]">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {stories.map((story) => (
              <LandingStoryCard
                key={story.id}
                story={story}
                category={category}
                variant={theme.cardVariant}
              />
            ))}
          </div>
          {stories.length === 0 && (
            <p className="text-center text-white/80">{t("No stories yet")}</p>
          )}
        </section>
      </div>
    </main>
  );
};

export default CategoryLanding;
