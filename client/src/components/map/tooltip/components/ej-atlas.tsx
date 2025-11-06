"use strict";

import { useTranslations } from "@/i18n";
import { MapTooltipProps } from "../../types";

type EjAtlasTooltipProps = {
  Case?: string;
  Headline?: string;
  Location?: string;
  First_level_category?: string;
  Conflict_intensity_cual?: string;
  Project_status?: string;
};

const EjAtlasTooltip = (props: MapTooltipProps) => {
  const t = useTranslations();

  console.log(props);
  const {
    Case,
    Headline,
    Location,
    First_level_category,
    Conflict_intensity_cual,
    Project_status,
  } = (props as EjAtlasTooltipProps) || {};

  return (
    <div className="w-[308px] overflow-hidden bg-background drop-shadow-2xl">
      <div className="border-t-[12px] border-t-foreground"></div>
      <div className="space-y-3 p-6 pt-3">
        <div className="space-y-2">
          <h2 className="text-base font-bold leading-tight">{Case}</h2>
          <p className="text-xs leading-tight">{Headline}</p>
        </div>

        <dl className="space-y-3">
          <div className="space-y-2">
            <dt className="font-semibold">Location of conflict</dt>
            <dd>{Location}</dd>
          </div>
          <div className="space-y-2">
            <dt className="font-semibold">Type of conflict</dt>
            <dd>{First_level_category}</dd>
          </div>
          <div className="space-y-2">
            <dt className="font-semibold">Conflict intensity</dt>
            <dd>{Conflict_intensity_cual}</dd>
          </div>
          <div className="space-y-2">
            <dt className="font-semibold">Project status</dt>
            <dd>{Project_status}</dd>
          </div>
        </dl>

        <div className="text-xs leading-normal">
          {t(
            "Note: The presented information is a subset of the content available in the original source ",
          )}{" "}
          (
          <a
            href="https://ejatlas.org/"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            Global Atlas of Environmental Justice
          </a>
          ).
        </div>
      </div>
    </div>
  );
};

export default EjAtlasTooltip;
