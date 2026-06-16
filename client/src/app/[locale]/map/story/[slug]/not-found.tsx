"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useSyncSearchParams } from "@/store/map";

export default function StoryNotFound() {
  const t = useTranslations();
  const searchParams = useSyncSearchParams();

  return (
    <div className="flex flex-col">
      <div className="border-b border-foreground px-6 py-4">
        <Link
          href={`/map/stories${searchParams}`}
          className="inline-flex items-center gap-1 text-sm font-medium hover:text-green-light"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("Stories")}
        </Link>
      </div>

      <div className="space-y-2 p-6">
        <h1 className="font-serif text-2xl font-light leading-tight">{t("Story not found")}</h1>
        <p className="text-sm leading-relaxed">
          {t("The story you are looking for does not exist or has been removed.")}
        </p>
      </div>
    </div>
  );
}
