"use client";

import Image from "next/image";

import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import type { StoryCategoryListResponse } from "@/types/generated/strapi.schemas";

import { CATEGORY_CONTACTS, CATEGORY_DESCRIPTIONS, CATEGORY_DETAILS } from "../categories";
import StoryCardRows from "../story-card-rows";
import { getCategoryTheme } from "../theme";
import { useStoryCategory } from "../use-story-category";

type CategoryLandingProps = {
  category: string;
  initialData?: StoryCategoryListResponse;
};

const CategoryLanding = ({ category, initialData }: CategoryLandingProps) => {
  const t = useTranslations();

  const activeCategory = useStoryCategory(category, initialData);

  const theme = getCategoryTheme(category);
  const stories = activeCategory?.stories ?? [];
  const title = activeCategory?.title ?? "";
  const description = CATEGORY_DESCRIPTIONS[category] ?? "";
  const details = CATEGORY_DETAILS[category] ?? [];
  const contact = CATEGORY_CONTACTS[category];

  const [leadDetail, ...columnDetails] = details;
  const columnMidpoint = Math.ceil(columnDetails.length / 2);
  const leftColumnDetails = columnDetails.slice(0, columnMidpoint);
  const rightColumnDetails = columnDetails.slice(columnMidpoint);

  return (
    <main
      className={cn("relative overflow-hidden pt-[var(--header-height)]", theme.pageBackground)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[url(/images/stories-pattern-tile.svg)] bg-repeat opacity-10 [background-size:1280px_960px]"
      />
      <div className="relative">
        <section className="container mx-auto px-6 pb-20 pt-44 xl:px-[100px] xl:pb-[127px] xl:pt-[207px]">
          <div className="relative flex items-stretch justify-center">
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute left-1/2 top-1/2 aspect-square h-[495px] -translate-x-1/2 -translate-y-1/2 rotate-45 xl:h-[calc(70.71%+180px)]",
                theme.heroAccent,
              )}
            />
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute left-1/2 top-1/2 aspect-square h-[447px] -translate-x-1/2 -translate-y-1/2 rotate-45 border-[5px] xl:h-[calc(70.71%+132px)]",
                theme.heroDiamondOutline,
              )}
            />
            <div aria-hidden className={cn("relative z-10 my-8 w-8 shrink-0", theme.heroAccent)} />
            <div className="relative z-10 flex flex-1 flex-col items-center gap-6 bg-white px-6 py-16 text-center sm:py-[100px] xl:px-24">
              <h1 className="max-w-[606px] font-serif text-4xl font-light leading-tight text-green-dark sm:text-5xl sm:leading-[56px]">
                {title}
              </h1>
              {description && (
                <p className="max-w-[740px] text-body-22-tight text-green-dark/80 sm:text-body-22">
                  {description}
                </p>
              )}
              {(details.length > 0 || contact) && (
                <div className="w-full max-w-[740px] space-y-6 text-left text-body-16-loose text-green-dark">
                  {leadDetail && <p>{leadDetail}</p>}
                  {(columnDetails.length > 0 || contact) && (
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                      <div className="flex-1 space-y-4">
                        {leftColumnDetails.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                      <div className="flex-1 space-y-4">
                        {rightColumnDetails.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                        {contact && (
                          <p>
                            {contact.intro}:{" "}
                            <a
                              href={`mailto:${contact.email}`}
                              className="underline underline-offset-2 transition-opacity hover:opacity-80"
                            >
                              {contact.email}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
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
            <div aria-hidden className={cn("relative z-10 my-8 w-8 shrink-0", theme.heroAccent)} />
          </div>
        </section>

        <section className="container mx-auto px-6 pb-16 pt-20 xl:px-[100px]">
          <StoryCardRows stories={stories} category={category} />
          {stories.length === 0 && (
            <p className="mx-auto max-w-md rounded-lg bg-white px-6 py-8 text-center text-green-dark">
              {t("No stories yet")}
            </p>
          )}
        </section>
      </div>
    </main>
  );
};

export default CategoryLanding;
