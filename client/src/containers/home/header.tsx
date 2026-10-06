"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import FeatureCategoriesMenu, {
  FeatureCategoriesMenuScrim,
  FeatureCategoriesTriggerBlock,
  featureCategoriesTriggerClassName,
} from "@/containers/features/categories-menu";

const MIN_SCROLL = 150;

const Header = () => {
  const t = useTranslations();

  const [animate, setAnimate] = useState(true);
  const [featuresOpen, setFeaturesOpen] = useState(false);

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
    <>
      <FeatureCategoriesMenuScrim open={featuresOpen} />
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
          className={cn(
            "flex w-full items-center justify-between px-8 py-4 font-sans text-body-14 font-medium text-brown-dark transition-colors duration-200 sm:w-auto sm:gap-10",
            featuresOpen ? "bg-transparent" : "bg-white",
          )}
        >
          <DropdownMenu open={featuresOpen} onOpenChange={setFeaturesOpen}>
            <DropdownMenuTrigger
              className={cn(
                "flex items-center outline-none transition-colors duration-300 hover:text-brown-light focus-visible:ring focus-visible:ring-brown-light focus-visible:ring-offset-2",
                featureCategoriesTriggerClassName,
              )}
            >
              <FeatureCategoriesTriggerBlock className="-inset-y-4" />
              {t("Features")}
              <ChevronDown
                aria-hidden="true"
                className="size-5 transition-transform duration-300"
              />
            </DropdownMenuTrigger>
            <FeatureCategoriesMenu align="center" sideOffset={16} />
          </DropdownMenu>
          <div
            className={cn(
              "h-5 w-px bg-brown-dark transition-opacity duration-300",
              featuresOpen && "opacity-0",
            )}
            aria-hidden="true"
          />
          <Link
            className={cn(
              "transition-[color,opacity] duration-300 hover:text-brown-light",
              featuresOpen && "pointer-events-none opacity-0",
            )}
            href="/map"
          >
            {t("Explore map")}
          </Link>
        </motion.div>
      </motion.div>
    </>
  );
};

export default Header;
