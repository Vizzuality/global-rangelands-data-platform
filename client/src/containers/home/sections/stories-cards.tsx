"use client";

import { Fragment, useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { CMS_MEDIA_BASE } from "@/lib/cms";
import { useGetStories } from "@/types/generated/story";
import type { Story } from "@/types/generated/strapi.schemas";

const FEATURED_CARDS = [
  {
    slug: "reversing-rangeland-degradation-through-collective-participatory-rangeland-management-in-mongolia",
    label: "Rangeland Stories",
    ctaLabel: "See all Rangelands Atlas Stories",
    category: "atlas-stories",
  },
  {
    slug: "contributing-to-land-degradation-neutrality-ldn-in-the-brazillian-cerrado",
    label: "Rangelands Restoration Champions",
    ctaLabel: "See all Rangelands Restoration Champions",
    category: "restoration-champions",
  },
];

type FeaturedCard = (typeof FEATURED_CARDS)[number] & { story: Story };

function StoryCard({ label, ctaLabel, category, story }: FeaturedCard) {
  const t = useTranslations();
  const image = story.image;

  return (
    <div className="flex w-full max-w-[514px] flex-col gap-6">
      <Link href={`/map/story/${story.slug}`} className="group flex flex-col">
        <div className="flex flex-col gap-[10px] bg-white p-8">
          <p className="text-[10px] font-medium uppercase leading-5 text-green-dark">{t(label)}</p>
          <p className="text-label-16 text-green-dark group-hover:underline">{story.title}</p>
        </div>
        {image?.url && (
          <div className="relative h-[176px] w-full overflow-hidden">
            <Image
              src={`${CMS_MEDIA_BASE}${image.url}`}
              alt={image.alternativeText ?? story.title}
              fill
              className="object-cover"
              sizes="(min-width: 1280px) 514px, 100vw"
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
        href={{ pathname: "/map/stories", query: { category } }}
        className="group flex items-center gap-2 text-white transition-colors duration-300 hover:text-hunter-green-200"
      >
        <span className="text-[12px] font-medium leading-5">{t(ctaLabel)}</span>
        <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

export function StoriesCards() {
  const t = useTranslations();

  const cardsRef = useRef<HTMLDivElement>(null);

  const cardsInView = useInView(cardsRef, {
    once: true,
  });

  const { data } = useGetStories({
    filters: { slug: { $in: FEATURED_CARDS.map((card) => card.slug) } },
    populate: ["image"],
  });

  const cards = FEATURED_CARDS.map((card) => {
    const story = data?.data?.find((item) => item.slug === card.slug);
    return story ? { ...card, story } : null;
  }).filter((card): card is FeaturedCard => Boolean(card));

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

        {cards.map((card, index) => (
          <Fragment key={card.slug}>
            {index > 0 && (
              <div className="hidden w-2 shrink-0 self-stretch bg-green-medium sm:mb-[76px] sm:mt-8 sm:block" />
            )}
            <StoryCard {...card} />
          </Fragment>
        ))}

        <div className="hidden w-[34px] shrink-0 self-stretch bg-green-medium sm:mb-[76px] sm:mt-8 sm:block" />
      </motion.div>
    </div>
  );
}
