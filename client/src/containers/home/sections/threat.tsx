"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { useTranslations } from "next-intl";

export function Threat() {
  const t = useTranslations();

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <div className="bg-brown-light">
      <motion.div
        animate={{
          opacity: inView ? 1 : 0,
          y: inView ? 0 : 24,
        }}
        initial={{ opacity: 0, y: 24 }}
        ref={ref}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="container mx-auto flex flex-col gap-12 py-14 text-white sm:flex-row sm:gap-[120px] sm:p-[100px]"
      >
        <h2 className="max-w-[542px] flex-1 font-serif text-4xl font-light leading-tight sm:text-5xl">
          {t("Rangelands and the people who depend upon them are under threat")}.
        </h2>
        <div className="flex-1 space-y-4 text-body-22-tight">
          <p>
            {t(
              "Many rangelands have been lost to large-scale crop farming, mineral extraction, infrastructure development and urban expansion. As rangelands shrink in size and the demand for meat, milk, leather, and animal fibre products continues to grow, there is increasing land use pressure on those fragments that remain",
            )}
            .
          </p>
          <p>
            {t(
              "Therefore, it is critical that we protect rangelands, improve governance and management where needed, and restore those that have been degraded",
            )}
            .
          </p>
        </div>
      </motion.div>
    </div>
  );
}
