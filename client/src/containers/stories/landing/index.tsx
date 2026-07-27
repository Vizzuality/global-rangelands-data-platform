"use client";

import { useMemo } from "react";
import Image from "next/image";

import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import { useGetLocalizedList } from "@/lib/localized-query";
import { useGetStoryCategories } from "@/types/generated/story-category";

import { CATEGORY_DESCRIPTIONS, CATEGORY_DETAILS } from "../categories";
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
  const details = CATEGORY_DETAILS[category] ?? "";

  const storyRows = useMemo(
    () =>
      Array.from({ length: Math.ceil(stories.length / 3) }, (_, index) =>
        stories.slice(index * 3, index * 3 + 3),
      ),
    [stories],
  );

  return (
    <main
      className={cn("relative overflow-hidden pt-[var(--header-height)]", theme.pageBackground)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[url(/images/stories-pattern.png)] bg-repeat opacity-20 [background-size:640px_480px]"
      />
      <div className="relative">
        <section className="container mx-auto px-6 py-44 sm:px-[100px]">
          <div className="relative flex items-stretch justify-center">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[495px] w-[495px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-green-dark"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[447px] w-[447px] -translate-x-1/2 -translate-y-1/2 rotate-45 border-[5px] border-green-light"
            />
            <div aria-hidden className="relative z-10 my-8 w-8 shrink-0 bg-green-dark" />
            <div className="relative z-10 flex flex-1 flex-col items-center gap-6 bg-white px-6 py-16 text-center sm:px-24">
              <h1 className="max-w-[542px] font-serif text-4xl font-light leading-tight text-green-dark sm:text-5xl">
                {title}
              </h1>
              {description && (
                <p className="max-w-[740px] text-body-22-tight text-green-dark/80 sm:text-body-22">
                  {description}
                </p>
              )}
              {details && (
                <p className="max-w-[740px] text-left text-body-12 text-green-dark">{details}</p>
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
            <div aria-hidden className="relative z-10 my-8 w-8 shrink-0 bg-green-dark" />
          </div>
        </section>

        <section className="container mx-auto px-6 py-16 sm:px-[100px]">
          <div className="flex flex-col gap-6 sm:gap-2">
            {storyRows.map((row, rowIndex) => (
              <div key={rowIndex} className="flex flex-col gap-6 sm:flex-row sm:gap-0">
                <div aria-hidden className="hidden w-8 shrink-0 bg-green-dark sm:my-8 sm:block" />
                {row.map((story, cardIndex) => (
                  <div key={story.id} className="flex flex-1 sm:contents">
                    {cardIndex > 0 && (
                      <div
                        aria-hidden
                        className="hidden w-2 shrink-0 bg-green-dark sm:my-8 sm:block"
                      />
                    )}
                    <LandingStoryCard
                      story={story}
                      category={category}
                      variant={theme.cardVariant}
                      className="flex-1"
                    />
                  </div>
                ))}
                <div aria-hidden className="hidden w-8 shrink-0 bg-green-dark sm:my-8 sm:block" />
                {Array.from({ length: 3 - row.length }).map((_, spacerIndex) => (
                  <div
                    key={`spacer-${spacerIndex}`}
                    aria-hidden
                    className="hidden flex-1 sm:block"
                  />
                ))}
              </div>
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
