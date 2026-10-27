"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { useTranslations } from "next-intl";

import { IMAGE_PLACEHOLDER_CLASS_NAME } from "@/lib/image-placeholder";
import { cn } from "@/lib/utils";

export function AboutVideo() {
  const t = useTranslations();

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <section id="about-video" className="relative bg-green-light">
      <motion.div
        animate={{ opacity: inView ? 1 : 0 }}
        initial={{ opacity: 0 }}
        ref={ref}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className={cn(
          "relative h-[300px] w-full overflow-hidden before:bg-white/20 sm:h-[400px]",
          IMAGE_PLACEHOLDER_CLASS_NAME,
        )}
      >
        <Image
          src="/images/home/home-of-many.png"
          alt={t("Cattle and goats gathered at a watering hole")}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent" />
      </motion.div>
    </section>
  );
}
