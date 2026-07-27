"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Link as LocaleLink } from "@/i18n/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CATEGORY_ORDER, STORY_CATEGORY_LABELS } from "@/containers/stories/categories";

const MIN_SCROLL = 150;

const Header = () => {
  const t = useTranslations();

  const storyCategories = CATEGORY_ORDER.map((slug) => ({
    slug,
    title: t(STORY_CATEGORY_LABELS[slug]),
    href: `/stories/${slug}`,
  }));

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
        className="flex w-full items-center justify-between bg-white px-8 py-4 font-sans text-body-14 font-medium text-brown-dark sm:w-auto sm:gap-10"
      >
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 outline-none transition-colors duration-300 hover:text-brown-light focus-visible:ring focus-visible:ring-brown-light focus-visible:ring-offset-2 data-[state=open]:text-brown-light [&[data-state=open]>svg]:rotate-180">
            {t("Stories")}
            <ChevronDown aria-hidden="true" className="size-5 transition-transform duration-300" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={16}
            alignOffset={-32}
            className="min-w-[220px] origin-top border border-black/5 bg-white p-2 text-brown-dark shadow-xl data-[state=closed]:animate-dropdown-out data-[state=open]:animate-dropdown-in"
          >
            {storyCategories.map((category) => (
              <DropdownMenuItem key={category.slug} asChild>
                <LocaleLink
                  href={category.href}
                  className="block px-3 py-2 text-sm text-brown-dark transition-colors hover:bg-brown-dark/5 focus:bg-brown-dark/5"
                >
                  {category.title}
                </LocaleLink>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="h-5 w-px bg-brown-dark" aria-hidden="true" />
        <Link className="transition-colors duration-300 hover:text-brown-light" href="/map">
          {t("Explore map")}
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default Header;
