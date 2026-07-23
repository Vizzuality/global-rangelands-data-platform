"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { useTranslations } from "next-intl";

import ResourcesBox from "../resources-box";

export function Resources() {
  const t = useTranslations();

  const cardsRef = useRef<HTMLDivElement>(null);
  const cardsInView = useInView(cardsRef, { once: true });

  const resources = [
    {
      title: t("Comprehensive data"),
      content: t(
        "Access centralized rangeland data in one repository for easy insight into diverse ecosystems. Use this data for research, policy-making, and conservation efforts, ensuring evidence-based and well-informed decisions",
      ),
    },
    {
      title: t("Community resilience"),
      content: t(
        "Adopt sustainable land use practices with data that supports traditional livelihoods and cultural identities. Strengthen community resilience by adapting to environmental challenges with actionable insights",
      ),
    },
    {
      title: t("Global communication"),
      content: t(
        "Collaborate with stakeholders to strengthen rangeland conservation through knowledge and data exchange. Support global efforts like the UN Decade of Ecosystem Restoration by coordinating actions and sharing information",
      ),
    },
  ];

  return (
    <div className="container mx-auto py-14 sm:p-[100px]">
      <div className="flex flex-col items-center justify-center gap-6">
        <Image src="/images/home/icon-color.png" alt={t("logo colored")} width={207} height={58} />
        <h2 className="font-serif text-4xl font-light leading-tight sm:text-5xl">
          {t("Unique resources")}
        </h2>
        <p className="max-w-[688px] text-center text-body-22 opacity-80">
          {t(
            "Our platform offers unique resources to support the preservation and sustainable management of rangelands worldwide",
          )}
          .
        </p>
      </div>
      <motion.div
        animate={{
          opacity: cardsInView ? 1 : 0,
          y: cardsInView ? 0 : 24,
        }}
        initial={{ opacity: 0, y: 24 }}
        ref={cardsRef}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="mt-14 grid items-center justify-center gap-8 sm:mt-[100px] xl:grid-cols-3"
      >
        {resources.map((resource) => (
          <ResourcesBox key={resource.title} {...resource} />
        ))}
      </motion.div>
    </div>
  );
}
