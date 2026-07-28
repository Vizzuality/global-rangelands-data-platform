"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTranslations } from "@/i18n";
import HomeLink from "@/components/ui/home-link";
import StoryCategoriesMenu, {
  StoryCategoriesMenuScrim,
  StoryCategoriesTriggerBlock,
  storyCategoriesTriggerClassName,
} from "@/containers/stories/categories-menu";

const HeaderNavigation = () => {
  const pathname = usePathname();
  const t = useTranslations();
  const [storiesOpen, setStoriesOpen] = useState(false);

  const NAVIGATION_ITEMS = [
    { title: t("Explore Map"), href: "/map", coveredByStoriesMenu: true },
    { title: t("Home"), href: "/", coveredByStoriesMenu: false },
  ];

  const isMap = pathname === "/map" || pathname.startsWith("/map/");
  const isStories = pathname.startsWith("/stories");
  const whiteChrome = isMap || isStories;

  const itemClassName = (active: boolean) =>
    cn(
      "flex h-[var(--header-height)] items-center border-t-4 border-t-transparent pb-1 text-sm outline-none transition-[color,opacity] duration-300 focus-visible:ring focus-visible:ring-white focus-visible:ring-offset-1",
      active && "border-white text-global",
      whiteChrome ? "text-white hover:text-white/70" : "text-foreground",
    );

  return (
    <>
      <StoryCategoriesMenuScrim open={storiesOpen} />
      <div
        className={cn(
          "z-50",
          isStories
            ? "absolute inset-x-0 top-0 bg-transparent"
            : "relative bg-brown-light bg-[url(/images/header-pattern.png)] bg-contain bg-repeat-x",
        )}
      >
        <div className="mx-6 flex items-center justify-between gap-7">
          <div className="flex-1">
            <nav className="flex w-full items-center justify-between">
              <HomeLink className={whiteChrome ? "text-white" : "text-global"} />
              <div className="flex gap-10">
                <DropdownMenu open={storiesOpen} onOpenChange={setStoriesOpen}>
                  <DropdownMenuTrigger
                    className={cn(itemClassName(isStories), storyCategoriesTriggerClassName)}
                  >
                    <StoryCategoriesTriggerBlock />
                    {t("Stories")}
                    <ChevronDown
                      aria-hidden="true"
                      className="size-5 transition-transform duration-300"
                    />
                  </DropdownMenuTrigger>
                  <StoryCategoriesMenu align="center" sideOffset={0} />
                </DropdownMenu>
                {NAVIGATION_ITEMS.map((item) => {
                  const isActive =
                    item.href === pathname ||
                    (item.href !== "/" && pathname.startsWith(`${item.href}/`));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        itemClassName(isActive),
                        "px-1",
                        item.coveredByStoriesMenu && storiesOpen && "pointer-events-none opacity-0",
                      )}
                    >
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeaderNavigation;
