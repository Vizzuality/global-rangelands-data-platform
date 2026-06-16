"use client";

import { useLocale } from "next-intl";

import { useTranslations } from "@/i18n";
import type { StoryCategoryListResponseDataItem } from "@/types/generated/strapi.schemas";
import StoryCardContent from "@/components/story-card-content";

type StoryItem = NonNullable<
  NonNullable<NonNullable<StoryCategoryListResponseDataItem["attributes"]>["stories"]>["data"]
>[number];

type StoryCardProps = {
  story: StoryItem;
  categoryTitle?: string;
  searchParams: string;
  variant: string;
};

const StoryCard = ({ story, categoryTitle, searchParams, variant }: StoryCardProps) => {
  const t = useTranslations();
  const locale = useLocale();

  const storyAttrs = story.attributes;
  const storySlug = storyAttrs?.slug;
  if (!storySlug) return null;

  const localizedTitle =
    storyAttrs?.translations?.find((tr) => tr.locale === locale)?.title ?? storyAttrs?.title;
  const imageAttrs = storyAttrs?.image?.data?.attributes;

  return (
    <article className="group relative">
      <StoryCardContent
        variant={variant}
        href={`/map/story/${storySlug}${searchParams}`}
        categoryTitle={categoryTitle}
        title={localizedTitle ?? t("Untitled")}
        imageUrl={imageAttrs?.url}
        imageAlt={imageAttrs?.alternativeText ?? localizedTitle ?? ""}
        imageCaption={imageAttrs?.caption}
      />
    </article>
  );
};

export default StoryCard;
