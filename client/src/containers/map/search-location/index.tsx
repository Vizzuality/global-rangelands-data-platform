"use client";

import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  SearchResultItem,
  SearchResultItemNotFound,
  SearchResultList,
} from "@/components/ui/search-location";
import { useOpenStreetMapsLocations } from "@/hooks/openstreetmaps";
import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import { PopoverClose } from "@radix-ui/react-popover";
import { ChevronRightIcon, MapIcon, MapPinIcon, SearchIcon, XIcon } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { LngLatBoundsLike, useMap } from "react-map-gl";
import { useDebouncedValue } from "rooks";

type LocationOption = {
  value: number | undefined;
  label: string;
  bbox: LngLatBoundsLike;
};

type StoryOption = Omit<LocationOption, "bbox">;

type SearchLocationProps = {
  onOpenChange: (open: boolean) => void;
};
const SearchLocation = ({ onOpenChange }: SearchLocationProps) => {
  const t = useTranslations();

  const [open, setOpen] = useState(true);
  const [locationSearch, setLocationSearch] = useState("");

  const { current: map } = useMap();

  const [debouncedSearch] = useDebouncedValue(locationSearch, 500);

  const { data: locationData = [] } = useOpenStreetMapsLocations(
    {
      q: debouncedSearch,
      format: "json",
      limit: 5,
    },
    {
      enabled: debouncedSearch.length >= 1,
      placeholderData: (prev) => prev,
    },
  );

  const locationOptions = useMemo(() => {
    if (!Array.isArray(locationData) || debouncedSearch.length < 1) return [];
    return locationData?.reduce<LocationOption[]>((prev, curr) => {
      if (!curr.boundingbox) return prev;
      // nominatim boundingbox: [min latitude, max latitude, min longitude, max longitude]
      const [minLat, maxLat, minLng, maxLng] = curr.boundingbox;

      // mapbox bounds
      // [[lng, lat] - southwestern corner of the bounds
      // [lng, lat]] - northeastern corner of the bounds
      const mapboxBounds = [
        [Number(minLng), Number(minLat)],
        [Number(maxLng), Number(maxLat)],
      ];

      return [
        ...prev,
        {
          value: curr.place_id ?? undefined,
          label: curr.display_name ?? "",
          bbox: mapboxBounds as LngLatBoundsLike,
        },
      ];
    }, []);
  }, [locationData, debouncedSearch]);

  // TODO: add real stories
  const storiesOptions: StoryOption[] = [];

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocationSearch(e.target.value);
  }, []);

  const handleOptionClick = useCallback(
    (option: LocationOption) => {
      if (map) {
        map.fitBounds(option.bbox, {
          duration: 1000,
          padding: { top: 50, bottom: 50, left: 350, right: 50 },
        });
        setLocationSearch("");
        setOpen(false);
        onOpenChange(false);
      }
    },
    [map],
  );

  const handleStoryOptionClick = useCallback((option: StoryOption) => {
    // TODO: handle story option click
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setLocationSearch("");
    setOpen(open);
    onOpenChange(open);
  }, []);

  return (
    <div>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            onClick={() => setOpen(!open)}
            variant="ghost"
            className="transition-color block h-min rounded-full border-2 border-background bg-background px-2 py-2 shadow-black/10 drop-shadow-md duration-300 hover:bg-orange-100 focus-visible:bg-global data-[state=open]:bg-global"
          >
            <SearchIcon className="h-5 w-5 stroke-foreground stroke-[1.5px]" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align={!debouncedSearch.length ? "center" : "start"}
          sideOffset={20}
          side="left"
          className={cn(
            "relative z-50 w-[348px] overflow-hidden rounded-lg bg-background px-0 py-0 shadow-lg drop-shadow-2xl",
            !!debouncedSearch.length && "mb-5",
          )}
        >
          <div>
            <div className="relative flex items-center justify-between p-1">
              <SearchIcon className="absolute left-3 h-5 w-5 stroke-slate-300 stroke-[1.5px]" />
              <input
                onChange={handleSearchChange}
                type="text"
                value={locationSearch}
                placeholder={t("Search")}
                className="w-full border-2 border-background bg-background p-2 px-9 text-sm leading-none text-foreground placeholder:text-sm placeholder:font-light placeholder:text-popover-foreground/50 focus-visible:outline-global"
              />
              {locationSearch.length >= 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocationSearch("")}
                  className="absolute right-9 h-fit w-fit rounded-full p-0.5 hover:bg-orange-100 focus-visible:ring-global data-[state=open]:bg-global"
                >
                  <XIcon className="h-4 w-4 stroke-slate-400 stroke-[1.5px]" />
                </Button>
              )}
              <PopoverClose className="mr-1 h-fit w-fit rounded-full p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-global">
                <ChevronRightIcon className="mx-auto h-5 w-5" />
              </PopoverClose>
            </div>

            {!!debouncedSearch.length && (
              <SearchResultList title={t("Locations")}>
                {!!locationOptions?.length ? (
                  locationOptions.map((option) => (
                    <SearchResultItem
                      key={option.value}
                      option={option}
                      onOptionClick={handleOptionClick}
                    >
                      <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                    </SearchResultItem>
                  ))
                ) : (
                  <SearchResultItemNotFound>
                    <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  </SearchResultItemNotFound>
                )}
              </SearchResultList>
            )}

            {!!debouncedSearch?.length && (
              <SearchResultList title={t("Rangelands stories")}>
                {storiesOptions?.length ? (
                  storiesOptions.map((option) => (
                    <SearchResultItem
                      key={option.value}
                      option={option}
                      onOptionClick={handleStoryOptionClick}
                    >
                      <MapIcon className="mt-0.5 h-4 w-4 shrink-0" />
                    </SearchResultItem>
                  ))
                ) : (
                  <SearchResultItemNotFound>
                    <MapIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  </SearchResultItemNotFound>
                )}
              </SearchResultList>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SearchLocation;
