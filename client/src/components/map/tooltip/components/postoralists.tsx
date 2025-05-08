"use strict";

import "./index.css";

import { useTranslations } from "@/i18n";
import { useMemo } from "react";
import { MapTooltipProps } from "../../types";

// Species icons
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
import Vicuna from "@/svgs/pastoralist-species/Vicuna.svg";
import Dog from "@/svgs/pastoralist-species/Dog.svg";
import Chicken from "@/svgs/pastoralist-species/Chicken.svg";

const SpeciesIcons = {
  Alpaca: Alpaca,
  Bactrian: Bactrian_camel,
  Bison: Buffalo_and_Bison,
  Buffalo: Buffalo_and_Bison,
  Cattle,
  Dromedary: Domedary_Camel,
  Donkey,
  Duck,
  Goat,
  Horse,
  Llama,
  Pig,
  Reindeer,
  Sheep,
  Yak,
  Vicuna,
  Dog,
  Chicken,
};

const SpeciesCategories = ["Camelids", "Large ruminants", "Small ruminants", "Other"];
const SpeciesCategoriesColors = {
  Camelids: "#1D2775",
  "Large ruminants": "#B2238D",
  "Small ruminants": "#45C1C0",
  Other: "#17A00D",
};

const useSpeciesNames = () => {
  const t = useTranslations();
  return {
    Alpaca: t("Alpaca"),
    Bactrian: t("Bactrian"),
    Bison: t("Bison"),
    Buffalo: t("Buffalo"),
    Cattle: t("Cattle"),
    Dromedary: t("Domedary"),
    Donkey: t("Donkey"),
    Duck: t("Duck"),
    Goat: t("Goat"),
    Horse: t("Horse"),
    Llama: t("Llama"),
    Pig: t("Pig"),
    Reindeer: t("Reindeer"),
    Sheep: t("Sheep"),
    Yak: t("Yak"),
    Vicuna: t("Vicuna"),
    Dog: t("Dog"),
    Chicken: t("Chicken"),
  };
};

type SpeciesIconsComponentProps = {
  specie: string;
  category?: string;
};

const SpeciesIconsComponent = ({ specie, category }: SpeciesIconsComponentProps) => {
  const Icon = SpeciesIcons[specie as keyof typeof SpeciesIcons];
  const color = SpeciesCategoriesColors[category as keyof typeof SpeciesCategoriesColors];
  return Icon ? <Icon className="h-8 w-8" style={{ color: color || "rgba(0, 0, 0, 0)" }} /> : null;
};

type PastoralistTooltipProps = {
  country?: string;
  species?: string;
  name?: string;
  othernames?: string;
  breeds?: string;
  species_categories?: string;
};

const parseProperties = <T,>(properties: unknown): T | null => {
  try {
    if (typeof properties === "string") {
      return JSON.parse(properties);
    }
    return null;
  } catch (error) {
    return null;
  }
};

const PastoralistTooltip = (props: MapTooltipProps) => {
  const t = useTranslations();

  const speciesNames = useSpeciesNames();

  const { country, name, species, othernames, breeds, species_categories } =
    (props as PastoralistTooltipProps) || {};

  const content = useMemo(() => {
    return {
      title: name,
      countries: parseProperties<string[]>(country)?.join(", "),
      species: parseProperties<string[]>(species),
      otherNames: parseProperties<string[]>(othernames)?.join(", "),
      breeds: parseProperties<Record<string, string[]>>(breeds),
      categories: parseProperties<Record<string, string[]>>(species_categories),
    };
  }, []);

  const getCategory = (specie: string) => {
    if (!content.categories || typeof content.categories !== "object") return;
    return Object.entries(content.categories)?.find(([, values]) => {
      if (!values || !Array.isArray(values)) return;
      return values
        ?.map((v) => typeof v === "string" && v.toLowerCase())
        .includes(specie.toLowerCase());
    })?.[0];
  };

  const speciesOrdered = useMemo(
    () =>
      content.species?.sort((a, b) => {
        const categoryA = getCategory(a);
        const categoryAIndex = SpeciesCategories.indexOf(categoryA || "");
        const categoryB = getCategory(b);
        const categoryBIndex = SpeciesCategories.indexOf(categoryB || "");
        if (!categoryA || !categoryB) return 0;
        return categoryAIndex - categoryBIndex;
      }),
    [content.species],
  );

  return (
    <div className="w-[308px] overflow-hidden bg-background drop-shadow-2xl">
      <div className="border-t-[12px] border-t-foreground"></div>
      <div className="space-y-4 p-6 pt-3">
        <div className="space-y-2">
          <h2 className="text-base font-bold leading-tight">{content.title}</h2>
        </div>

        {!!content.otherNames && (
          <div>
            <h3 className="text-xs font-semibold">{t("Other names")}</h3>
            <p>{content.otherNames}</p>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-xs font-semibold">{t("Other locations")}</h3>
          <p className="text-xs leading-tight">{content.countries}</p>
        </div>

        <div>
          <p className="text-xs font-semibold">{t("Species and breeds")}</p>

          <ul className="flex">
            {speciesOrdered?.map((specie) => (
              <li key={specie}>
                <SpeciesIconsComponent category={getCategory(specie)} specie={specie} />
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-foreground">
            {speciesOrdered?.map((specie, i) => (
              <span key={specie}>
                {speciesNames[specie as keyof typeof speciesNames]}
                <span className="text-hunter-green-400">
                  {content.breeds?.[specie]?.[0] ? ` (${content.breeds?.[specie]})` : ""}
                </span>
                {i === (content.species?.length || 0) - 2
                  ? ` ${t("and")} `
                  : i < (content.species?.length || 0) - 1
                    ? ", "
                    : ""}
              </span>
            ))}
          </p>
        </div>

        <div className="text-xs leading-normal">
          {t(
            "Note: The presented information is a subset of the content available in the original source ",
          )}{" "}
          (
          <a
            href="https://www.pastoralpeoples.org/pastoralist-map/"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            {t("The Pastoralist Map")}
          </a>
          ).
        </div>
      </div>
    </div>
  );
};

export default PastoralistTooltip;
