"use client";

import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import HomeLink from "@/components/ui/home-link";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  CATEGORY_DESCRIPTIONS,
  CATEGORY_ORDER,
  FEATURE_CATEGORY_LABELS,
} from "@/containers/features/categories";
import BarsIcon from "@/svgs/bars-3.svg";
import XMarkIcon from "@/svgs/x-mark.svg";
import ChevronDownIcon from "@/svgs/chevron-down.svg";
import { isNavItemActive } from "./utils";

const itemClassName = (active: boolean) =>
  cn(
    "flex h-10 w-full items-center font-sans text-base font-medium leading-[26px] text-champion-ink",
    active && "border-b-4 border-champion-ink",
  );

type MobileMenuProps = {
  triggerClassName?: string;
};

const MobileMenu = ({ triggerClassName }: MobileMenuProps) => {
  const pathname = usePathname();
  const t = useTranslations();

  const isFeaturesActive = isNavItemActive(pathname, "/features");
  const items = [
    { title: t("Explore Map"), href: "/map" },
    { title: t("Home"), href: "/" },
  ];
  const categories = CATEGORY_ORDER.map((slug) => ({
    slug,
    title: t(FEATURE_CATEGORY_LABELS[slug]),
    description: CATEGORY_DESCRIPTIONS[slug],
    href: `/features/${slug}`,
  }));

  const [open, setOpen] = useState(false);
  const [openedPathname, setOpenedPathname] = useState(pathname);

  if (openedPathname !== pathname) {
    setOpenedPathname(pathname);
    setOpen(false);
  }

  const handleClose = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const query = window.matchMedia("(min-width: 1024px)");
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, [open]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        aria-label="Open menu"
        className={cn(
          "flex size-8 items-center justify-center outline-none focus-visible:ring focus-visible:ring-current lg:hidden",
          triggerClassName,
        )}
      >
        <BarsIcon aria-hidden className="size-8" />
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 overflow-y-auto bg-white lg:hidden"
        >
          <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>
          <div className="mx-5 flex h-[var(--mobile-header-height)] items-center justify-between">
            <HomeLink responsive className="text-champion-ink" />
            <DialogPrimitive.Close
              aria-label="Close menu"
              className="flex size-8 items-center justify-center text-champion-ink outline-none focus-visible:ring focus-visible:ring-current"
            >
              <XMarkIcon aria-hidden className="size-8" />
            </DialogPrimitive.Close>
          </div>
          <nav className="mt-10 flex flex-col gap-6 px-6">
            <Collapsible className="min-h-11">
              <CollapsibleTrigger
                className={cn(itemClassName(isFeaturesActive), "group justify-between")}
              >
                {t("Features")}
                <ChevronDownIcon
                  aria-hidden
                  className="size-5 transition-transform duration-300 group-data-[state=open]:rotate-180"
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <ul className="flex flex-col gap-4 px-6 pt-6">
                  {categories.map((category) => {
                    const isCurrent = isNavItemActive(pathname, category.href);
                    return (
                      <li key={category.slug}>
                        <Link
                          href={category.href}
                          aria-current={isCurrent ? "page" : undefined}
                          onClick={handleClose}
                          className="flex flex-col gap-1 text-champion-ink"
                        >
                          <span className="text-base font-medium leading-[26px]">
                            {category.title}
                          </span>
                          {category.description && (
                            <span className="text-sm font-light leading-4">
                              {category.description}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </CollapsibleContent>
            </Collapsible>
            {items.map((item) => {
              const isActive = isNavItemActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={handleClose}
                  className={itemClassName(isActive)}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>
          <p className="absolute bottom-6 left-6 font-sans text-sm leading-[26px] text-champion-ink opacity-80">
            © Data Rangelands, 2025
          </p>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default MobileMenu;
