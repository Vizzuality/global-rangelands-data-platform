"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import OpenCloseArrow from "@/components/ui/open-close-arrow";
import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, locales } from "@/navigation";
import { LanguagesIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";

const variants = {
  trigger: {
    light: "bg-white text-brown-dark",
    dark: "bg-transparent text-white hover:text-white/70",
  },
  menuItems: {
    light: "bg-white text-brown-dark",
    dark: "bg-brown-dark text-white",
  },
};

type LanguageSelectorProps = {
  className?: string;
  variant?: "light" | "dark";
};
const LanguageSelector = ({ className, variant = "light" }: LanguageSelectorProps) => {
  const locale = useLocale();

  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams()?.toString();

  const onSelectLocale = (nextLocale: string) => {
    const path = `${pathname}${searchParams ? `?${searchParams}` : ""}`;
    router.push(path, { locale: nextLocale });
  };

  const localeLabels: Record<(typeof locales)[number], string> = {
    en: t("English"),
    es: t("Spanish"),
    fr: t("French"),
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "group flex h-fit w-fit gap-2 bg-white px-0 py-0 text-sm text-brown-dark transition-colors duration-300 hover:text-brown-light focus-visible:outline-none focus-visible:ring focus-visible:ring-brown-dark focus-visible:ring-offset-1",
          variants.trigger[variant],
          className,
        )}
      >
        <LanguagesIcon className="h-5 w-5" />
        <span>{localeLabels[locale]}</span>
        <OpenCloseArrow />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        sideOffset={20}
        className={cn(variants.menuItems[variant])}
      >
        <DropdownMenuRadioGroup value={locale} onValueChange={onSelectLocale}>
          {locales.map((l) => (
            <DropdownMenuRadioItem key={l} value={l}>
              {localeLabels[l]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
