"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSyncLayers, useSyncLayersSettings } from "@/store/map";
import { DefaultLayerComponent } from "@/types/generated/strapi.schemas";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarDaysIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

type TemporalDatasetProps = {
  layers: DefaultLayerComponent[];
};

type TemporalDatasetItemProps = {
  layer: DefaultLayerComponent;
};

const isCorrectTimeSelect = (timeSelect: unknown): timeSelect is [number, number] => {
  return (
    Array.isArray(timeSelect) &&
    timeSelect.length === 2 &&
    timeSelect.every((t) => typeof t === "number")
  );
};

type TemporalDatasetItemSelectProps = {
  value?: number | undefined;
  disabled?: boolean;
  onChange?: (value: string) => void;
  defaultValue?: number;
  options: { value: number; disabled: boolean }[] | undefined;
};
const TemporalDatasetItemSelect = ({
  value,
  disabled,
  defaultValue,
  onChange,
  options,
}: TemporalDatasetItemSelectProps) => {
  return (
    <Select
      disabled={disabled}
      defaultValue={`${defaultValue}`}
      value={`${value}`}
      onValueChange={onChange}
    >
      <SelectTrigger>
        <div className="flex gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-foreground" />
          <SelectValue aria-label={`${value}`}>{value || defaultValue}</SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {options?.map((option) => (
          <SelectItem disabled={option.disabled} key={option.value} value={`${option.value}`}>
            {option.value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const _getOptions = (params_config: unknown, start?: number, end?: number) => {
  const timeSelect = (params_config as Record<string, unknown>[])?.find(
    (p) => p.key === "time-select",
  )?.default;

  return isCorrectTimeSelect(timeSelect)
    ? Array.from({ length: timeSelect[1] - timeSelect[0] + 1 }, (_, i) => {
        const value = timeSelect[0] + i;
        return {
          value,
          disabled: (!!start && value <= Number(start)) || (!!end && value >= Number(end)),
        };
      })
    : [];
};

const selectTypes = ["absolute", "changes"] as const;
type SelectType = (typeof selectTypes)[number];

const TemporalDatasetItem = ({ layer }: TemporalDatasetItemProps) => {
  const t = useTranslations();

  const [selectType, setSelectedType] = useState<SelectType>("absolute");

  const [layersSettings, setLayersSettings] = useSyncLayersSettings();
  const [layers] = useSyncLayers();

  const { defaultStartYear, layerSlug } = useMemo(() => {
    const defaultStartYear = (
      layer?.layer?.data?.attributes?.params_config as Record<string, unknown>[]
    )?.find((p) => p.key === "startYear")?.default as number | undefined;

    const layerSlug = layer?.layer?.data?.attributes?.slug;
    return { defaultStartYear, layerSlug };
  }, [layer?.layer?.data?.attributes]);

  const { startYear, endYear, isDisabled } = useMemo(() => {
    const startYear = !!layerSlug
      ? (layersSettings?.[layerSlug]?.startYear as number | undefined)
      : undefined;
    const endYear =
      selectType === "changes" && !!layerSlug
        ? (layersSettings?.[layerSlug]?.endYear as number | undefined)
        : undefined;
    const isDisabled = !layerSlug || !layers?.includes(layerSlug);

    return { startYear, endYear, isDisabled };
  }, [layerSlug, layers, layersSettings]);

  const startYearOptions = useMemo(
    () => _getOptions(layer?.layer?.data?.attributes?.params_config, undefined, endYear),
    [layer, endYear],
  );
  const endYearOptions = useMemo(
    () => _getOptions(layer?.layer?.data?.attributes?.params_config, startYear),
    [layer, startYear],
  );

  const defaultEndYear = useMemo(() => {
    return endYearOptions?.[endYearOptions.length - 1]?.value;
  }, [endYearOptions]);

  const handleChangeValue = (value: string, key: string) => {
    setLayersSettings((prev) => {
      if (!layerSlug) return prev;
      return {
        ...prev,
        [layerSlug]: {
          ...(prev ? prev[layerSlug] : {}),
          [key]: value,
        },
      };
    });
  };

  const handleSelectType = (value: SelectType) => {
    setSelectedType(value);
  };

  useEffect(() => {
    if (selectType === "absolute") {
      setLayersSettings((prev) => {
        if (!layerSlug) return prev;
        return {
          ...prev,
          [layerSlug]: {
            ...(prev ? prev[layerSlug] : {}),
            endYear: 0,
          },
        };
      });
    } else {
      setLayersSettings((prev) => {
        if (!layerSlug) return prev;
        return {
          ...prev,
          [layerSlug]: {
            ...(prev ? prev[layerSlug] : {}),
            endYear: defaultEndYear,
          },
        };
      });
    }
  }, [selectType, layerSlug]);

  return (
    <div className="space-y-4">
      <RadioGroup
        className="flex gap-4 text-xs"
        onValueChange={handleSelectType}
        disabled={isDisabled}
        defaultValue={selectType}
      >
        <div className="flex gap-2">
          <RadioGroupItem
            id="dataset-absolute"
            className="flex h-4 w-4 items-center justify-center rounded-full border border-foreground"
            value={selectTypes[0]}
          />
          <label htmlFor="dataset-absolute" className="flex items-center gap-2">
            {t("See absolute value")}
          </label>
        </div>
        <div className="flex gap-2">
          <RadioGroupItem
            id="dataset-changes"
            className="flex h-4 w-4 items-center justify-center rounded-full border border-foreground"
            value={selectTypes[1]}
          />
          <label htmlFor="dataset-changes" className="flex items-center gap-2">
            {t("See changes over time")}
          </label>
        </div>
      </RadioGroup>
      <div className="flex gap-2 text-xs">
        <div className="flex-1 space-y-1">
          {selectType === "changes" && <span>{t("Start date")}</span>}
          <TemporalDatasetItemSelect
            onChange={(v) => handleChangeValue(v, "startYear")}
            options={startYearOptions}
            disabled={isDisabled}
            value={startYear}
            defaultValue={defaultStartYear}
          />
        </div>
        {selectType === "changes" && (
          <div className="flex-1 space-y-1">
            <span>{t("End date")}</span>
            <TemporalDatasetItemSelect
              onChange={(v) => handleChangeValue(v, "endYear")}
              options={endYearOptions}
              disabled={isDisabled}
              value={endYear}
              defaultValue={defaultEndYear}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const TemporalChangesDataset = ({ layers }: TemporalDatasetProps) => {
  return layers?.map((layer) => {
    if (!layer?.layer?.data?.attributes?.slug) return null;
    return (
      <div key={layer.id} className="space-y-2">
        {layers.length > 1 && <h2>{layer.name}</h2>}
        <TemporalDatasetItem layer={layer} />
      </div>
    );
  });
};

export default TemporalChangesDataset;
