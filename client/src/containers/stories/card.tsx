"use client";

import { useLocale } from "next-intl";

import { useTranslations } from "@/i18n";
import type { StoryCategory } from "@/types/generated/strapi.schemas";
import StoryCardContent from "@/components/story-card-content";

type StoryItem = NonNullable<StoryCategory["stories"]>[number];

type StoryCardProps = {
  story: StoryItem;
  categoryTitle?: string;
  searchParams: string;
  variant: string;
};

const StoryCard = ({ story, categoryTitle, searchParams, variant }: StoryCardProps) => {
  const t = useTranslations();
  const locale = useLocale();

  const storySlug = story.slug;
  if (!storySlug) return null;

  const localizedTitle =
    story.translations?.find((tr) => tr.locale === locale)?.title ?? story.title;
  const imageAttrs = story.image;

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
