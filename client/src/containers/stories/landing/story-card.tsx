"use client";

import { useLocale } from "next-intl";

import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import type { StoryCategory } from "@/types/generated/strapi.schemas";
import StoryCardContent from "@/components/story-card-content";

type StoryItem = NonNullable<StoryCategory["stories"]>[number];

type LandingStoryCardProps = {
  story: StoryItem;
  category: string;
  variant: string;
  className?: string;
};

const LandingStoryCard = ({ story, category, variant, className }: LandingStoryCardProps) => {
  const t = useTranslations();
  const locale = useLocale();

  const storySlug = story.slug;
  if (!storySlug) return null;

  const localizedTitle =
    story.translations?.find((tr) => tr.locale === locale)?.title ?? story.title;
  const imageAttrs = story.image;

  return (
    <article className={cn("group relative", className)}>
      <StoryCardContent
        variant={variant}
        href={`/stories/${category}/${storySlug}`}
        title={localizedTitle ?? t("Untitled")}
        imageUrl={imageAttrs?.url}
        imageAlt={imageAttrs?.alternativeText ?? localizedTitle ?? ""}
        imageCaption={imageAttrs?.caption}
      />
    </article>
  );
};

export default LandingStoryCard;
