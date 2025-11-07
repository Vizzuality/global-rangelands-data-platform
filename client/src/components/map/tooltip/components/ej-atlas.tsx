"use strict";

import { useTranslations } from "@/i18n";
import { MapTooltipProps } from "../../types";
import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

const conflictLabelMap: Record<string, string> = {
  KNOWN: "Known",
  LATENT: "Latent (no visible organising at the moment)",
  LOW: "Low (some local organising)",
  MEDIUM: "Medium (street protests, visible mobilization)",
  HIGH: "High (widespread, mass mobilization, violence arrests, etc...)",
};

type EjAtlasTooltipProps = {
  Case: string;
  Headline: string;
  Location: string;
  First_level_category: string;
  Conflict_intensity_cual: keyof typeof conflictLabelMap;
  Project_status: string;
  items: EjAtlasFeature[];
};

type EjAtlasFeatureProperties = {
  Case: string;
  Headline: string;
  Location: string;
  First_level_category: string;
  Conflict_intensity_cual: keyof typeof conflictLabelMap;
  Project_status: string;
};

type EjAtlasFeature = {
  properties: EjAtlasFeatureProperties;
};

const EjAtlasInfo: FC<{
  Case: string;
  Headline: string;
  Location: string;
  First_level_category: string;
  Conflict_intensity_cual: keyof typeof conflictLabelMap;
  Project_status: string;
}> = ({
  Case,
  Headline,
  Location,
  First_level_category,
  Conflict_intensity_cual,
  Project_status,
}) => {
  return (
    <>
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
          <dd>{conflictLabelMap[Conflict_intensity_cual]}</dd>
        </div>
        <div className="space-y-2">
          <dt className="font-semibold">Project status</dt>
          <dd>{Project_status}</dd>
        </div>
      </dl>
    </>
  );
};

const EjAtlasTooltip = (props: MapTooltipProps) => {
  const t = useTranslations();
  const [currentStep, setCurrentStep] = useState(0);
  const hasSteps = !props.Case;
  const { items, ...rest } = (props as EjAtlasTooltipProps) || {};

  const handlePreviousButtonClick = () => {
    if (currentStep === 0) {
      setCurrentStep(items.length - 1);
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleNextButtonClick = () => {
    if (currentStep === items.length - 1) {
      setCurrentStep(0);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <div className="w-[308px] overflow-hidden bg-background drop-shadow-2xl">
      <div className="border-t-[12px] border-t-foreground"></div>
      <div className="space-y-3 p-6 pt-3">
        {hasSteps ? (
          <>
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="icon"
                className="size-5"
                onClick={handlePreviousButtonClick}
              >
                <ChevronLeftIcon />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-5"
                onClick={handleNextButtonClick}
              >
                <ChevronRightIcon />
              </Button>
            </div>
            <EjAtlasInfo
              Case={items[currentStep].properties.Case}
              Headline={items[currentStep].properties.Headline}
              Location={items[currentStep].properties.Location}
              First_level_category={items[currentStep].properties.First_level_category}
              Conflict_intensity_cual={items[currentStep].properties.Conflict_intensity_cual}
              Project_status={items[currentStep].properties.Project_status}
            />
          </>
        ) : (
          <EjAtlasInfo {...rest} />
        )}

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
