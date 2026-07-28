"use client";

import type { ComponentPropsWithoutRef } from "react";

import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import { DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import PeopleIcon from "@/svgs/dataset-categories/people.svg";
import { CATEGORY_DESCRIPTIONS, CATEGORY_ORDER, STORY_CATEGORY_LABELS } from "./categories";

export const storyCategoriesTriggerClassName = cn(
  "relative isolate gap-2 px-4 font-medium",
  "data-[state=open]:border-t-transparent data-[state=open]:text-white",
  "[&[data-state=open]>span]:w-[336px] [&[data-state=open]>span]:opacity-100",
  "[&[data-state=open]>svg]:rotate-180",
);

export const StoryCategoriesMenuScrim = ({ open }: { open: boolean }) => (
  <div
    aria-hidden
    className={cn(
      "fixed inset-0 z-[45] bg-green-dark/30 backdrop-blur-sm transition-opacity duration-200",
      open ? "opacity-100" : "pointer-events-none opacity-0",
    )}
  />
);

export const StoryCategoriesTriggerBlock = ({ className }: { className?: string }) => (
  <span
    aria-hidden
    className={cn(
      "absolute inset-y-0 left-1/2 -z-10 w-full -translate-x-1/2 bg-green-medium opacity-0 transition-[width,opacity] duration-200",
      className,
    )}
  />
);

const StoryCategoriesMenu = ({
  className,
  ...props
}: ComponentPropsWithoutRef<typeof DropdownMenuContent>) => {
  const t = useTranslations();
  const pathname = usePathname();

  const categories = CATEGORY_ORDER.map((slug) => ({
    slug,
    title: t(STORY_CATEGORY_LABELS[slug]),
    description: CATEGORY_DESCRIPTIONS[slug],
    href: `/stories/${slug}`,
  }));

  return (
    <DropdownMenuContent
      className={cn(
        "w-[400px] origin-top border-0 bg-transparent p-0 shadow-none data-[state=closed]:animate-dropdown-out data-[state=open]:animate-dropdown-in",
        className,
      )}
      {...props}
    >
      {categories.map((category, index) => {
        const isCurrent = pathname === category.href || pathname.startsWith(`${category.href}/`);

        return (
          <div key={category.slug}>
            {index > 0 && (
              <div aria-hidden className="px-8">
                <div className="h-2 bg-green-medium" />
              </div>
            )}
            <DropdownMenuItem asChild className="rounded-none p-0">
              <Link
                aria-current={isCurrent ? "page" : undefined}
                className="flex w-full items-center gap-6 bg-white px-6 py-4 text-left transition-colors hover:bg-hunter-green-50 focus:bg-hunter-green-50"
                href={category.href}
              >
                <PeopleIcon aria-hidden className="size-6 shrink-0 text-foreground" />
                <span className="flex flex-1 flex-col gap-2">
                  <span className="font-serif text-2xl leading-7 text-foreground">
                    {category.title}
                  </span>
                  {category.description && (
                    <span className="font-sans text-sm leading-4 text-foreground">
                      {category.description}
                    </span>
                  )}
                </span>
              </Link>
            </DropdownMenuItem>
          </div>
        );
      })}
      <div aria-hidden className="px-8">
        <div className="h-[34px] bg-green-medium" />
      </div>
    </DropdownMenuContent>
  );
};

export default StoryCategoriesMenu;
