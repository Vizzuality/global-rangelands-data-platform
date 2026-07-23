"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function Livestock() {
  const t = useTranslations();

  return (
    <div>
      <div className="h-[57px] bg-white" />

      <div className="bg-green-light bg-[url(/images/home/pattern2.png)] py-14 sm:py-[120px]">
        <div className="container mx-auto">
          <div className="relative mx-auto max-w-[1081px] text-green-dark">
            <div className="absolute left-1/2 top-1/2 z-0 hidden aspect-square w-[60.1%] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-green-medium lg:block" />
            <div className="absolute left-1/2 top-1/2 z-0 hidden aspect-square w-[56.2%] -translate-x-1/2 -translate-y-1/2 rotate-45 border-[5px] border-gold lg:block" />
            <div className="absolute inset-x-[3.4%] inset-y-[20.8%] z-[1] hidden bg-green-medium lg:block" />

            <div className="absolute -inset-y-[64px] inset-x-0 z-0 overflow-hidden lg:hidden">
              <div className="absolute left-1/2 top-1/2 aspect-square h-[72%] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-green-medium" />
              <div className="absolute left-1/2 top-1/2 aspect-square h-[67%] -translate-x-1/2 -translate-y-1/2 rotate-45 border-[5px] border-gold" />
            </div>

            <div className="relative z-10 mx-auto flex max-w-[940px] flex-col items-center gap-[60px] bg-white p-6 text-center sm:p-[100px]">
              <div className="flex flex-col items-center gap-6">
                <h2 className="max-w-[542px] font-serif text-4xl font-light leading-tight sm:text-5xl">
                  {t("Supporting extensive livestock systems")}
                </h2>
                <p className="max-w-[740px] text-body-22 opacity-80">
                  {t(
                    "Rangelands are defined by land use and management, the environment and cultural identity. They are intricately linked to the extensive livestock production systems that they support and have been formed by",
                  )}
                  .
                </p>
              </div>

              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="#home-to-millions"
                  className="flex h-12 items-center justify-center border-[1.5px] border-green-medium px-6 text-label-16 text-green-medium transition-colors duration-300 hover:border-green-light hover:text-green-light"
                >
                  {t("Keep reading")}
                </Link>
                <Link
                  href="/map/stories"
                  className="flex h-12 items-center justify-center bg-green-medium px-5 text-label-16 text-white transition-colors duration-300 hover:bg-green-light"
                >
                  {t("Explore Rangelands Stories")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
