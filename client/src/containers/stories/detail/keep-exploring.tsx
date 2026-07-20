"use client";

import { useMemo } from "react";

import { useLocale } from "next-intl";

import { useTranslations } from "@/i18n";
import { Link } from "@/i18n/navigation";
import { useGetStoryCategories } from "@/types/generated/story-category";
import { useSyncSearchParams } from "@/store/map";
import StoryCardSmall from "@/components/story-card-small";
import type { StoryCategory } from "@/types/generated/strapi.schemas";

type StoryItem = NonNullable<StoryCategory["stories"]>[number];

type KeepExploringProps = {
  slug: string;
};

const pickRandomSiblings = <T,>(siblings: T[]): T[] => {
  const shuffled = [...siblings];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 2);
};

const KeepExploring = ({ slug }: KeepExploringProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSyncSearchParams();

  const { data } = useGetStoryCategories({
    populate: ["stories", "stories.image", "stories.translations"],
    sort: "id:asc",
  });

  const category = data?.data?.find((cat) => cat.stories?.some((s) => s.slug === slug));
  const siblings =
    category?.stories?.filter(
      (s): s is StoryItem & { slug: string } => !!s.slug && s.slug !== slug,
    ) ?? [];
  const siblingsKey = siblings.map((s) => s.slug).join(",");

  // Keyed on `siblingsKey` (not `siblings`) so the random pick is stable across re-renders and only reshuffles when the sibling set changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const selected = useMemo(() => pickRandomSiblings(siblings), [siblingsKey]);

  if (siblings.length === 0) return null;

  return (
    <div className="space-y-4 border-t border-hunter-green-50 pt-6">
      <h2 className="text-base font-medium">{t("Keep exploring")}</h2>
      <div className="flex gap-2">
        {selected.map((story) => {
          const localizedTitle =
            story.translations?.find((tr) => tr.locale === locale)?.title ?? story.title;

          return (
            <StoryCardSmall
              key={story.slug}
              className="flex-1"
              href={`/map/story/${story.slug}${searchParams}`}
              title={localizedTitle ?? t("Untitled")}
              imageUrl={story.image?.url}
              imageAlt={story.image?.alternativeText ?? localizedTitle ?? ""}
            />
          );
        })}
      </div>
      <Link
        href={`/map/stories${searchParams}`}
        className="inline-block text-xs font-medium uppercase underline underline-offset-2"
      >
        {t("Stories")}
      </Link>
    </div>
  );
};

export default KeepExploring;
