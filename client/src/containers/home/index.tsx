"use client";

import Image from "next/image";
import { Link } from "@/navigation";
import { motion, useInView } from "framer-motion";

import HomeGallery from "./gallery";
import { useRef } from "react";
import ResourcesBox from "./resources-box";
import { useTranslations } from "next-intl";

const Home = () => {
  const t = useTranslations();

  const homeOfManyRef = useRef<HTMLDivElement>(null);

  const homeOfManyInView = useInView(homeOfManyRef, {
    once: true,
  });

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
    <div className="w-full">
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
            {/* Title */}
            <div className="mx-auto max-w-[828px] space-y-2 text-white">
              <div className="mb-8 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
                <Image src="/images/home/title-icon.png" alt="title-icon" width={123} height={58} />
                <h1 className="font-serif text-[40px] font-bold leading-tight sm:text-[78px] ">
                  {t("Data Rangelands")}
                </h1>
              </div>
              <div>
                <p className="container text-center font-serif text-2xl sm:text-3xl">
                  {t(
                    "A global gateway to the rangelands data repository—powering smarter decisions for their use, management, and restoration",
                  )}
                  .
                </p>
              </div>
            </div>

            {/* App images */}
            <div className="mx-auto mt-12 w-full overflow-x-hidden overflow-y-visible sm:mt-28">
              <div className="flex w-screen items-center justify-center">
                <div className="z-40 w-[75%] overflow-hidden rounded-[9.5px] border-[5px] border-brown-light opacity-100 sm:w-[795px]">
                  <Image
                    src="/images/home/home-center.png"
                    width={795.269}
                    height={515.85}
                    alt={t("Map screenshot")}
                    priority
                    className="object-cover"
                  />
                </div>

                <div className="absolute left-[-40%] w-[60%] overflow-hidden rounded-[9.5px] border-[5px] border-brown-light sm:left-[-2%] sm:w-[653px]">
                  <Image
                    priority
                    src="/images/home/home-left.png"
                    width={653.204}
                    height={423.7}
                    alt={t("Stories screenshot")}
                    className="object-cover"
                  />
                </div>

                <div className="absolute right-[-40%] w-[60%] overflow-hidden rounded-[9.5px] border-[5px] border-brown-light sm:right-[-2%] sm:w-[653px]">
                  <Image
                    src="/images/home/home-right.png"
                    width={653.204}
                    height={423.7}
                    alt={t("Map screenshot 2")}
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="container mx-auto flex flex-col justify-center gap-4 pb-[140px] pt-12 sm:flex-row sm:pb-[160px]">
              <Link
                href="#gallery"
                className="flex h-10 items-center justify-center rounded-none bg-brown-dark px-6 text-base text-white transition-colors duration-300  hover:bg-brown-light sm:h-12"
              >
                {t("Keep reading")}
              </Link>
              <Link
                href="/map"
                className="flex h-10 items-center justify-center rounded-none bg-white px-6 text-base text-brown-dark transition-colors duration-300  hover:text-brown-light sm:h-12"
              >
                {t("Explore Data Rangelands platform")}
              </Link>
            </div>

            {/* Gallery */}
            <div id="gallery" className="relative mt-[-135px]">
              <HomeGallery />
            </div>
          </motion.div>
        </div>
      </div>
      <div className="container mx-auto mb-[75px] mt-[130px] flex flex-col gap-12 py-10 sm:flex-row sm:gap-[120px] sm:px-[100px] sm:py-[100px]">
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
      <div className="mt-10 bg-[url(/images/home/pattern2.png)] py-14 sm:py-[120px]">
        <div className="container mx-auto">
          <div className="relative mx-auto max-w-[940px] text-green-dark">
            <div className="absolute -left-[35px] top-[5%] z-0 hidden h-[90%] w-[calc(100%+70px)] bg-green-medium sm:top-[7.5%] sm:block sm:h-[85%]"></div>
            <div className="absolute left-[50%] top-[-5%] z-0 aspect-square h-[120vw] -translate-x-[50%] rotate-45 bg-green-medium p-8 sm:left-[50%] sm:top-[-10%] sm:h-[120%]">
              <div className="h-full w-full border-[5px] border-b-0 border-r-0 border-[#B8B756]"></div>
            </div>

            <div className="absolute bottom-[-5%] left-[50%] z-0 aspect-square h-[120vw] -translate-x-[50%] rotate-45 bg-green-medium p-8 sm:left-[50%] sm:top-[-10%] sm:hidden sm:h-[120%]">
              <div className="h-full w-full border-[5px] border-l-0 border-t-0 border-[#B8B756]"></div>
            </div>

            <div className="relative z-10 flex flex-col items-center bg-white p-6 text-center sm:p-[100px]">
              <h2 className="max-w-[542px] font-serif text-4xl font-light leading-tight  sm:text-5xl">
                {t("Supporting extensive livestock systems")}
              </h2>
              <p className="mt-6 text-[22px]">
                {t(
                  "Rangelands are defined by land use and management, the environment and cultural identity. They are intricately linked to the extensive livestock production systems that they support and have been formed by",
                )}
                .
              </p>

              <div className="flex flex-col justify-center gap-4 pt-[60px] sm:flex-row">
                <Link
                  href="#home-to-millions"
                  className="flex h-10 items-center justify-center rounded-none border border-green-medium bg-white px-6 text-base text-green-medium transition-colors duration-300 hover:border-green-light hover:text-green-light sm:h-12"
                >
                  {t("Keep reading")}
                </Link>
                <Link
                  href="/map"
                  className="flex min-h-10 items-center justify-center rounded-none bg-green-medium px-6 py-2 text-base text-white transition-colors duration-300 hover:bg-green-light sm:min-h-12"
                >
                  {t("Explore Data Rangelands platform")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
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
          animate={{
            transform: homeOfManyInView ? "scale(1)" : "scale(0.5)",
          }}
          initial={{
            transform: "scale(0.5)",
          }}
          ref={homeOfManyRef}
          transition={{
            duration: 0.5,
            delay: 0.5,
            ease: "easeInOut",
          }}
        >
          <Image
            src="/images/home/home-of-many.png"
            width={1280}
            height={400}
            alt={t("Cattle and goats in the field")}
            className="h-full min-h-[300px] w-full object-cover sm:min-h-[400px]"
          />
        </motion.div>
      </div>
      <div className="container mx-auto py-14 sm:p-[100px]">
        <div className="flex flex-col items-center justify-center gap-6">
          <Image
            src="/images/home/icon-color.png"
            alt={t("logo colored")}
            width={207}
            height={58}
          />
          <h2 className="font-serif text-4xl font-light leading-tight sm:text-5xl">
            {t("Unique resources")}
          </h2>
          <p className="max-w-[688px] text-center text-[22px]">
            {t(
              "Our platform offers unique resources to support the preservation and sustainable management of rangelands worldwide",
            )}
            .
          </p>
        </div>
        <div className="mt-14 grid items-center justify-center gap-8 sm:mt-[100px] xl:grid-cols-3">
          {resources.map((resource) => (
            <ResourcesBox key={resource.title} {...resource} />
          ))}
        </div>
      </div>
      <div className="bg-brown-light">
        <div className="container mx-auto flex flex-col gap-12 space-y-2 py-14 text-white sm:flex-row sm:gap-[120px] sm:p-[100px]">
          <h2 className="max-w-[542px] flex-1 font-serif text-4xl font-light leading-tight sm:text-5xl">
            {t("Rangelands and the people who depend upon them are under threat")}.
          </h2>
          <div className="flex-1 space-y-4 text-[22px]">
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
        </div>
      </div>
    </div>
  );
};
export default Home;
