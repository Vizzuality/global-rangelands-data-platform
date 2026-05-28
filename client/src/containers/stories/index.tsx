"use client";

import { useMemo } from "react";
import Image from "next/image";
import { useTranslations } from "@/i18n";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { useGetLocalizedList } from "@/lib/localized-query";
import { useGetStoryCategories } from "@/types/generated/story-category";
import { useSyncCategory, useSyncSearchParams } from "@/store/map";
import { StoryCategoryListResponseDataItem } from "@/types/generated/strapi.schemas";
import { CMS_MEDIA_BASE } from "@/lib/cms";

type StoryItem = NonNullable<
  NonNullable<NonNullable<StoryCategoryListResponseDataItem["attributes"]>["stories"]>["data"]
>[number];

const StoryCategoryGroup = ({
  category,
  stories,
  searchParams,
}: {
  category: StoryCategoryListResponseDataItem;
  stories: StoryItem[];
  searchParams: string;
}) => {
  const t = useTranslations();
  const locale = useLocale();
  const slug = category.attributes?.slug;
  const title = category.attributes?.title;

  return (
    <div
      key={category.id}
      className="space-y-5 border-b border-b-foreground last-of-type:border-b-0"
    >
      <h2 id={slug} className="px-6 pt-6 font-serif text-2xl text-green-light">
        {title}
      </h2>
      <div>
        {stories.map((story) => {
          const storyAttrs = story.attributes;
          const storySlug = storyAttrs?.slug;
          const localizedTitle =
            storyAttrs?.translations?.find((tr) => tr.locale === locale)?.title ??
            storyAttrs?.title;
          const imageUrl = storyAttrs?.image?.data?.attributes?.url;
          const imageAlt =
            storyAttrs?.image?.data?.attributes?.alternativeText ?? localizedTitle ?? "";
          const categoryTitle = storyAttrs?.category?.data?.attributes?.title ?? title;

          const cardContent = (
            <div className="flex gap-3 p-4 transition-colors hover:bg-slate-50">
              {imageUrl && (
                <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={`${CMS_MEDIA_BASE}${imageUrl}`}
                    alt={imageAlt}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              )}
              <div className="flex min-w-0 flex-col gap-1">
                <span className="w-fit rounded-full bg-brown-dark px-2 py-0.5 text-xs font-medium uppercase text-white">
                  {categoryTitle}
                </span>
                <p className="line-clamp-3 text-sm font-medium leading-snug text-foreground">
                  {localizedTitle ?? t("Untitled")}
                </p>
              </div>
            </div>
          );

          if (!storySlug) {
            return (
              <div
                key={story.id}
                className="block border-b border-slate-200 last-of-type:border-b-0"
              >
                {cardContent}
              </div>
            );
          }

          return (
            <Link
              key={story.id}
              href={`/map/story/${storySlug}${searchParams}`}
              className="group block border-b border-slate-200 last-of-type:border-b-0"
            >
              {cardContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const Stories = () => {
  const t = useTranslations();
  const [activeCategory, setActiveCategory] = useSyncCategory();
  const searchParams = useSyncSearchParams();

  const storyCategoriesQuery = useGetStoryCategories({
    populate: [
      "translations",
      "stories",
      "stories.image",
      "stories.category",
      "stories.translations",
    ],
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

  const visibleCategories = useMemo(
    () =>
      activeCategory
        ? storyCategoriesData?.data?.filter((c) => c.attributes?.slug === activeCategory) ?? []
        : storyCategoriesData?.data ?? [],
    [storyCategoriesData, activeCategory],
  );

  return (
    <div>
      <header className="space-y-4 border-b border-foreground p-6 pt-10">
        <h1 className="font-serif text-[50px] font-light leading-[90%]">
          {t("Rangelands Stories")}
        </h1>
        <p className="text-sm leading-relaxed">
          {t(
            "These case studies show the impact of changes in rangelands on local communities, their livestock, and natural resources. They also highlight efforts by pastoralists and organizations to protect these rangelands and their wildlife, while strengthening livelihoods reliant on extensive livestock systems.",
          )}
        </p>
      </header>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-foreground p-6">
          {categories.map((category) => {
            const isActive = activeCategory === category.slug;
            return (
              <button
                key={category.slug}
                type="button"
                onClick={() => setActiveCategory(isActive ? null : category.slug)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium uppercase transition-colors",
                  isActive
                    ? "border-brown-dark bg-brown-dark text-white"
                    : "border-foreground bg-background text-foreground hover:border-brown-dark hover:text-brown-dark",
                )}
              >
                {category.title}
              </button>
            );
          })}
        </div>
      )}

      <div>
        {visibleCategories.map((category) => {
          const stories = category.attributes?.stories?.data ?? [];
          if (stories.length === 0) return null;
          return (
            <StoryCategoryGroup
              key={category.id}
              category={category}
              stories={stories}
              searchParams={searchParams}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Stories;
