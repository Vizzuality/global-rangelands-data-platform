"use client";

import { Fragment, useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cmsImageSrc } from "@/lib/cms";
import { useFeatureCategory } from "@/containers/features/use-feature-category";
import type { CategorizedFeature } from "@/containers/features/use-feature-category";

const CATEGORY = "rangelands-stories";

type Feature = CategorizedFeature["feature"];

function getRandomFeatures(features: Feature[], [first, second]: [number, number]): Feature[] {
  if (features.length <= 2) return features;

  const firstIndex = Math.floor(first * features.length);
  const secondIndex =
    (firstIndex + 1 + Math.floor(second * (features.length - 1))) % features.length;

  return [features[firstIndex], features[secondIndex]];
}

function FeatureCard({ feature }: { feature: Feature }) {
  const t = useTranslations();
  const image = feature.image;

  return (
    <div className="flex w-full max-w-[514px] flex-col gap-6">
      <Link href={`/features/${CATEGORY}/${feature.slug}`} className="group flex flex-col">
        <div className="flex flex-col gap-[10px] bg-white p-8">
          <p className="text-[10px] font-medium uppercase leading-5 text-green-dark">
            {t("Rangelands Stories")}
          </p>
          <p className="text-label-16 text-green-dark group-hover:underline">{feature.title}</p>
        </div>
        {image?.url && (
          <div className="relative h-[176px] w-full overflow-hidden">
            <Image
              src={cmsImageSrc(image.url, image.formats, 1000)}
              alt={image.alternativeText ?? feature.title ?? ""}
              fill
              className="object-cover"
              sizes="(min-width: 1280px) 514px, 100vw"
              unoptimized
            />
            {image.caption && (
              <span className="absolute bottom-2 left-2 rounded bg-green-dark/10 px-[10px] py-1 text-[10px] text-white backdrop-blur-sm">
                {image.caption}
              </span>
            )}
          </div>
        )}
      </Link>

      <Link
        href={`/features/${CATEGORY}`}
        className="group flex items-center gap-2 text-white transition-opacity hover:opacity-80"
      >
        <span className="text-[12px] font-medium leading-5">{t("See all Rangelands Stories")}</span>
        <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

export function FeaturesCards() {
  const t = useTranslations();

  const cardsRef = useRef<HTMLDivElement>(null);

  const cardsInView = useInView(cardsRef, {
    once: true,
  });

  const category = useFeatureCategory(CATEGORY);

  // Rolled once per mount so refetches don't reshuffle; safe from hydration
  // mismatch only because the home page doesn't server-prefetch feature categories.
  const [picks] = useState<[number, number]>(() => [Math.random(), Math.random()]);

  const cards = getRandomFeatures(category?.features ?? [], picks);

  return (
    <div className="mt-[-1px] bg-green-light pt-[100px]">
      <div
        id="home-to-millions"
        className="container mx-auto flex flex-col gap-12 space-y-2 pb-14 text-white sm:flex-row sm:gap-[120px] sm:p-[100px]"
      >
        <h2 className="max-w-[542px] flex-1 font-serif text-4xl font-light leading-tight sm:text-5xl">
          {t("Rangelands are home to millions")}...
        </h2>
        <div className="flex-1 space-y-4 text-[22px]">
          <p>
            {t(
              "of pastoralists and other livestock keepers worldwide, often shared with hunter-gatherers, fishers, and crop farmers, as well as to a rich diversity of plant and wildlife",
            )}
            .
          </p>
          <p>
            {t(
              "Characteristically rangeland users have an innate and spiritual relationship to their lands and resources that defines who they are and what they do",
            )}
            .
          </p>
        </div>
      </div>

      <motion.div
        ref={cardsRef}
        initial={{ opacity: 0, y: 24 }}
        animate={cardsInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeInOut" }}
        className="container mx-auto flex flex-col gap-6 py-14 sm:flex-row sm:items-stretch sm:justify-center sm:gap-0 sm:p-[100px] sm:pt-[76px]"
      >
        <div className="hidden w-[34px] shrink-0 self-stretch bg-green-medium sm:mb-[76px] sm:mt-8 sm:block" />

        {cards.map((feature, index) => (
          <Fragment key={feature.slug}>
            {index > 0 && (
              <div className="hidden w-2 shrink-0 self-stretch bg-green-medium sm:mb-[76px] sm:mt-8 sm:block" />
            )}
            <FeatureCard feature={feature} />
          </Fragment>
        ))}

        <div className="hidden w-[34px] shrink-0 self-stretch bg-green-medium sm:mb-[76px] sm:mt-8 sm:block" />
      </motion.div>
    </div>
  );
}
