import type { Metadata } from "next";

import Stories from "@/containers/stories";
import { getTranslations } from "@/i18n";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale });

  return {
    title: `${t("Rangelands Stories")} | ${t("Rangelands Data Platform")}`,
  };
}

export default function StoriesPage() {
  return <Stories />;
}
