"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { useTranslations } from "next-intl";

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
        className="relative h-[300px] w-full overflow-hidden sm:h-[400px]"
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
