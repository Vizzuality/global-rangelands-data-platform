import { ChevronDown, FilterIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import {
  ButtonHTMLAttributes,
  ComponentType,
  ReactNode,
  forwardRef,
  useEffect,
  useState,
} from "react";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible";
import { ScrollArea } from "./scroll-area";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

interface MultiSelectOption {
  label: string;
  value: string;
  icon?: ComponentType<{ className?: string; selected: boolean }>;
  options?: Omit<MultiSelectOption, "options">[];
}

interface MultiSelectProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  options: MultiSelectOption[];
  onValueChange: (value: string[]) => void;
  defaultValue: string[];
  // placeholder?: string;
  className?: string;
  triggerLabel?: ReactNode;
}

type MultiSelectItemProps = {
  option: MultiSelectOption;
  toggleOption: (value: string) => void;
  isSelected: boolean;
};
const MultiSelectItem = ({ option, toggleOption, isSelected }: MultiSelectItemProps) => {
  return (
    <CommandItem
      onSelect={() => toggleOption(option.value)}
      style={{ pointerEvents: "auto", opacity: 1 }}
      className="flex cursor-pointer items-center justify-between gap-2"
    >
      <div className="flex items-center gap-1">
        <span
          className={cn(
            "text-xs underline-offset-2 hover:underline",
            isSelected && "font-semibold",
          )}
        >
          {option.label}
        </span>
      </div>
      {option.icon && <option.icon selected={isSelected} />}
    </CommandItem>
  );
};

export const MultiSelect = forwardRef<HTMLButtonElement, MultiSelectProps>(
  ({ options, onValueChange, defaultValue = [], className, triggerLabel }, ref) => {
    const [selectedValues, setSelectedValues] = useState<string[]>(defaultValue);
    const [isCollapsibleOpen, setIsCollapsibleOpen] = useState(false);

    useEffect(() => {
      if (JSON.stringify(selectedValues) !== JSON.stringify(defaultValue)) {
        setSelectedValues(defaultValue);
      }
    }, [defaultValue, selectedValues]);

    // const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    //   if (event.key === "Enter") {
    //     setIsCollapsibleOpen(true);
    //   } else if (event.key === "Backspace" && !event.currentTarget.value) {
    //     const newSelectedValues = [...selectedValues];
    //     newSelectedValues.pop();
    //     setSelectedValues(newSelectedValues);
    //     onValueChange(newSelectedValues);
    //   }
    // };

    const toggleOption = (value: string) => {
      const newSelectedValues = selectedValues.includes(value)
        ? selectedValues.filter((v) => v !== value)
        : [...selectedValues, value];
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    // const handleClear = () => {
    //   setSelectedValues([]);
    //   onValueChange([]);
    // };

    return (
      <Popover open={isCollapsibleOpen} onOpenChange={setIsCollapsibleOpen}>
        <Collapsible disabled={!options.length} open={isCollapsibleOpen} className={className}>
          <PopoverTrigger asChild>
            <CollapsibleTrigger
              ref={ref}
              className={cn(
                "border-input placeholder:text-muted-foreground group flex h-10 w-full items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background hover:bg-orange-100 focus:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-background data-[state=open]:rounded-b-none data-[state=open]:border-b-0 [&>span]:line-clamp-1",
              )}
            >
              <FilterIcon className="h-5 w-5" />
              <div className="flex-1">{triggerLabel}</div>
              <ChevronDown className="h-5 w-5 shrink-0 opacity-50 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
          </PopoverTrigger>
          <PopoverContent className="p-0" asChild>
            <CollapsibleContent className="border-input w-[--radix-popover-trigger-width] rounded-md border bg-background p-0 shadow-lg data-[state=open]:rounded-t-none">
              <ScrollArea className="max-h-[500px]">
                <Command>
                  {/* <CommandInput placeholder="Search..." onKeyDown={handleInputKeyDown} /> */}
                  <CommandList className="space-y-2 p-3">
                    <CommandGroup className="p-0">
                      {options.map((group) => {
                        if (group.options?.length) {
                          return (
                            <Collapsible
                              disabled={!group.options?.length}
                              key={group.label}
                              className="w-full"
                            >
                              <CollapsibleTrigger className="group mb-2 flex w-full items-center gap-3">
                                <span
                                  className={cn(
                                    "flex-1 text-start text-sm",
                                    group.options?.some((option) =>
                                      selectedValues.includes(option.value),
                                    ) && "font-bold",
                                  )}
                                >
                                  {group.label}
                                </span>
                                {group.options?.some((option) =>
                                  selectedValues.includes(option.value),
                                ) && (
                                  <span className="text-xs font-bold text-foreground">
                                    {
                                      group.options.filter((option) =>
                                        selectedValues.includes(option.value),
                                      ).length
                                    }
                                  </span>
                                )}
                                {group.icon && <group.icon selected={false} />}
                                <ChevronDown className="h-4 w-4 group-data-[state=open]:rotate-180 group-data-[state=closed]:stroke-gray-400" />
                              </CollapsibleTrigger>
                              <CollapsibleContent className="pb-5">
                                {group.options?.map((option) => {
                                  const isSelected = selectedValues.includes(option.value);
                                  return (
                                    <MultiSelectItem
                                      key={option.value}
                                      option={option}
                                      toggleOption={toggleOption}
                                      isSelected={isSelected}
                                    />
                                  );
                                })}
                              </CollapsibleContent>
                            </Collapsible>
                          );
                        }

                        return (
                          <MultiSelectItem
                            option={group}
                            toggleOption={toggleOption}
                            isSelected={selectedValues.includes(group.value)}
                            key={group.value}
                          />
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </ScrollArea>
            </CollapsibleContent>
          </PopoverContent>
        </Collapsible>
      </Popover>
    );
  },
);

MultiSelect.displayName = "MultiSelect";
