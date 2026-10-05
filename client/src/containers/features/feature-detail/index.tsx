"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { ArrowLeft } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { useGetFeatures } from "@/types/generated/feature";
import type { FeatureCategoryListResponse } from "@/types/generated/strapi.schemas";
import { DEFAULT_LOCALE } from "@/i18n/routing";
import { cmsImageSrc } from "@/lib/cms";
import FeatureDocumentLink from "@/components/feature-document-link";
import { cn } from "@/lib/utils";
import FurtherInfo from "@/containers/features/detail/further-info";
import { getCategoryTheme } from "@/containers/features/theme";
import { useFeatureCategory } from "@/containers/features/use-feature-category";
import FeatureBody from "./feature-body";
import KeepExploringGrid from "./keep-exploring-grid";

type FeatureDetailPageProps = {
  category: string;
  slug: string;
  initialCategoryData?: FeatureCategoryListResponse;
};

const FeatureDetailPage = ({ category, slug, initialCategoryData }: FeatureDetailPageProps) => {
  const locale = useLocale();
  const theme = getCategoryTheme(category);

  const { data: featureData } = useGetFeatures(
    {
      filters: { slug: { $eq: slug } },
      populate: ["image", "document", "translations", "further_information"],
      "pagination[limit]": 1,
    },
    { query: { enabled: !!slug } },
  );

  const activeCategory = useFeatureCategory(category, initialCategoryData);

  const feature = featureData?.data?.[0];

  const localizedFeature =
    locale !== DEFAULT_LOCALE
      ? feature?.translations?.find((tr) => tr.locale === locale)
      : undefined;

  const title = localizedFeature?.title ?? feature?.title;
  const description = localizedFeature?.description ?? feature?.description;
  const categoryTitle = activeCategory?.title ?? "";

  const imageUrl = feature?.image?.url;
  const imageCaption = feature?.image?.caption;

  return (
    <main
      className={cn("relative overflow-hidden pt-[var(--header-height)]", theme.pageBackground)}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 opacity-10",
          "[mask-image:url(/images/features-pattern-tile.svg)] [mask-repeat:repeat] [mask-size:1280px_960px]",
          theme.patternColor,
        )}
      />
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-[188px] bg-gradient-to-b to-transparent",
          theme.headerGradient,
        )}
      />
      <div className="relative">
        <section className="container mx-auto px-6 pt-16 xl:px-[100px]">
          <div className="flex items-stretch justify-center">
            <div aria-hidden className={cn("relative z-10 my-8 w-8 shrink-0", theme.heroAccent)} />
            <div className="relative z-10 min-w-0 flex-1 space-y-8 bg-white px-6 py-16 xl:px-24">
              <div className="flex flex-col items-center gap-6 text-center">
                <Link
                  href={`/features/${category}`}
                  className="inline-flex items-center gap-1 text-xs font-medium uppercase text-green-dark underline underline-offset-2 hover:text-green-light"
                >
                  <ArrowLeft className="h-5 w-5" />
                  {categoryTitle}
                </Link>

                {title && (
                  <h1 className="max-w-2xl font-serif text-4xl font-light leading-tight text-green-dark sm:text-5xl">
                    {title}
                  </h1>
                )}
              </div>

              {imageUrl && (
                <div className="relative -mx-6 h-[420px] xl:-mx-24">
                  <Image
                    src={cmsImageSrc(imageUrl)}
                    alt={title ?? ""}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {imageCaption && (
                    <span className="absolute bottom-2 left-2 rounded bg-foreground/60 px-2.5 text-[10px] leading-6 text-white backdrop-blur-sm">
                      {imageCaption}
                    </span>
                  )}
                </div>
              )}

              <div className="mx-auto max-w-2xl space-y-8">
                <FeatureDocumentLink document={feature?.document} slug={slug} variant="page" />
                {description && <FeatureBody key={slug} description={description} />}
                <FurtherInfo items={feature?.further_information ?? []} locale={locale} />
              </div>
            </div>
            <div aria-hidden className={cn("relative z-10 my-8 w-8 shrink-0", theme.heroAccent)} />
          </div>
        </section>

        <section className="container mx-auto px-6 py-16 xl:px-[100px]">
          <KeepExploringGrid category={category} slug={slug} />
        </section>
      </div>
    </main>
  );
};

export default FeatureDetailPage;
