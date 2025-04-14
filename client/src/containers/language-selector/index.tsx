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
import { usePathname, useRouter, locales } from "@/navigation";
import { LanguagesIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";

const LanguageSelector = () => {
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
      <DropdownMenuTrigger className="group flex h-fit w-fit gap-2 bg-white px-0 py-0 text-sm text-brown-dark transition-colors duration-300 hover:text-brown-light">
        <LanguagesIcon className="h-5 w-5" />
        <span>{localeLabels[locale]}</span>
        <OpenCloseArrow />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" sideOffset={20} className="bg-white text-brown-dark">
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
