"use client";

import { Link, usePathname } from "@/navigation";
import RangelandLogoIcon from "@/svgs/rangeland-logo.svg";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@radix-ui/react-navigation-menu";
import { useTranslations } from "@/i18n";

const HeaderNavigation = () => {
  const pathname = usePathname();
  const t = useTranslations();

  const NAVIGATION_ITEMS = [
    {
      title: t("Explore Map"),
      href: "/map",
    },
  ];

  return (
    <div className="flex-1">
      <NavigationMenu className="w-full justify-between">
        <NavigationMenuList className="flex w-full flex-1 items-center justify-between">
          <NavigationMenuItem>
            <NavigationMenuLink asChild>
              <Link href="/" className="flex gap-4">
                <RangelandLogoIcon className="fill-global" />
                <h1 className="w-32 text-sm text-white">{t("Rangelands Data Platform")}</h1>
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = item.href === pathname;
            return (
              <NavigationMenuItem
                key={item.href}
                className={cn(
                  "flex h-[var(--header-height)] items-center border-t-4 border-t-transparent pb-1 text-sm text-white transition-colors duration-300",
                  isActive && "border-global text-global",
                )}
              >
                <NavigationMenuLink active={isActive} asChild>
                  <Link href={item.href}>{item.title}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

export default HeaderNavigation;
