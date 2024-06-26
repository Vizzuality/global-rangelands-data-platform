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
import { CalendarDaysIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";

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

type TemporalDatasetItemProps = {
  layer: DefaultLayerComponent;
  selectType: SelectType;
};
export const TemporalChangesDatasetItem = ({ layer, selectType }: TemporalDatasetItemProps) => {
  const t = useTranslations();

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
