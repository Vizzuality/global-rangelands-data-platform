"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { mediaUrl } from "@/lib/cms";
import { useCategorizedStories } from "@/containers/stories/use-story-category";

const INVESTMENT_CASE_SLUGS = [
  "ol-pejeta-conservancy-kenya",
  "rancho-el-ojo-mexico",
  "elysium-cerrado-restoration-project-brazil",
];

export function Stelarr() {
  const t = useTranslations();
  const [expanded, setExpanded] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true });

  const projects = useCategorizedStories(INVESTMENT_CASE_SLUGS);

  return (
    <section id="stelarr" ref={sectionRef} className="bg-white py-14 sm:py-20">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6">
        <div className="relative mx-auto w-full max-w-[1072px] bg-brown-light px-6 pb-14 pt-16 sm:px-[100px] sm:pt-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-40 overflow-hidden bg-[url(/images/home/pattern0.png)] bg-[length:1280px_960px] bg-left-top bg-repeat-y sm:block"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-40 overflow-hidden bg-[url(/images/home/pattern0.png)] bg-[length:1280px_960px] bg-right-top bg-repeat-y sm:block"
          />

          <motion.div
            animate={{ opacity: inView ? 1 : 0, scale: inView ? 1 : 0.95 }}
            initial={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 flex flex-col items-center gap-6 text-center text-white"
          >
            <h2 className="mx-auto max-w-[542px] font-serif text-4xl font-light leading-[1.17] sm:text-5xl">
              {t("STELARR Rangeland Restoration Investment Hub")}
            </h2>
            <p className="mx-auto max-w-[740px] text-body-22-tight opacity-90">
              {t(
                "The STELARR Rangeland Restoration Investment Hub is an investment matchmaking platform connecting locally-led investment cases with finance, accompanied by capacity building and technical support",
              )}
              .
            </p>

            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  animate={{ opacity: 1, height: "auto" }}
                  initial={{ opacity: 0, height: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mx-auto max-w-[740px] space-y-6 overflow-hidden text-left text-body-16 opacity-90"
                >
                  <p>
                    {t(
                      "Currently funded by Global Environment Facility, it is led by the International Livestock Research Institute (ILRI) and IUCN, with supporting partners UNCCD Rangelands Initiative and Business4Land, Global Landscapes Forum Rio Changemakers, the Rangelands Stewardship Council and other CGIAR centers",
                    )}
                    .
                  </p>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <p>
                      {t(
                        "The Hub presents a portfolio of technically-sound rangeland restoration investment cases that have been developed with livestock producers and supporting stakeholders, with support from STELARR. All investment cases follow a set of guiding principles that consider and support transparent and accountable rangeland stewardship practices, social equity, evidenced metrics, high degree of animal welfare and clearly defined financial and environmental targets",
                      )}
                      .
                    </p>
                    <div>
                      <p>
                        {t(
                          "Whilst also being a gateway to investment, the Hub also offers technical support for further investment case development, expertise on livestock and rangelands including optimizing environmental benefits and reducing costs, and impact monitoring and evaluation",
                        )}
                        .
                      </p>
                      <p>
                        {t(
                          "If you are an investor looking to invest in rangeland restoration, or are a rangelands livestock producer wanting to develop an investment case, please contact Fiona Flintan, Investment Hub Lead, ILRI: f.flintan@cgiar.org",
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              aria-expanded={expanded}
              className="text-body-14 underline underline-offset-4 transition-opacity hover:opacity-80"
            >
              {expanded ? t("Show less") : t("Read more")}
            </button>
          </motion.div>

          <div className="relative z-10 mt-12 flex flex-col gap-2 sm:-mx-[116px] sm:mt-16 sm:flex-row sm:gap-0">
            <div className="hidden w-8 shrink-0 bg-brown-dark sm:my-8 sm:block" />
            {projects.map(({ story: project, categorySlug }, index) => (
              <div key={project.slug} className="flex flex-1 sm:contents">
                {index > 0 && (
                  <div className="hidden w-2 shrink-0 bg-brown-dark sm:my-8 sm:block" />
                )}
                <Link
                  href={`/stories/${categorySlug}/${project.slug}`}
                  className="group flex flex-1 flex-col bg-white"
                >
                  <div className="flex flex-1 items-center p-8">
                    <p className="line-clamp-2 min-w-0 flex-1 text-left text-label-16 text-green-dark">
                      {project.title}
                    </p>
                  </div>
                  <div className="relative h-[176px] w-full overflow-hidden">
                    {project.image?.url && (
                      <Image
                        src={mediaUrl(project.image.url)}
                        alt={project.image.alternativeText ?? project.title ?? ""}
                        fill
                        className="object-cover"
                        sizes="(min-width: 640px) 33vw, 100vw"
                      />
                    )}
                  </div>
                </Link>
              </div>
            ))}
            <div className="hidden w-8 shrink-0 bg-brown-dark sm:my-8 sm:block" />
          </div>
        </div>
      </div>
    </section>
  );
}
