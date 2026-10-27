"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { ArrowLeft } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { useGetFeatures } from "@/types/generated/feature";
import type {
  FeatureCategoryListResponse,
  FeatureListResponse,
} from "@/types/generated/strapi.schemas";
import { DEFAULT_LOCALE } from "@/i18n/routing";
import { cmsImageSrc } from "@/lib/cms";
import ChampionHero from "@/components/champion-hero";
import FeatureDocumentLink from "@/components/feature-document-link";
import { cn } from "@/lib/utils";
import { IMAGE_PLACEHOLDER_CLASS_NAME } from "@/lib/image-placeholder";
import { isChampionCategory } from "@/containers/features/categories";
import FurtherInfo from "@/containers/features/detail/further-info";
import { getCategoryTheme } from "@/containers/features/theme";
import { useFeatureCategory } from "@/containers/features/use-feature-category";
import FeatureBody from "./feature-body";
import { getFeatureDetailParams } from "./get-feature-detail-params";
import KeepExploringGrid from "./keep-exploring-grid";

type FeatureDetailPageProps = {
  category: string;
  slug: string;
  initialCategoryData?: FeatureCategoryListResponse;
  initialFeatureData?: FeatureListResponse;
};

function getSectionTopClassName(isChampion: boolean): string {
  return isChampion ? "pt-20" : "pt-16";
}

function getCardPaddingYClassName(isChampion: boolean): string {
  return isChampion ? "pb-[120px] pt-20" : "py-16";
}

function getDescriptionColumnClassName(isChampion: boolean): string {
  return isChampion ? "max-w-[656px] space-y-6" : "max-w-2xl space-y-8";
}

const FeatureDetailPage = ({
  category,
  slug,
  initialCategoryData,
  initialFeatureData,
}: FeatureDetailPageProps) => {
  const locale = useLocale();
  const theme = getCategoryTheme(category);

  const { data: featureData } = useGetFeatures(getFeatureDetailParams(slug), {
    query: { enabled: !!slug, initialData: initialFeatureData },
  });

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
  const isChampion = isChampionCategory(category);

  return (
    <main
      className={cn(
        "relative overflow-hidden pt-[var(--mobile-header-height)] lg:pt-[var(--header-height)]",
        theme.pageBackground,
      )}
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
        <section
          className={cn(
            "container mx-auto px-6",
            theme.sectionPaddingX,
            getSectionTopClassName(isChampion),
          )}
        >
          <div className="flex items-stretch justify-center">
            <div aria-hidden className={cn("relative z-10 my-8 w-8 shrink-0", theme.heroAccent)} />
            <div
              className={cn(
                "relative z-10 min-w-0 flex-1 space-y-8 bg-white px-6 xl:px-24",
                getCardPaddingYClassName(isChampion),
              )}
            >
              <div
                className={cn("flex flex-col items-center gap-6 text-center", isChampion && "pb-4")}
              >
                <Link
                  href={`/features/${category}`}
                  className="inline-flex items-center gap-1 text-xs font-medium uppercase text-green-dark underline underline-offset-2 transition-opacity hover:opacity-80"
                >
                  <ArrowLeft className="h-5 w-5" />
                  {categoryTitle}
                </Link>

                {!isChampion && title && (
                  <h1 className="max-w-2xl font-serif text-4xl font-light leading-tight text-green-dark sm:text-5xl">
                    {title}
                  </h1>
                )}
              </div>

              {isChampion ? (
                <ChampionHero
                  title={title}
                  subtitle={feature?.subtitle}
                  location={feature?.location}
                  imageUrl={imageUrl}
                  imageCaption={imageCaption}
                />
              ) : (
                imageUrl && (
                  <div
                    className={cn(
                      "relative -mx-6 h-[420px] before:bg-foreground/10 xl:-mx-24",
                      IMAGE_PLACEHOLDER_CLASS_NAME,
                    )}
                  >
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
                )
              )}

              <div className={cn("mx-auto", getDescriptionColumnClassName(isChampion))}>
                <FeatureDocumentLink document={feature?.document} slug={slug} variant="page" />
                {description && (
                  <FeatureBody
                    key={slug}
                    description={description}
                    variant={isChampion ? "feature" : "default"}
                  />
                )}
                {isChampion && (
                  <FeatureDocumentLink document={feature?.document} slug={slug} variant="page" />
                )}
                <FurtherInfo items={feature?.further_information ?? []} locale={locale} />
              </div>
            </div>
            <div aria-hidden className={cn("relative z-10 my-8 w-8 shrink-0", theme.heroAccent)} />
          </div>
        </section>

        <section className={cn("container mx-auto px-6 py-16", theme.sectionPaddingX)}>
          <KeepExploringGrid category={category} slug={slug} />
        </section>
      </div>
    </main>
  );
};

export default FeatureDetailPage;
