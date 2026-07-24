"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { ArrowLeft } from "lucide-react";

import { useTranslations } from "@/i18n";
import { Link } from "@/i18n/navigation";
import { useGetStories } from "@/types/generated/story";
import { useGetStoryCategories } from "@/types/generated/story-category";
import { DEFAULT_LOCALE } from "@/i18n/routing";
import { CMS_MEDIA_BASE } from "@/lib/cms";
import { cn } from "@/lib/utils";
import FurtherInfo from "@/containers/stories/detail/further-info";
import { getCategoryTheme } from "@/containers/stories/theme";
import StoryBody from "./story-body";
import KeepExploringGrid from "./keep-exploring-grid";

type StoryLandingProps = {
  category: string;
  slug: string;
};

const StoryLanding = ({ category, slug }: StoryLandingProps) => {
  const locale = useLocale();
  const t = useTranslations();
  const theme = getCategoryTheme(category);

  const { data: storyData } = useGetStories(
    {
      filters: { slug: { $eq: slug } },
      populate: ["image", "translations", "further_information"],
      "pagination[limit]": 1,
    },
    { query: { enabled: !!slug } },
  );

  const { data: categoryData } = useGetStoryCategories({
    filters: { slug: { $eq: category } },
    populate: ["translations"],
    "pagination[limit]": 1,
  });

  const story = storyData?.data?.[0];
  const activeCategory = categoryData?.data?.[0];

  const localizedStory =
    locale !== DEFAULT_LOCALE ? story?.translations?.find((tr) => tr.locale === locale) : undefined;
  const localizedCategory =
    locale !== DEFAULT_LOCALE
      ? activeCategory?.translations?.find((tr) => tr.locale === locale)
      : undefined;

  const title = localizedStory?.title ?? story?.title;
  const description = localizedStory?.description ?? story?.description;
  const categoryTitle = localizedCategory?.title ?? activeCategory?.title ?? "";

  const imageUrl = story?.image?.url;
  const imageCaption = story?.image?.caption;

  return (
    <main
      className={cn("relative overflow-hidden pt-[var(--header-height)]", theme.pageBackground)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[url(/images/stories-pattern.png)] bg-repeat opacity-10 [background-size:640px_480px]"
      />
      <div className="relative">
        <section className="container mx-auto px-6 pt-16 sm:px-[100px]">
          <div className={cn("flex justify-center p-8", theme.heroAccent)}>
            <div className="w-full space-y-8 bg-white px-6 py-16 sm:px-24">
              <div className="flex flex-col items-center gap-6 text-center">
                <Link
                  href={`/stories/${category}`}
                  className="inline-flex items-center gap-1 text-xs font-medium uppercase text-green-dark underline underline-offset-2 hover:text-green-light"
                >
                  <ArrowLeft className="h-5 w-5" />
                  {t("Rangelands")} {categoryTitle}
                </Link>

                {title && (
                  <h1 className="max-w-2xl font-serif text-4xl font-light leading-tight text-green-dark sm:text-5xl">
                    {title}
                  </h1>
                )}
              </div>

              {imageUrl && (
                <div className="relative -mx-6 h-[420px] sm:-mx-24">
                  <Image
                    src={`${CMS_MEDIA_BASE}${imageUrl}`}
                    alt={title ?? ""}
                    fill
                    className="object-cover"
                  />
                  {imageCaption && (
                    <span className="absolute bottom-2 left-2 rounded bg-foreground/10 px-2.5 text-[10px] leading-6 text-white backdrop-blur-sm">
                      {imageCaption}
                    </span>
                  )}
                </div>
              )}

              <div className="mx-auto max-w-2xl space-y-8">
                {description && <StoryBody key={slug} description={description} />}
                <FurtherInfo items={story?.further_information ?? []} locale={locale} />
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-16 sm:px-[100px]">
          <KeepExploringGrid category={category} slug={slug} />
        </section>
      </div>
    </main>
  );
};

export default StoryLanding;
