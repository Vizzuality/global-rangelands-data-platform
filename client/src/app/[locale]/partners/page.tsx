import type { Metadata } from "next";

import Footer from "@/containers/footer";
import Header from "@/containers/header";
import PartnersListing from "@/containers/partners/listing";
import { getTranslations } from "@/i18n";

type PartnersRouteProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: PartnersRouteProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale });

  return { title: `${t("Other rangeland activities")} | ${t("Rangelands Data Platform")}` };
}

export default function PartnersRoute() {
  return (
    <div className="relative h-auto min-h-screen w-full overflow-x-hidden">
      <Header />
      <PartnersListing />
      <Footer />
    </div>
  );
}
