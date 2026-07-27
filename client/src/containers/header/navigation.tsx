"use client";

import { ChevronDown } from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslations } from "@/i18n";
import HomeLink from "@/components/ui/home-link";
import { CATEGORY_ORDER, STORY_CATEGORY_LABELS } from "@/containers/stories/categories";

const HeaderNavigation = () => {
  const pathname = usePathname();
  const t = useTranslations();

  const NAVIGATION_ITEMS = [
    { title: t("Explore Map"), href: "/map" },
    { title: t("Home"), href: "/" },
  ];

  const STORY_CATEGORY_ITEMS = CATEGORY_ORDER.map((slug) => ({
    slug,
    title: t(STORY_CATEGORY_LABELS[slug]),
    href: `/stories/${slug}`,
  }));

  const isMap = pathname === "/map" || pathname.startsWith("/map/");
  const isStories = pathname.startsWith("/stories");
  const whiteChrome = isMap || isStories;

  const itemClassName = (active: boolean) =>
    cn(
      "flex h-[var(--header-height)] items-center border-t-4 border-t-transparent pb-1 text-sm outline-none transition-colors duration-300 focus-visible:ring focus-visible:ring-white focus-visible:ring-offset-1",
      active && "border-white text-global",
      whiteChrome ? "text-white hover:text-white/70" : "text-foreground",
    );

  return (
    <div
      className={cn(
        "z-50",
        isStories
          ? "absolute inset-x-0 top-0 bg-transparent"
          : "bg-brown-light bg-[url(/images/header-pattern.png)] bg-contain bg-repeat-x",
      )}
    >
      <div className="mx-6 flex items-center justify-between gap-7">
        <div className="flex-1">
          <nav className="flex w-full items-center justify-between">
            <HomeLink className={whiteChrome ? "text-white" : "text-global"} />
            <div className="flex gap-10">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    itemClassName(isStories),
                    "gap-1 [&[data-state=open]>svg]:rotate-180",
                  )}
                >
                  {t("Stories")}
                  <ChevronDown
                    aria-hidden="true"
                    className="size-4 transition-transform duration-300"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={-8}
                  className="flex min-w-[240px] flex-col gap-0.5 rounded-lg border border-black/5 bg-white p-2 text-brown-dark shadow-xl"
                >
                  {STORY_CATEGORY_ITEMS.map((item) => {
                    const isCurrent =
                      pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                      <DropdownMenuItem key={item.slug} asChild>
                        <Link
                          aria-current={isCurrent ? "page" : undefined}
                          className={cn(
                            "block rounded-md px-3 py-2 text-sm text-brown-dark transition-colors hover:bg-brown-dark/5 focus:bg-brown-dark/5",
                            isCurrent && "bg-brown-dark/5 font-medium",
                          )}
                          href={item.href}
                        >
                          {item.title}
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
              {NAVIGATION_ITEMS.map((item) => {
                const isActive =
                  item.href === pathname ||
                  (item.href !== "/" && pathname.startsWith(`${item.href}/`));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(itemClassName(isActive), "px-1")}
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
  );
};

export default HeaderNavigation;
