import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSyncLayers, useSyncLayersSettings } from "@/store/map";
import { LayerListResponseDataItem } from "@/types/generated/strapi.schemas";
import { CalendarDaysIcon } from "lucide-react";

type TemporalDatasetItemProps = {
  layer:
    | (LayerListResponseDataItem & {
        type?: string;
      })
    | undefined;
};

const isCorrectTimeSelect = (timeSelect: unknown): timeSelect is [number, number] => {
  return (
    Array.isArray(timeSelect) &&
    timeSelect.length === 2 &&
    timeSelect.every((t) => typeof t === "number")
  );
};

const isCorrectTimeValues = (timeValues: unknown): timeValues is number[] => {
  return Array.isArray(timeValues) && timeValues.every((t) => typeof t === "number");
};
export const TemporalDatasetItem = ({ layer }: TemporalDatasetItemProps) => {
  const timeSelect = (layer?.attributes?.params_config as Record<string, unknown>[])?.find(
    (p) => p.key === "time-select",
  )?.default;
  const timeValues = (layer?.attributes?.params_config as Record<string, unknown>[])?.find(
    (p) => p.key === "time-values",
  )?.default;
  const defaultSelected = (layer?.attributes?.params_config as Record<string, unknown>[])?.find(
    (p) => p.key === "startYear",
  )?.default;

  const [layersSettings, setLayersSettings] = useSyncLayersSettings();
  const [layers] = useSyncLayers();

  const options =
    timeValues && isCorrectTimeValues(timeValues)
      ? timeValues
      : isCorrectTimeSelect(timeSelect)
        ? Array.from({ length: timeSelect[1] - timeSelect[0] + 1 }, (_, i) => timeSelect[0] + i)
        : undefined;

  const layerSlug = layer?.attributes?.slug;

  const onSelectTime = (value: string) => {
    setLayersSettings((prev) => {
      if (!layerSlug) return prev;
      return {
        ...prev,
        [layerSlug]: {
          ...(prev ? prev[layerSlug] : {}),
          startYear: parseInt(value),
        },
      };
    });
  };

  const value = layerSlug && (layersSettings?.[layerSlug]?.startYear as string | undefined);
  const defaultValue = typeof defaultSelected === "number" ? `${defaultSelected}` : undefined;
  const isDisabled = !layerSlug || !layers?.includes(layerSlug);

  return (
    <Select
      disabled={isDisabled}
      defaultValue={defaultValue}
      value={value}
      onValueChange={onSelectTime}
    >
      <SelectTrigger>
        <div className="flex gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-foreground transition-colors duration-300 group-hover:text-white group-focus:text-white group-disabled:text-hunter-green-300" />
          <SelectValue aria-label={value}>{value || defaultValue}</SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {options?.map((option) => (
          <SelectItem key={option} value={`${option}`}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
