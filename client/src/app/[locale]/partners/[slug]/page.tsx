import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Footer from "@/containers/footer";
import Header from "@/containers/header";
import { PARTNERS } from "@/containers/partners/constants";
import PartnerDetail from "@/containers/partners/detail";
import { getPartner } from "@/containers/partners/utils";
import { getTranslations } from "@/i18n";

type PartnerRouteProps = {
  params: Promise<{ slug: string; locale: string }>;
};

export function generateStaticParams() {
  return PARTNERS.map((partner) => ({ slug: partner.slug }));
}

export async function generateMetadata(props: PartnerRouteProps): Promise<Metadata> {
  const { slug, locale } = await props.params;
  const t = await getTranslations({ locale });
  const partner = getPartner(PARTNERS, slug);

  if (!partner) return { title: t("Rangelands Data Platform") };

  return { title: `${partner.name} | ${t("Rangelands Data Platform")}` };
}

export default async function PartnerRoute(props: PartnerRouteProps) {
  const { slug } = await props.params;
  const partner = getPartner(PARTNERS, slug);

  if (!partner) notFound();

  return (
    <div className="relative h-auto min-h-screen w-full overflow-x-hidden">
      <Header />
      <PartnerDetail partner={partner} />
      <Footer />
    </div>
  );
}
