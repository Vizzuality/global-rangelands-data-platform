"use client";

import { useMemo } from "react";
import Image from "next/image";
import { Globe, Users } from "lucide-react";
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

const STORY_CARD_VARIANTS: Record<string, string> = {
  "rangelands-atlas-stories": "bg-brown-dark text-white",
  "investment-cases": "bg-orange-bright text-brown-dark",
  "rangelands-restorations-champions": "bg-green-light text-white",
};
const STORY_CARD_DEFAULT_VARIANT = "bg-brown-dark text-white";

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
      <div className="space-y-2">
        {stories.map((story) => {
          const storyAttrs = story.attributes;
          const storySlug = storyAttrs?.slug;
          const localizedTitle =
            storyAttrs?.translations?.find((tr) => tr.locale === locale)?.title ??
            storyAttrs?.title;
          const imageAttrs = storyAttrs?.image?.data?.attributes;
          const imageUrl = imageAttrs?.url;
          const imageAlt = imageAttrs?.alternativeText ?? localizedTitle ?? "";
          const imageCaption = imageAttrs?.caption;
          const categoryTitle = title;
          const variant = (slug && STORY_CARD_VARIANTS[slug]) || STORY_CARD_DEFAULT_VARIANT;

          const cardContent = (
            <div className="overflow-hidden">
              <div className={cn("flex flex-col gap-2.5 px-8 pb-5 pt-8", variant)}>
                <p className="text-[10px] font-medium uppercase leading-5">{categoryTitle}</p>
                <p className="text-base font-medium leading-6">{localizedTitle ?? t("Untitled")}</p>
              </div>
              {imageUrl && (
                <div className="relative h-44">
                  <Image
                    src={`${CMS_MEDIA_BASE}${imageUrl}`}
                    alt={imageAlt}
                    fill
                    className="object-cover"
                    sizes="352px"
                  />
                  {imageCaption && (
                    <span className="absolute bottom-2 left-2 rounded bg-foreground/10 px-2.5 text-[10px] leading-6 text-white backdrop-blur-sm">
                      {imageCaption}
                    </span>
                  )}
                </div>
              )}
            </div>
          );

          if (!storySlug) {
            return (
              <div key={story.id} className="block">
                {cardContent}
              </div>
            );
          }

          return (
            <Link
              key={story.id}
              href={`/map/story/${storySlug}${searchParams}`}
              className="group block"
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
      <header className="space-y-4 p-6 pb-4 pt-10">
        <h1 className="font-serif text-[50px] font-light leading-[90%]">
          {t("Rangelands Stories")}
        </h1>
        <p className="text-sm leading-relaxed">
          These case studies show the impact of changes in rangelands on local communities, their
          livestock, and natural resources. They also highlight efforts by pastoralists and
          organizations to protect these rangelands and their wildlife, while strengthening
          livelihoods reliant on extensive livestock systems.
        </p>
      </header>

      {categories.length > 0 && (
        <div className="grid grid-cols-4 gap-2 border-b border-foreground p-6 pt-0">
          {categories.map((category) => {
            const isActive = activeCategory === category.slug;
            return (
              <button
                key={category.slug}
                type="button"
                onClick={() => setActiveCategory(isActive ? null : category.slug)}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center gap-1 p-2 text-center text-xs font-medium transition-colors",
                  isActive
                    ? "bg-green-light text-white"
                    : "bg-background text-foreground hover:text-green-light",
                )}
              >
                <Users className="size-6 shrink-0" aria-hidden />
                <span className={cn("leading-tight", !isActive && "uppercase underline")}>
                  {category.title}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1 p-2 text-center text-xs font-medium transition-colors",
              activeCategory === null
                ? "bg-green-light text-white"
                : "bg-background text-foreground hover:text-green-light",
            )}
          >
            <Globe className="size-6 shrink-0" aria-hidden />
            <span className={cn("leading-tight", activeCategory !== null && "uppercase underline")}>
              All stories
            </span>
          </button>
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
