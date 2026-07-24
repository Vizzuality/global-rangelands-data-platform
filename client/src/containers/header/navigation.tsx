"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { NavigationMenuContent, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@radix-ui/react-navigation-menu";
import { useTranslations } from "@/i18n";
import HomeLink from "@/components/ui/home-link";
import { CATEGORY_ORDER } from "@/containers/stories/categories";
import { ChevronDown, Languages } from "lucide-react";

const STORY_CATEGORY_LABELS: Record<string, string> = {
  "atlas-stories": "Atlas Stories",
  "restoration-investments": "Investment Cases",
  "restoration-champions": "Restoration Champions",
};

const HeaderNavigation = () => {
  const pathname = usePathname();
  const t = useTranslations();

  const NAVIGATION_ITEMS = [
    {
      title: t("Explore Map"),
      href: "/map",
    },
    {
      title: t("Home"),
      href: "/",
    },
  ];

  const STORY_CATEGORY_ITEMS = CATEGORY_ORDER.map((slug) => ({
    slug,
    title: t(STORY_CATEGORY_LABELS[slug]),
    href: `/stories/${slug}`,
  }));

  const isMap = pathname === "/map" || pathname.startsWith("/map/");
  const isStories = pathname.startsWith("/stories");
  const whiteChrome = isMap || isStories;

  return (
    <div className="flex-1">
      <NavigationMenu className="w-full justify-between">
        <NavigationMenuList className="flex w-full flex-1 items-center justify-between">
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <HomeLink className={whiteChrome ? "text-white" : "text-global"} />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <div className="flex gap-10">
            <NavigationMenuItem
              className={cn(
                "relative flex h-[var(--header-height)] items-center border-t-4 border-t-transparent pb-1 text-sm transition-colors duration-300",
                isStories && "border-white text-global",
                whiteChrome ? "text-white hover:text-white/70" : "text-foreground",
              )}
            >
              <NavigationMenuTrigger className="h-auto w-auto bg-transparent p-1 text-sm font-normal hover:bg-transparent hover:text-inherit focus:bg-transparent focus:text-inherit focus-visible:outline-none focus-visible:ring focus-visible:ring-white focus-visible:ring-offset-1 data-[state=open]:bg-transparent">
                {t("Stories")}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="absolute left-0 top-[calc(100%+8px)] z-50 flex min-w-[240px] flex-col gap-0.5 rounded-lg border border-black/5 bg-white p-2 text-brown-dark shadow-xl">
                {STORY_CATEGORY_ITEMS.map((item) => (
                  <NavigationMenuLink key={item.slug} asChild>
                    <Link
                      className="block rounded-md px-3 py-2 text-sm text-brown-dark transition-colors hover:bg-brown-dark/5"
                      href={item.href}
                    >
                      {item.title}
                    </Link>
                  </NavigationMenuLink>
                ))}
              </NavigationMenuContent>
            </NavigationMenuItem>
            {NAVIGATION_ITEMS.map((item) => {
              const isActive =
                item.href === pathname ||
                (item.href !== "/" && pathname.startsWith(`${item.href}/`));
              return (
                <NavigationMenuItem
                  key={item.href}
                  className={cn(
                    "flex h-[var(--header-height)] items-center border-t-4 border-t-transparent pb-1 text-sm transition-colors duration-300",
                    isActive && "border-white text-global",
                    whiteChrome ? "text-white hover:text-white/70" : "text-foreground",
                  )}
                >
                  <NavigationMenuLink active={isActive} asChild>
                    <Link
                      className="p-1 focus-visible:outline-none focus-visible:ring focus-visible:ring-white focus-visible:ring-offset-1"
                      href={item.href}
                    >
                      {item.title}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
            {isStories && (
              <div className="flex items-center gap-4 text-sm font-medium text-white">
                <div className="h-5 w-px bg-white" aria-hidden="true" />
                <div className="flex items-center gap-2">
                  <Languages aria-hidden="true" className="size-5" />
                  <span>{t("English")}</span>
                  <ChevronDown aria-hidden="true" className="size-5" />
                </div>
              </div>
            )}
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

export default HeaderNavigation;
