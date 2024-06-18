import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSyncLayersSettings } from "@/store/map";
import { DefaultLayerComponent } from "@/types/generated/strapi.schemas";
import { CalendarDaysIcon } from "lucide-react";

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
const TemporalDatasetItem = ({ layer }: TemporalDatasetItemProps) => {
  const timeSelect = (
    layer?.layer?.data?.attributes?.params_config as Record<string, unknown>[]
  )?.find((p) => p.key === "time-select")?.default;
  const defaultSelected = (
    layer?.layer?.data?.attributes?.params_config as Record<string, unknown>[]
  )?.find((p) => p.key === "year")?.default;

  console.log(defaultSelected);

  const [layersSettings, setLayersSettings] = useSyncLayersSettings();

  const options = isCorrectTimeSelect(timeSelect)
    ? Array.from({ length: timeSelect[1] - timeSelect[0] + 1 }, (_, i) => timeSelect[0] + i)
    : undefined;

  const layerSlug = layer?.layer?.data?.attributes?.slug;

  const onSelectTime = (value: string) => {
    setLayersSettings((prev) => {
      if (!layerSlug) return prev;
      return {
        ...prev,
        [layerSlug]: {
          ...(prev ? prev[layerSlug] : {}),
          year: parseInt(value),
        },
      };
    });
  };

  const value = layerSlug && (layersSettings?.[layerSlug]?.year as string | undefined);
  const defaultValue = typeof defaultSelected === "number" ? `${defaultSelected}` : undefined;

  return (
    <Select defaultValue={defaultValue} value={value} onValueChange={onSelectTime}>
      <SelectTrigger>
        <div className="flex gap-2">
          <CalendarDaysIcon className="h-5 w-5 text-foreground" />
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

const TemporalDataset = ({ layers }: TemporalDatasetProps) => {
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

export default TemporalDataset;
