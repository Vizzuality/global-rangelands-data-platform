import type { ComponentType } from "react";
import type { StaticImageData } from "next/image";

import gpwHero from "@/assets/images/partner-pages/gpw-hero.png";
import landCarbonLabLogo from "@/assets/images/partner-pages/land-carbon-lab-logo.png";
import ramonaHero from "@/assets/images/partner-pages/ramona-hero.png";
import ramonaLogo from "@/assets/images/partner-pages/ramona-logo.png";
import GlobalPastureWatchBody from "./content/global-pasture-watch";
import RamonaBody from "./content/ramona";

export type Partner = {
  slug: string;
  name: string;
  titleLines: readonly string[];
  logo: StaticImageData;
  logoAlt: string;
  logoWidthClassName: string;
  heroImage: StaticImageData;
  websiteUrl: string | undefined;
  summary: string;
  Body: ComponentType;
};

export const PARTNERS: readonly Partner[] = [
  {
    slug: "global-pasture-watch",
    name: "Global Pasture Watch Research Consortium",
    titleLines: ["Global Pasture Watch", "Research Consortium"],
    logo: landCarbonLabLogo,
    logoAlt: "Land & Carbon Lab logo",
    logoWidthClassName: "w-[130px]",
    heroImage: gpwHero,
    websiteUrl: "https://landcarbonlab.org/about-global-pasture-watch/",
    summary:
      "Improving global monitoring of grasslands, grazing lands and livestock systems through open, regularly updated geospatial datasets.",
    Body: GlobalPastureWatchBody,
  },
  {
    slug: "ramona",
    name: "RAMONA on the Global Rangelands Data Platform",
    titleLines: ["RAMONA on the Global Rangelands", "Data Platform"],
    logo: ramonaLogo,
    logoAlt: "RAMONA logo",
    logoWidthClassName: "w-[146.5px]",
    heroImage: ramonaHero,
    websiteUrl: "https://www.ramona.earth/",
    summary:
      "A suite of high-resolution products mapping African rangelands, their ecosystem types, productivity levels, and seasonal variations.",
    Body: RamonaBody,
  },
];
