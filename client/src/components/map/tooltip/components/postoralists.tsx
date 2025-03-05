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

const SpeciesIcons = {
  Alpaca: Alpaca,
  "Bactrian camel": Bactrian_camel,
  Bison: Buffalo_and_Bison,
  Buffalo: Buffalo_and_Bison,
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
  "Small ruminants (sheep, goats)": "#45C1C0",
  "Other (reindeer, yaks, horses, donkeys)": "rgba(23, 160, 13, 1)",
};

type SpeciesIconsComponentProps = {
  specie: string;
  category?: string;
};

const SpeciesIconsComponent = ({ specie, category }: SpeciesIconsComponentProps) => {
  const Icon = SpeciesIcons[specie as keyof typeof SpeciesIcons];
  const color = Object.entries(SpeciesCategories).find(
    ([key]) => category && key.toLowerCase().includes(category.toLowerCase()),
  )?.[1];
  return Icon ? <Icon className="h-6 w-6" style={{ color: color || "rgba(0, 0, 0, 0)" }} /> : null;
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

  return (
    <div className="w-[308px] overflow-hidden rounded-lg bg-background drop-shadow-2xl">
      <div className="border-t-[12px] border-t-foreground"></div>
      <div className="space-y-4 p-6 pt-3">
        <div className="space-y-2">
          <p className="text-base font-bold leading-tight">{content.title}</p>
          <p>{content.otherNames}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold">{t("Country")}</p>
          <p className="text-xs leading-tight">{content.countries}</p>
        </div>
        <div className="">
          <p className="text-sm font-semibold">{t("Species and breeds")}</p>

          <ul className="flex">
            {content.species?.map((specie) => (
              <li key={specie}>
                <SpeciesIconsComponent category={getCategory(specie)} specie={specie} />
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-foreground">
            {content.species?.map((s, i) => (
              <span key={s}>
                {s}
                <span className="text-foreground/60">
                  {content.breeds?.[s]?.[0] ? ` (${content.breeds?.[s]})` : ""}
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

        <div className="text-[10px] leading-normal">
          {t(
            "Note: The presented information is a subset of the content available in the original source ",
          )}
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
