"use strict";

import "./index.css";

import { useTranslations } from "@/i18n";
import { useMemo } from "react";
import { MapTooltipProps } from "../../types";

import Alpaca from "@/svgs/pastoralist-species/Alpaca.svg";
import Bactrian_camel from "@/svgs/pastoralist-species/Bactrian camel.svg";
import Buffalo_and_Bison from "@/svgs/pastoralist-species/Buffalo and Bison.svg";
import Cattle from "@/svgs/pastoralist-species/Cattle.svg";
import Domedary_Camel from "@/svgs/pastoralist-species/Domedary Camel.svg";
import Donkey from "@/svgs/pastoralist-species/Donkey.svg";
import Duck from "@/svgs/pastoralist-species/Duck.svg";
import Goat from "@/svgs/pastoralist-species/Goat.svg";
import Horse from "@/svgs/pastoralist-species/Horse.svg";
import Llama from "@/svgs/pastoralist-species/Llama.svg";
import Pig from "@/svgs/pastoralist-species/Pig.svg";
import Reindeer from "@/svgs/pastoralist-species/Reindeer.svg";
import Sheep from "@/svgs/pastoralist-species/Sheep.svg";
import Yak from "@/svgs/pastoralist-species/Yak.svg";

const SpeciesIcons = {
  Alpaca: Alpaca,
  "Bactrian camel": Bactrian_camel,
  "Buffalo and Bison": Buffalo_and_Bison,
  Cattle: Cattle,
  Dromedary: Domedary_Camel,
  Donkey: Donkey,
  Duck: Duck,
  Goat: Goat,
  Horse: Horse,
  Llama: Llama,
  Pig: Pig,
  Reindeer: Reindeer,
  Sheep: Sheep,
  Yak: Yak,
};

const SpeciesCategories = {
  "Camelids (dromedaries, bactrians, llamas, alpacas)": "rgba(29, 39, 117, 1)",
  "Large ruminants (cattle, buffaloes)": "rgba(178, 35, 141, 1)",
  "Small ruminants (sheep, goats)": "rgba(141, 229, 228, 1)",
  "Other (reindeer, yaks, horses, donkeys)": "rgba(23, 160, 13, 1)",
};

const SpeciesIconsComponent = ({ specie }: { specie: string }) => {
  const Icon = SpeciesIcons[specie as keyof typeof SpeciesIcons];
  const color = Object.entries(SpeciesCategories).find(([key, value]) =>
    key.toLowerCase().includes(specie.toLowerCase()),
  )?.[1];
  return Icon ? <Icon className="h-6 w-6" style={{ color: color }} /> : null;
};

type PastoralistTooltipProps = {
  species_categories?: string;
  country?: string;
  species?: string;
  location?: string;
  name?: string;
  othernames?: string;
};

const PastoralistTooltip = (props: MapTooltipProps) => {
  const t = useTranslations();

  const { country, location, name, species, species_categories, othernames } =
    (props as PastoralistTooltipProps) || {};

  const content = useMemo(() => {
    const countries = JSON.parse(country as string) as string[];
    const speciesParsed = JSON.parse(species as string) as string[];
    const categoriesParsed = JSON.parse(species_categories as string);
    const categories = Object.keys(categoriesParsed);
    const othernamesList = JSON.parse(othernames as string) as string[];
    return {
      title: (name as string) || "title",
      countries: countries.join(", "),
      species: speciesParsed,
      comparisonArea: "comparisonArea",
      categories,
      location,
      otherNames: othernamesList?.join(", "),
    };
  }, []);

  return (
    <div className="overflow-hidden rounded-lg bg-background drop-shadow-2xl">
      <div className="border-t-[12px] border-t-foreground"></div>
      <div className="space-y-4 p-6 pt-3">
        <div className="space-y-2">
          <p className="text-base font-bold leading-tight">{content.title}</p>
          <p>{content.otherNames}</p>
        </div>
        <div>
          <p className="font-semibold">{t("Country")}</p>
          <p className="text-xs leading-tight">{content.countries}</p>
        </div>
        <div>
          <p className="font-semibold">{t("Species and breeds")}</p>

          <ul className="flex">
            {content.species.map((category) => (
              <li key={category}>
                <SpeciesIconsComponent specie={category} />
              </li>
            ))}
          </ul>
          <p className="text-xs">
            <span className="">{content.species?.join(", ")}</span>
          </p>
        </div>

        <p>
          {t(
            "Note: The presented information is a subset of the content available in the original           source (The Pastoralist Map)",
          )}
          .
        </p>
      </div>
    </div>
  );
};

export default PastoralistTooltip;
