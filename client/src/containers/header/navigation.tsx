"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@radix-ui/react-navigation-menu";
import { useTranslations } from "@/i18n";
import HomeLink from "@/components/ui/home-link";

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

  const isMap = pathname === "/map";

  return (
    <div className="flex-1">
      <NavigationMenu className="w-full justify-between">
        <NavigationMenuList className="flex w-full flex-1 items-center justify-between">
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <HomeLink className={isMap ? "text-white" : "text-global"} />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <div className="flex gap-10">
            {NAVIGATION_ITEMS.map((item) => {
              const isActive = item.href === pathname;
              return (
                <NavigationMenuItem
                  key={item.href}
                  className={cn(
                    "flex h-[var(--header-height)] items-center border-t-4 border-t-transparent pb-1 text-sm transition-colors duration-300",
                    isActive && "border-white text-global",
                    isMap ? "text-white hover:text-white/70" : "text-foreground",
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
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

export default HeaderNavigation;
