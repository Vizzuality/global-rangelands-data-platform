"use client";

import { useCallback, useEffect, useState } from "react";

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
import RelatedDatasets from "./related-datasets";

type StoryDetailProps = {
  slug: string;
};

type StoryDescriptionProps = {
  description: string;
};

const StoryDescription = ({ description }: StoryDescriptionProps) => {
  const t = useTranslations();
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const measureRef = useCallback((el: HTMLDivElement | null) => {
    if (el) setIsOverflowing(el.scrollHeight > el.clientHeight);
  }, []);

  return (
    <div className="space-y-2">
      <div
        ref={measureRef}
        className={
          expanded ? "text-sm leading-relaxed" : "max-h-56 overflow-hidden text-sm leading-relaxed"
        }
      >
        <RichText>{description}</RichText>
      </div>

      {(isOverflowing || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-sm font-medium text-brown-light underline-offset-2 hover:underline"
        >
          {expanded ? t("Read less") : t("Read more")}
        </button>
      )}
    </div>
  );
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

  const story = data?.data?.[0];
  const translations = story?.translations;
  const latitude = story?.latitude;
  const longitude = story?.longitude;

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

  const title = localized?.title ?? story?.title;
  const description = localized?.description ?? story?.description;

  const imageUrl = story?.image?.url;
  const imageCaption = story?.image?.caption;

  const storyDatasets = story?.datasets ?? [];

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

      <div className="space-y-6 p-6">
        {title && (
          <h1 className="font-serif text-2xl font-light leading-tight text-green-dark">{title}</h1>
        )}

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
      </div>

      <div className="border-b border-foreground" />

      <div className="space-y-6 p-6">
        {description && <StoryDescription key={slug} description={description} />}

        <FurtherInfo items={story?.further_information ?? []} locale={locale} />

        <RelatedDatasets datasets={storyDatasets} />
      </div>
    </div>
  );
};

export default StoryDetail;
