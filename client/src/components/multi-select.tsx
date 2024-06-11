import { ChevronDown, FilterIcon, XIcon } from "lucide-react";

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

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { ScrollArea } from "./ui/scroll-area";
import { DialogTrigger, Dialog, DialogContent } from "@radix-ui/react-dialog";

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
      className="flex cursor-pointer items-center justify-between"
    >
      <div className="flex items-center gap-1">
        {isSelected && <XIcon className="h-4 w-4 flex-shrink-0" />}
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
    }, [defaultValue]);

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
      <Dialog open={isCollapsibleOpen} onOpenChange={setIsCollapsibleOpen}>
        <Collapsible disabled={!options.length} open={isCollapsibleOpen} className={className}>
          <DialogTrigger asChild>
            <CollapsibleTrigger
              ref={ref}
              className={cn(
                "border-input placeholder:text-muted-foreground group flex h-10 w-full items-center justify-between gap-3 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background hover:bg-orange-100 focus:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-100 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:rounded-b-none data-[state=open]:border-b-0 [&>span]:line-clamp-1",
              )}
            >
              <FilterIcon className="h-5 w-5" />
              <div className="flex-1">{triggerLabel}</div>
              <ChevronDown className="h-5 w-5 opacity-50 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
          </DialogTrigger>
          <DialogContent asChild>
            <CollapsibleContent className="border-input w-full rounded-md border bg-background p-0 shadow-lg data-[state=open]:rounded-t-none">
              <ScrollArea className="max-h-[500px]">
                <Command>
                  {/* <CommandInput placeholder="Search..." onKeyDown={handleInputKeyDown} /> */}
                  <CommandList className="space-y-2 p-3 pl-10">
                    <CommandGroup>
                      {options.map((group) => {
                        if (group.options?.length) {
                          return (
                            <Collapsible
                              disabled={!group.options?.length}
                              key={group.label}
                              className="w-full"
                            >
                              <CollapsibleTrigger className="group mb-3 flex w-full items-center gap-3">
                                <span className="flex-1 text-start text-sm">{group.label}</span>
                                {group.icon && <group.icon selected={false} />}
                                <ChevronDown className="h-4 w-4 group-data-[state=open]:rotate-180 group-data-[state=closed]:stroke-gray-400" />
                              </CollapsibleTrigger>
                              <CollapsibleContent className="pl-8">
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
          </DialogContent>
        </Collapsible>
      </Dialog>
    );
  },
);

MultiSelect.displayName = "MultiSelect";
