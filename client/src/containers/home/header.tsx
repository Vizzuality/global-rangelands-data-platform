"use client";

import Link from "next/link";
import LanguageSelector from "../language-selector";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";

const MIN_SCROLL = 50;

const Header = () => {
  const t = useTranslations();

  const { scrollY } = useScroll();

  const opacity = useTransform(scrollY, (latest) => {
    if (latest < MIN_SCROLL) {
      return 1;
    } else if ((scrollY.getPrevious() || 0) > latest) {
      return 1;
    } else {
      return 0;
    }
  });

  return (
    <motion.div
      animate={{ transform: "translateY(0)" }}
      initial={{ transform: "translateY(-200%)" }}
      transition={{
        duration: 1,
        delay: 1.5,
      }}
      style={{
        opacity,
        transition: "ease-in-out",
        transitionDuration: "0.5s",
      }}
      className={cn(
        "fixed right-0 top-0 z-50 flex h-[84px] items-end drop-shadow-sm sm:justify-end sm:px-8 sm:pt-8",
      )}
    >
      <div className="flex w-full justify-between bg-white px-8 py-4 text-sm font-medium text-brown-dark sm:w-auto sm:items-center sm:gap-10">
        <Link className="transition-colors duration-300 hover:text-brown-light" href="/map">
          {t("Explore map")}
        </Link>
        <div className="h-5 w-px bg-brown-dark"></div>
        <LanguageSelector />
      </div>
    </motion.div>
  );
};

export default Header;
