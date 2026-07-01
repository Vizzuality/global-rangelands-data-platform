"use client";

import { useMemo } from "react";
import PeopleIcon from "@/svgs/dataset-categories/people.svg";
import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import { useGetLocalizedList } from "@/lib/localized-query";
import { useGetStoryCategories } from "@/types/generated/story-category";
import { useSyncCategory, useSyncSearchParams } from "@/store/map";
import { StoryCategoryListResponseDataItem } from "@/types/generated/strapi.schemas";
import StoryCard from "./card";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_TITLE_COLOR,
  CATEGORY_TITLE_DEFAULT_COLOR,
  STORY_CARD_DEFAULT_VARIANT,
  STORY_CARD_VARIANTS,
} from "./categories";

type StoryItem = NonNullable<
  NonNullable<NonNullable<StoryCategoryListResponseDataItem["attributes"]>["stories"]>["data"]
>[number];

const CategoryList = ({
  categories,
  onSelect,
}: {
  categories: { slug: string; title: string }[];
  onSelect: (slug: string) => void;
}) => (
  <div className="space-y-4 px-6">
    {categories.map((category, index) => (
      <button
        key={category.slug}
        type="button"
        onClick={() => onSelect(category.slug)}
        className={cn(
          "flex w-full items-center gap-6 py-4 text-left transition-colors hover:bg-background",
          index < categories.length - 1 && "border-b border-foreground",
        )}
      >
        <PeopleIcon className="size-6 shrink-0 text-foreground" aria-hidden />
        <span className="flex flex-1 flex-col gap-2 text-left">
          <span className="font-serif text-2xl leading-7 text-foreground">{category.title}</span>
          {CATEGORY_DESCRIPTIONS[category.slug] && (
            <span className="font-sans text-sm leading-4 text-foreground">
              {CATEGORY_DESCRIPTIONS[category.slug]}
            </span>
          )}
        </span>
      </button>
    ))}
  </div>
);

function categoryTabClassName(isActive: boolean, activeVariant: string): string {
  return isActive ? activeVariant : "bg-white text-foreground";
}

const CategoryFilter = ({
  categories,
  activeSlug,
  onSelect,
}: {
  categories: { slug: string; title: string }[];
  activeSlug?: string;
  onSelect: (slug: string) => void;
}) => (
  <div className="px-6 pt-10">
    <div className="flex gap-4">
      {categories.map((category) => {
        const isActive = category.slug === activeSlug;
        const activeVariant = STORY_CARD_VARIANTS[category.slug] || STORY_CARD_DEFAULT_VARIANT;

        return (
          <button
            key={category.slug}
            type="button"
            onClick={() => onSelect(category.slug)}
            className={cn(
              "flex h-[84px] flex-1 flex-col items-center justify-center gap-1 px-0.5 text-center transition-colors",
              categoryTabClassName(isActive, activeVariant),
            )}
          >
            <PeopleIcon className="size-6 shrink-0" aria-hidden />
            <span
              className={cn(
                "font-sans text-[10px] font-medium uppercase leading-4",
                !isActive && "underline",
              )}
            >
              {category.title}
            </span>
          </button>
        );
      })}
    </div>
  </div>
);

const CategoryStories = ({
  category,
  categories,
  activeSlug,
  searchParams,
  onBack,
  onSelect,
}: {
  category: StoryCategoryListResponseDataItem;
  categories: { slug: string; title: string }[];
  activeSlug?: string;
  searchParams: string;
  onBack: () => void;
  onSelect: (slug: string) => void;
}) => {
  const t = useTranslations();
  const slug = category.attributes?.slug;
  const title = category.attributes?.title;
  const stories: StoryItem[] = category.attributes?.stories?.data ?? [];
  const variant = (slug && STORY_CARD_VARIANTS[slug]) || STORY_CARD_DEFAULT_VARIANT;
  const titleColor = (slug && CATEGORY_TITLE_COLOR[slug]) || CATEGORY_TITLE_DEFAULT_COLOR;

  return (
    <div>
      <div className="px-6 pt-10">
        <button
          type="button"
          onClick={onBack}
          className="text-left font-serif text-[54px] font-light leading-[0.9] tracking-[-2.7px] text-navy"
        >
          {t("Stories")}
        </button>
      </div>
      <CategoryFilter categories={categories} activeSlug={activeSlug} onSelect={onSelect} />
      <header className="space-y-2 px-6 pt-6">
        <h2 className={cn("font-serif text-2xl leading-8", titleColor)}>{title}</h2>
        {slug && CATEGORY_DESCRIPTIONS[slug] && (
          <p className="font-sans text-sm leading-6 text-foreground">
            {CATEGORY_DESCRIPTIONS[slug]}
          </p>
        )}
      </header>
      <div className="space-y-6 px-6 pb-6 pt-6">
        {stories.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            categoryTitle={title}
            searchParams={searchParams}
            variant={variant}
          />
        ))}
      </div>
    </div>
  );
};

const Stories = () => {
  const t = useTranslations();
  const [activeCategory, setActiveCategory] = useSyncCategory();
  const searchParams = useSyncSearchParams();

  const storyCategoriesQuery = useGetStoryCategories({
    populate: ["translations", "stories", "stories.image", "stories.translations"],
    sort: "id:asc",
  });
  const { data: storyCategoriesData } = useGetLocalizedList(storyCategoriesQuery);

  const categories = useMemo(
    () =>
      storyCategoriesData?.data?.reduce<{ slug: string; title: string }[]>(
        (acc, category) =>
          category.attributes?.title && category.attributes?.slug
            ? [...acc, { slug: category.attributes.slug, title: category.attributes.title }]
            : acc,
        [],
      ) ?? [],
    [storyCategoriesData],
  );

  const selectedCategory = activeCategory
    ? storyCategoriesData?.data?.find((c) => c.attributes?.slug === activeCategory)
    : undefined;

  if (selectedCategory) {
    return (
      <CategoryStories
        category={selectedCategory}
        categories={categories}
        activeSlug={activeCategory ?? undefined}
        searchParams={searchParams}
        onBack={() => setActiveCategory(null)}
        onSelect={setActiveCategory}
      />
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-[197px] h-[400px] w-[400px] bg-[url(/images/stories-pattern.png)] bg-contain bg-no-repeat"
      />
      <div className="relative">
        <header className="space-y-4 px-6 pb-6 pt-10">
          <h1 className="font-serif text-[54px] font-light leading-[0.9] tracking-[-2.7px] text-navy">
            {t("Stories")}
          </h1>
          <p className="font-sans text-sm leading-6 text-foreground">
            {t("Select a story type to start")}
          </p>
        </header>
        <CategoryList categories={categories} onSelect={setActiveCategory} />
      </div>
    </div>
  );
};

export default Stories;
