"use client";

import { useEffect } from "react";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, CirclePlay, ExternalLink, FileText } from "lucide-react";
import { useMap } from "react-map-gl/mapbox";
import { useAtomValue } from "jotai";

import { Link } from "@/i18n/navigation";
import { useGetStories } from "@/types/generated/story";
import { DEFAULT_LOCALE } from "@/i18n/routing";
import RichText from "@/components/ui/rich-text";
import { sidebarOpenAtom, useSyncSearchParams } from "@/store/map";
import type { DefaultFurtherInfoComponent } from "@/types/generated/strapi.schemas";
import { CMS_MEDIA_BASE } from "@/lib/cms";

type StoryDatasetAttributes = {
  slug?: string;
  title?: string;
  layers?: { layer?: { data?: { attributes?: { slug?: string } } } }[];
};

type StoryDetailProps = {
  slug: string;
};

const FurtherInfoItem = ({
  item,
  locale,
}: {
  item: DefaultFurtherInfoComponent;
  locale: string;
}) => {
  const content =
    locale !== DEFAULT_LOCALE
      ? (item[`content_${locale}` as keyof DefaultFurtherInfoComponent] as string | undefined) ??
        item.content
      : item.content;

  const safeUrl = /^(https?:|mailto:)/i.test((item.url ?? "").trim()) ? item.url : undefined;

  const icon =
    item.type === "video" ? (
      <CirclePlay className="h-4 w-4 shrink-0" />
    ) : item.type === "paper" ? (
      <FileText className="h-4 w-4 shrink-0" />
    ) : (
      <ExternalLink className="h-4 w-4 shrink-0" />
    );

  const inner = (
    <>
      <span className="mt-0.5">{icon}</span>
      <span>{content ?? item.url}</span>
    </>
  );

  if (safeUrl) {
    return (
      <a
        href={safeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start gap-2 text-sm underline underline-offset-2 hover:text-green-light"
      >
        {inner}
      </a>
    );
  }

  return <span className="flex items-start gap-2 text-sm">{inner}</span>;
};

const StoryDetail = ({ slug }: StoryDetailProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSyncSearchParams();
  const maps = useMap();
  const map = maps.current ?? maps.default;
  const sidebarOpen = useAtomValue(sidebarOpenAtom);

  const { data } = useGetStories(
    {
      filters: { slug: { $eq: slug } },
      populate: [
        "image",
        "category",
        "datasets",
        "datasets.layers",
        "datasets.layers.layer",
        "translations",
        "further_information",
      ],
      "pagination[limit]": 1,
    },
    { query: { enabled: !!slug } },
  );

  const attributes = data?.data?.[0]?.attributes;
  const translations = attributes?.translations;
  const latitude = attributes?.latitude;
  const longitude = attributes?.longitude;

  useEffect(() => {
    if (!map || latitude == null || longitude == null) return;
    map.flyTo({
      center: [longitude, latitude],
      offset: sidebarOpen ? [200, 0] : [0, 0],
      essential: true,
    });
  }, [map, latitude, longitude, sidebarOpen]);

  const localized =
    locale !== DEFAULT_LOCALE ? translations?.find((tr) => tr.locale === locale) : undefined;

  const title = localized?.title ?? attributes?.title;
  const description = localized?.description ?? attributes?.description;

  const imageAttrs = (
    attributes?.image as { data?: { attributes?: { url?: string; caption?: string } } } | undefined
  )?.data?.attributes;
  const imageUrl = imageAttrs?.url;
  const imageCaption = imageAttrs?.caption;

  const storyDatasets =
    (
      attributes?.datasets as
        | { data?: { id?: number; attributes?: StoryDatasetAttributes }[] }
        | undefined
    )?.data ?? [];

  return (
    <div className="flex flex-col">
      <div className="border-b border-foreground px-6 py-4">
        <Link
          href={`/map/stories${searchParams}`}
          className="inline-flex items-center gap-1 text-sm font-medium hover:text-green-light"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("Stories")}
        </Link>
      </div>

      {imageUrl && (
        <div className="relative h-48 w-full shrink-0">
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

      <div className="space-y-6 p-6">
        {title && <h1 className="font-serif text-2xl font-light leading-tight">{title}</h1>}

        {description && (
          <div className="text-sm leading-relaxed">
            <RichText>{description}</RichText>
          </div>
        )}

        {(attributes?.further_information?.length ?? 0) > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide">
              {t("Further information")}
            </h2>
            <div className="space-y-2">
              {attributes?.further_information?.map((item, i) => (
                <FurtherInfoItem key={item.id ?? i} item={item} locale={locale} />
              ))}
            </div>
          </div>
        )}

        {storyDatasets.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide">
              {t("Related datasets")}
            </h2>
            <ul className="space-y-1">
              {storyDatasets.map((d) => (
                <li key={d.id} className="text-sm">
                  {d.attributes?.title ?? d.attributes?.slug}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryDetail;
