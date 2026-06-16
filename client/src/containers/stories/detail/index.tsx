"use client";

import { useEffect } from "react";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { useMap } from "react-map-gl/mapbox";
import { useAtomValue } from "jotai";

import { Link } from "@/i18n/navigation";
import { useGetStories } from "@/types/generated/story";
import { DEFAULT_LOCALE } from "@/i18n/routing";
import RichText from "@/components/ui/rich-text";
import { sidebarOpenAtom, useSyncSearchParams } from "@/store/map";
import { CMS_MEDIA_BASE } from "@/lib/cms";
import FurtherInfo from "./further-info";
import RelatedDatasets, { type StoryDatasetAttributes } from "./related-datasets";

type StoryDetailProps = {
  slug: string;
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

        <FurtherInfo items={attributes?.further_information ?? []} locale={locale} />

        <RelatedDatasets datasets={storyDatasets} />
      </div>
    </div>
  );
};

export default StoryDetail;
