import type { Metadata } from "next";

import Features from "@/containers/features";
import { getTranslations } from "@/i18n";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale });

  return {
    title: `${t("Rangelands Features")} | ${t("Rangelands Data Platform")}`,
  };
}

export default function FeaturesPage() {
  return <Features />;
}
