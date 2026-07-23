"use client";

import { useRef } from "react";
import { useTranslations } from "@/i18n";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Marquee, { type MarqueeHandle } from "@/components/ui/marquee";
import GMVLogo from "@/assets/images/gmv-logo-color.png";
import VizzLogo from "@/assets/images/vizzuality-logo-color.png";
import GizLogo from "@/assets/images/partners/giz.png";
import AllianceBioversityCiatLogo from "@/assets/images/partners/alliance-bioversity-ciat.png";
import IcardaLogo from "@/assets/images/partners/icarda.png";
import SustainableFibreAllianceLogo from "@/assets/images/partners/sustainable-fibre-alliance.png";
import TheNatureConservancyLogo from "@/assets/images/partners/the-nature-conservancy.png";
import GlobalLandscapesForumLogo from "@/assets/images/partners/global-landscapes-forum.png";
import GrsbLogo from "@/assets/images/partners/grsb.png";
import GefLogo from "@/assets/images/partners/gef.png";
import IucnLogo from "@/assets/images/partners/iucn.png";
import CiforIcrafLogo from "@/assets/images/partners/cifor-icraf.png";
import EsaLogo from "@/assets/images/partners/esa.png";
import WwfLogo from "@/assets/images/partners/wwf.png";
import IlriLogo from "@/assets/images/partners/ilri.png";
import LandmarkLogo from "@/assets/images/partners/landmark.png";
import LppLogo from "@/assets/images/partners/lpp.png";
import CgiarMultifunctionalLandscapesLogo from "@/assets/images/partners/cgiar-multifunctional-landscapes.png";
import RangelandStewardshipCouncilLogo from "@/assets/images/partners/rangeland-stewardship-council.png";
import CgiarDigitalTransformationLogo from "@/assets/images/partners/cgiar-digital-transformation.png";
import HerdingForHealthLogo from "@/assets/images/partners/herding-for-health.png";
import UnccdLogo from "@/assets/images/partners/unccd.png";

const Footer = () => {
  const t = useTranslations();
  const marqueeRef = useRef<MarqueeHandle>(null);

  const LINKS = [
    {
      title: t("Home"),
      href: "/",
    },
    {
      title: t("Explore Map"),
      href: "/map",
    },
    {
      title: t("Stories"),
      href: "/map/stories",
    },
  ];

  const PARTNERS = [
    { src: GizLogo, alt: t("Deutsche Gesellschaft für Internationale Zusammenarbeit (GIZ)") },
    { src: AllianceBioversityCiatLogo, alt: t("Alliance of Bioversity International and CIAT") },
    {
      src: IcardaLogo,
      alt: t("International Center for Agricultural Research in the Dry Areas (ICARDA)"),
    },
    { src: SustainableFibreAllianceLogo, alt: t("Sustainable Fibre Alliance") },
    { src: TheNatureConservancyLogo, alt: t("The Nature Conservancy") },
    { src: GlobalLandscapesForumLogo, alt: t("Global Landscapes Forum") },
    { src: GrsbLogo, alt: t("Global Roundtable for Sustainable Beef") },
    { src: GefLogo, alt: t("Global Environment Facility") },
    { src: IucnLogo, alt: t("International Union for Conservation of Nature") },
    { src: CiforIcrafLogo, alt: t("CIFOR-ICRAF") },
    { src: EsaLogo, alt: t("European Space Agency") },
    { src: WwfLogo, alt: t("World Wide Fund for Nature") },
    { src: IlriLogo, alt: t("International Livestock Research Institute") },
    { src: LandmarkLogo, alt: t("LandMark Global Platform of Indigenous and Community Lands") },
    { src: LppLogo, alt: t("League for Pastoral Peoples and Endogenous Livestock Development") },
    { src: CgiarMultifunctionalLandscapesLogo, alt: t("CGIAR Multifunctional Landscapes") },
    { src: RangelandStewardshipCouncilLogo, alt: t("Rangeland Stewardship Council") },
    { src: CgiarDigitalTransformationLogo, alt: t("CGIAR Digital Transformation") },
    { src: HerdingForHealthLogo, alt: t("Herding for Health") },
    { src: UnccdLogo, alt: t("United Nations Convention to Combat Desertification") },
  ];

  return (
    <div className="relative bg-background text-foreground">
      <div className="container mx-auto sm:px-[100px]">
        <div className="flex flex-col pt-14 sm:flex-row sm:gap-[120px] sm:py-20">
          <div className="flex-1 space-y-6">
            <div className="flex flex-col justify-between gap-10">
              <Link href="/" className="flex items-center gap-4">
                <span className="flex h-12 w-4 items-center justify-center">
                  <Image
                    src="/images/home/icon-color.png"
                    width={207}
                    height={62}
                    className="w-12 max-w-none -rotate-90"
                    alt=""
                  />
                </span>
                <h1 className="w-36 text-balance font-serif text-[28px] leading-[24px]">
                  {t("Data Rangelands")}
                </h1>
              </Link>
              <p className="max-w-[360px] text-sm leading-[185%] opacity-80">
                {t(
                  "We are proud to partner with a diverse group of visionary organizations who share our commitment to innovation, excellence, and creating meaningful impact",
                )}
                .
              </p>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2 py-10 text-sm leading-loose">
            {LINKS.map((link) => (
              <Link
                href={link.href}
                key={link.href}
                className="underline-offset-2 transition-all duration-300 hover:underline"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 pb-10">
          <button
            type="button"
            aria-label={t("Scroll partner logos left")}
            className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
            onPointerDown={() => marqueeRef.current?.scrub(-1)}
            onPointerUp={() => marqueeRef.current?.release()}
            onPointerLeave={() => marqueeRef.current?.release()}
            onPointerCancel={() => marqueeRef.current?.release()}
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <Marquee
            ref={marqueeRef}
            ariaLabel={t("Our partners")}
            className="flex-1"
            gapClassName="gap-16"
          >
            {PARTNERS.map((partner) => (
              <span
                key={partner.src.src}
                className="flex h-12 w-32 shrink-0 items-center justify-center"
              >
                <Image
                  src={partner.src}
                  alt={partner.alt}
                  className="max-h-10 w-auto max-w-full object-contain"
                />
              </span>
            ))}
          </Marquee>
          <button
            type="button"
            aria-label={t("Scroll partner logos right")}
            className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
            onPointerDown={() => marqueeRef.current?.scrub(1)}
            onPointerUp={() => marqueeRef.current?.release()}
            onPointerLeave={() => marqueeRef.current?.release()}
            onPointerCancel={() => marqueeRef.current?.release()}
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>
        </div>

        <div className="h-px w-full bg-brown-light" />

        <div className="flex flex-col items-center gap-10 py-6 sm:flex-row sm:justify-between">
          <p className="opacity-50">© Data Rangelands, 2025</p>
          <div className="flex gap-4">
            <p className="opacity-50">{t("Designed and developed by")}:</p>
            <div className="flex gap-4">
              <Image
                src={GMVLogo}
                width={45}
                height={32}
                alt={t("gmv innovating solutions")}
                className="w-[40px] object-contain"
              />
              <Image src={VizzLogo} alt={t("Vizzuality")} className="w-[70px] object-contain" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
