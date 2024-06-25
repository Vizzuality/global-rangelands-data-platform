"use client";

import { useTranslations } from "@/i18n";

const DatasetsHeader = () => {
  const t = useTranslations();
  return (
    <header className="space-y-3 border-b border-gray-400 p-6 pt-10">
      <h1 className="text-[54px] font-bold">{t("Rangelands")}</h1>
      <h2 className="text-xl font-medium">{t("Grasslands vital for biodiversity")}.</h2>
      <p className="text-sm leading-relaxed">
        {t(
          "Rangelands are expansive areas characterized by a variety of vegetation, including grasses, shrubs, and occasional trees",
        )}
        .
      </p>
    </header>
  );
};

export default DatasetsHeader;
