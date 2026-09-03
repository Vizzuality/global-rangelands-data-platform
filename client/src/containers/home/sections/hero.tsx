"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import HomeGallery from "../gallery";

export function Hero() {
  const t = useTranslations();

  return (
    <>
      <div className="relative">
        <motion.div className="absolute left-0 top-0 h-full w-full bg-orange-light bg-[url(/images/home/pattern0.png)] bg-contain bg-repeat"></motion.div>

        <motion.div
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{
            duration: 1,
            delay: 0.5,
          }}
          className="absolute left-0 top-0 h-full w-full bg-orange-light bg-[url(/images/home/pattern1.png)] bg-contain bg-repeat"
        ></motion.div>

        <div className="relative mx-auto h-full pt-[180px] opacity-100">
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            initial={{ opacity: 0, scale: 0.75 }}
            transition={{
              duration: 1,
              delay: 0.75,
            }}
            className="h-full"
          >
            <div className="mx-auto max-w-[828px] space-y-2 text-white">
              <div className="mb-8 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
                <Image src="/images/home/title-icon.png" alt="title-icon" width={123} height={58} />
                <h1 className="font-serif text-[40px] font-bold leading-tight sm:text-[78px] ">
                  {t("Data Rangelands")}
                </h1>
              </div>
              <div>
                <p className="container text-center font-sans text-2xl leading-relaxed">
                  {t(
                    "A global gateway to the rangelands data repository—powering smarter decisions for their use, management, and restoration",
                  )}
                  .
                </p>
              </div>
            </div>

            <div className="mx-auto mt-12 w-full overflow-x-hidden overflow-y-visible sm:mt-28">
              <div className="flex w-screen items-center justify-center">
                <div className="z-40 w-[75%] overflow-hidden opacity-100 sm:w-[795px]">
                  <Image
                    src="/images/home/home-center.png"
                    width={795.269}
                    height={515.85}
                    alt={t("Map screenshot")}
                    priority
                    className="object-cover"
                  />
                </div>

                <div className="absolute left-[-40%] w-[60%] overflow-hidden sm:left-[-2%] sm:w-[653px]">
                  <Image
                    priority
                    src="/images/home/home-left.png"
                    width={653.204}
                    height={423.7}
                    alt={t("Stories screenshot")}
                    className="object-cover"
                  />
                  <div className="absolute top-0 h-full w-full bg-orange-light/20"></div>
                </div>

                <div className="absolute right-[-40%] w-[60%] overflow-hidden bg-orange-light/25 sm:right-[-2%] sm:w-[653px]">
                  <Image
                    src="/images/home/home-right.png"
                    width={653.204}
                    height={423.7}
                    alt={t("Map screenshot 2")}
                    className="object-cover"
                    priority
                  />
                  <div className="absolute top-0 h-full w-full bg-orange-light/25"></div>
                </div>
              </div>
            </div>

            <div className="container mx-auto flex flex-col justify-center gap-4 pb-[140px] pt-12 sm:flex-row sm:pb-[160px]">
              <Link
                href="#gallery"
                className="flex h-10 items-center justify-center rounded-none bg-brown-dark px-6 text-base text-white transition-colors duration-300 hover:bg-brown-light sm:h-12"
              >
                {t("Keep reading")}
              </Link>
              <Link
                href="/map"
                className="flex h-10 items-center justify-center rounded-none bg-white px-6 text-base text-brown-dark transition-colors duration-300 hover:text-brown-light sm:h-12"
              >
                {t("Explore Data Rangelands platform")}
              </Link>
            </div>

            <div id="gallery" className="relative mt-[-135px]">
              <HomeGallery />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto mt-[130px] flex flex-col gap-12 py-10 sm:flex-row sm:gap-[120px] sm:px-[100px] sm:pb-10 sm:pt-[100px]">
        <div className="flex-1 space-y-3">
          <Image src="/images/home/icon-color.png" alt={t("logo")} width={207} height={58} />
          <h2 className="font-serif text-4xl font-light leading-tight sm:text-5xl">
            {t("Unveiling rangelands landscapes")}
          </h2>
        </div>
        <div className="flex-1 space-y-4">
          <p className="text-[22px]">
            {t(
              "Covering 54% of the Earth's surface and supporting extensive livestock systems, rangelands are crucial yet face threats from agriculture, mining, and urban expansion. It's essential to protect, manage, and restore these areas to preserve their ecological and cultural roles for future generations",
            )}
            .
          </p>
          <p className="text-[22px]">
            {t(
              "Rangelands can include grasslands, deserts, tundra, forests, savannas, shrublands, wetlands, mountains and - often most importantly - water sources",
            )}
            .
          </p>
        </div>
      </div>
    </>
  );
}
