"use client";

import { cn } from "@/lib/utils";
import type { StoryCategory } from "@/types/generated/strapi.schemas";

import { getCategoryTheme } from "./theme";
import LandingStoryCard from "./landing/story-card";

const CARDS_PER_ROW = 3;

type StoryCardRowsProps = {
  stories: NonNullable<StoryCategory["stories"]>;
  category: string;
};

const getStoryRows = <T,>(stories: T[]): T[][] =>
  Array.from({ length: Math.ceil(stories.length / CARDS_PER_ROW) }, (_, index) =>
    stories.slice(index * CARDS_PER_ROW, index * CARDS_PER_ROW + CARDS_PER_ROW),
  );

const StoryCardRows = ({ stories, category }: StoryCardRowsProps) => {
  const theme = getCategoryTheme(category);

  return (
    <div className="flex flex-col gap-6 sm:gap-2">
      {getStoryRows(stories).map((row, rowIndex) => (
        <div key={rowIndex} className="flex flex-col gap-6 sm:flex-row sm:gap-0">
          <div
            aria-hidden
            className={cn("hidden w-8 shrink-0 sm:my-8 sm:block", theme.heroAccent)}
          />
          {row.map((story, cardIndex) => (
            <div key={story.id} className="flex flex-1 sm:contents">
              {cardIndex > 0 && (
                <div
                  aria-hidden
                  className={cn("hidden w-2 shrink-0 sm:my-8 sm:block", theme.heroAccent)}
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
          <div
            aria-hidden
            className={cn("hidden w-8 shrink-0 sm:my-8 sm:block", theme.heroAccent)}
          />
          {Array.from({ length: CARDS_PER_ROW - row.length }).map((_, spacerIndex) => (
            <div key={`spacer-${spacerIndex}`} aria-hidden className="hidden flex-1 sm:block" />
          ))}
        </div>
      ))}
    </div>
  );
};

export default StoryCardRows;
