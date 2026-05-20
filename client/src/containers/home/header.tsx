"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useState } from "react";

const MIN_SCROLL = 150;

const Header = () => {
  const t = useTranslations();

  const [animate, setAnimate] = useState(true);

  const { scrollY } = useScroll();

  const opacity = useTransform(scrollY, (latest) => {
    if (latest < MIN_SCROLL || (scrollY.getPrevious() || 0) > latest) {
      return 1;
    } else {
      return 0;
    }
  });

  const pointerEvents = useTransform(scrollY, (latest) => {
    if (latest < MIN_SCROLL || (scrollY.getPrevious() || 0) > latest) {
      return "auto";
    } else {
      return "none";
    }
  });

  useEffect(() => {
    setTimeout(() => {
      setAnimate(false);
    }, 1500);
  }, []);

  return (
    <motion.div
      style={{
        transition: "ease-in-out",
        transitionDuration: "1.5s",
        y: animate ? "-200%" : "0%",
      }}
      className={cn(
        "fixed right-0 top-0 z-50 flex w-screen items-end drop-shadow-sm sm:h-[84px] sm:w-auto sm:justify-end sm:px-8 sm:pt-8",
      )}
    >
      <motion.div
        style={{
          opacity,
          pointerEvents,
          transition: "ease-in-out",
          transitionDuration: "0.5s",
        }}
        className="flex w-full justify-between bg-white px-8 py-4 text-sm font-medium text-brown-dark sm:w-auto sm:items-center sm:gap-10"
      >
        <Link className="transition-colors duration-300 hover:text-brown-light" href="/map">
          {t("Explore map")}
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default Header;
