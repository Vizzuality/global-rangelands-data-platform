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
      <DropdownMenuTrigger className="group flex h-fit w-fit gap-2 rounded-full border border-white bg-transparent px-5 py-3.5 text-sm text-white">
        <LanguagesIcon className="h-5 w-5" />
        <span>{t("Select Language")}:</span>
        <span>{localeLabels[locale]}</span>
        <OpenCloseArrow />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-foreground text-white">
        <DropdownMenuRadioGroup onValueChange={onSelectLocale}>
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
