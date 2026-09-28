"use client";

import { useCallback, useEffect, useState } from "react";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { useMap } from "react-map-gl/mapbox";
import { useAtomValue } from "jotai";

import { Link } from "@/i18n/navigation";
import { useGetFeatures } from "@/types/generated/feature";
import { DEFAULT_LOCALE } from "@/i18n/routing";
import RichText from "@/components/ui/rich-text";
import FeatureDocumentLink from "@/components/feature-document-link";
import { sidebarOpenAtom, useSyncSearchParams } from "@/store/map";
import { mediaUrl } from "@/lib/cms";
import FurtherInfo from "./further-info";
import RelatedDatasets from "./related-datasets";
import KeepExploring from "./keep-exploring";

type FeatureDetailProps = {
  slug: string;
};

type FeatureDescriptionProps = {
  description: string;
};

const FeatureDescription = ({ description }: FeatureDescriptionProps) => {
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

const FeatureDetail = ({ slug }: FeatureDetailProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const searchParams = useSyncSearchParams();
  const maps = useMap();
  const map = maps.current ?? maps.default;
  const sidebarOpen = useAtomValue(sidebarOpenAtom);

  const { data } = useGetFeatures(
    {
      filters: { slug: { $eq: slug } },
      populate: [
        "image",
        "document",
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

  const feature = data?.data?.[0];
  const translations = feature?.translations;
  const latitude = feature?.latitude;
  const longitude = feature?.longitude;

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

  const title = localized?.title ?? feature?.title;
  const description = localized?.description ?? feature?.description;

  const imageUrl = feature?.image?.url;
  const imageCaption = feature?.image?.caption;

  const featureDatasets = feature?.datasets ?? [];

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-8 border-b border-foreground px-6 pb-6 pt-8">
        <div className="space-y-4">
          <Link
            href={`/map/features${searchParams}`}
            className="inline-flex items-center gap-1 text-xs font-medium uppercase underline underline-offset-2 hover:text-green-light"
          >
            <ArrowLeft className="h-5 w-5" />
            {t("Features")}
          </Link>

          {title && (
            <h1 className="font-sans text-[28px] font-bold leading-[34px] text-green-dark">
              {title}
            </h1>
          )}

          <FeatureDocumentLink document={feature?.document} slug={slug} variant="panel" />
        </div>

        {imageUrl && (
          <div className="relative h-[140px] w-full shrink-0">
            <Image src={mediaUrl(imageUrl)} alt={title ?? ""} fill className="object-cover" />
            {imageCaption && (
              <span className="absolute bottom-2 left-2 rounded bg-foreground/10 px-2.5 text-[10px] leading-6 text-white backdrop-blur-sm">
                {imageCaption}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6 p-6">
        {description && <FeatureDescription key={slug} description={description} />}

        <RelatedDatasets datasets={featureDatasets} />

        <FurtherInfo items={feature?.further_information ?? []} locale={locale} />

        <KeepExploring slug={slug} />
      </div>
    </div>
  );
};

export default FeatureDetail;
