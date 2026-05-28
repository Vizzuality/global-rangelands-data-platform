"use client";

import { useEffect } from "react";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ExternalLink, FileText, Video } from "lucide-react";
import { useAtom } from "jotai";

import { Link } from "@/i18n/navigation";
import { useGetStories } from "@/types/generated/story";
import { DEFAULT_LOCALE } from "@/i18n/routing";
import RichText from "@/components/ui/rich-text";
import {
  stashedLayersAtom,
  useSyncDatasets,
  useSyncLayers,
  useSyncLayersSettings,
  useSyncSearchParams,
} from "@/store/map";
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
      <Video className="h-4 w-4 shrink-0" />
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

  const [datasets, setDatasets] = useSyncDatasets();
  const [layers, setLayers] = useSyncLayers();
  const [layersSettings, setLayersSettings] = useSyncLayersSettings();
  const [, setStashed] = useAtom(stashedLayersAtom);

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

  const localized =
    locale !== DEFAULT_LOCALE ? translations?.find((tr) => tr.locale === locale) : undefined;

  const title = localized?.title ?? attributes?.title;
  const description = localized?.description ?? attributes?.description;

  const imageUrl = (attributes?.image as { data?: { attributes?: { url?: string } } } | undefined)
    ?.data?.attributes?.url;

  const storyDatasets =
    (
      attributes?.datasets as
        | { data?: { id?: number; attributes?: StoryDatasetAttributes }[] }
        | undefined
    )?.data ?? [];

  useEffect(() => {
    if (storyDatasets.length === 0) return;

    const relatedDatasetSlugs = storyDatasets
      .map((d) => d.attributes?.slug)
      .filter((s): s is string => !!s);

    const relatedLayerSlugs = storyDatasets.flatMap(
      (d) =>
        d.attributes?.layers
          ?.map((l) => l.layer?.data?.attributes?.slug)
          .filter((s): s is string => !!s) ?? [],
    );

    if (relatedDatasetSlugs.length === 0 && relatedLayerSlugs.length === 0) return;

    setStashed((prev) => {
      if (prev !== null) return prev;
      return {
        datasets: datasets,
        layers: layers,
        layersSettings: layersSettings,
      };
    });

    setDatasets(relatedDatasetSlugs);
    setLayers(relatedLayerSlugs);
    setLayersSettings(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, storyDatasets.length]);

  useEffect(() => {
    return () => {
      setStashed((prev) => {
        if (prev === null) return null;
        setDatasets(prev.datasets ?? []);
        setLayers(prev.layers ?? []);
        setLayersSettings(prev.layersSettings ?? null);
        return null;
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
