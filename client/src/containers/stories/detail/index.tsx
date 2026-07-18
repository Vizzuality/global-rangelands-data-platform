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
import KeepExploring from "./keep-exploring";

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
          expanded ? "text-sm leading-6" : "max-h-[560px] overflow-hidden text-sm leading-6"
        }
      >
        <RichText>{description}</RichText>
      </div>

      {(isOverflowing || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="text-sm font-medium text-brown-light underline underline-offset-2"
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
      <div className="flex flex-col gap-8 border-b border-foreground px-6 pb-6 pt-8">
        <div className="space-y-4">
          <Link
            href={`/map/stories${searchParams}`}
            className="inline-flex items-center gap-1 text-xs font-medium uppercase underline underline-offset-2 hover:text-green-light"
          >
            <ArrowLeft className="h-5 w-5" />
            {t("Stories")}
          </Link>

          {title && (
            <h1 className="font-sans text-[28px] font-bold leading-[34px] text-green-dark">
              {title}
            </h1>
          )}
        </div>

        {imageUrl && (
          <div className="relative h-[140px] w-full shrink-0">
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

      <div className="space-y-6 p-6">
        {description && <StoryDescription key={slug} description={description} />}

        <RelatedDatasets datasets={storyDatasets} />

        <FurtherInfo items={story?.further_information ?? []} locale={locale} />

        <KeepExploring slug={slug} />
      </div>
    </div>
  );
};

export default StoryDetail;
