"use client";

import { useState } from "react";
import { useTranslations } from "@/i18n";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Link as LocaleLink, usePathname } from "@/i18n/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Marquee from "@/components/ui/marquee";
import GMVLogo from "@/assets/images/gmv-logo-color.png";
import VizzLogo from "@/assets/images/vizzuality-logo-color.png";
import GMVLogoDark from "@/assets/images/gmv-logo-dark.png";
import VizzLogoDark from "@/assets/images/vizzuality-logo-dark.png";
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
import StoryGizLogo from "@/assets/images/collaborators/giz.png";
import StoryAllianceLogo from "@/assets/images/collaborators/alliance.png";
import StoryIcardaLogo from "@/assets/images/collaborators/icarda.png";
import StorySfaLogo from "@/assets/images/collaborators/sfa.png";
import StoryTncLogo from "@/assets/images/collaborators/tnc.png";
import StoryGlfLogo from "@/assets/images/collaborators/glf.png";
import StoryGrsbLogo from "@/assets/images/collaborators/grsb.png";

const DefaultFooter = () => {
  const t = useTranslations();
  const [scrub, setScrub] = useState(0);

  const stopScrub = () => setScrub(0);

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
            aria-label={t("Hold to scroll partner logos left")}
            className={`shrink-0 transition-opacity ${scrub > 0 ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
            onPointerDown={() => setScrub(1)}
            onPointerUp={stopScrub}
            onPointerLeave={stopScrub}
            onPointerCancel={stopScrub}
          >
            <ArrowLeft aria-hidden="true" className="size-5" />
          </button>
          <Marquee
            ariaLabel={t("Our partners")}
            scrub={scrub}
            fade
            className="flex-1"
            gapClassName="gap-16"
          >
            {PARTNERS.map((partner) => (
              <Image
                key={partner.src.src}
                src={partner.src}
                alt={partner.alt}
                className="h-10 w-auto max-w-none object-contain"
              />
            ))}
          </Marquee>
          <button
            type="button"
            aria-label={t("Hold to scroll partner logos right")}
            className={`shrink-0 transition-opacity ${scrub < 0 ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
            onPointerDown={() => setScrub(-1)}
            onPointerUp={stopScrub}
            onPointerLeave={stopScrub}
            onPointerCancel={stopScrub}
          >
            <ArrowRight aria-hidden="true" className="size-5" />
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

const StoriesFooter = () => {
  const t = useTranslations();

  const LINKS = [
    {
      title: t("Home"),
      href: "/",
    },
    {
      title: t("Explore map"),
      href: "/map",
    },
    {
      title: t("Stories"),
      href: "/stories/atlas-stories",
    },
  ];

  return (
    <div className="bg-white">
      <div className="flex flex-col gap-10 px-4 pb-10 pt-14 sm:px-[100px] sm:pt-20">
        <div className="flex flex-col items-start justify-between gap-10 sm:flex-row">
          <div className="flex flex-col gap-6 sm:w-[480px]">
            <LocaleLink href="/" className="flex gap-4">
              <Image
                src="/images/logo-footer.png"
                className="h-[48px] w-[17px]"
                height={17}
                width={48}
                alt="Rangelands"
              />
              <h1 className="w-36 text-balance font-serif text-[28px] leading-[24px] text-green-dark">
                {t("Data Rangelands")}
              </h1>
            </LocaleLink>
            <p className="max-w-[360px] text-sm leading-[185%] text-green-dark/80">
              {t(
                "We are proud to partner with a diverse group of visionary organizations who share our commitment to innovation, excellence, and creating meaningful impact",
              )}
              .
            </p>
          </div>

          <nav className="flex flex-col gap-2 text-sm leading-[28px] text-green-dark">
            {LINKS.map((link) => (
              <LocaleLink
                href={link.href}
                key={link.href}
                className="underline-offset-2 transition-all duration-300 hover:underline"
              >
                {link.title}
              </LocaleLink>
            ))}
          </nav>
        </div>

        <Carousel opts={{ align: "start" }} className="w-full">
          <div className="flex items-center gap-4">
            <CarouselPrevious
              variant="ghost"
              className="static h-5 w-5 translate-y-0 text-green-dark hover:bg-transparent"
            />
            <CarouselContent className="max-w-[640px]">
              <CarouselItem className="basis-auto pl-4">
                <Image src={StoryGizLogo} alt={t("GIZ logo")} className="h-8 w-[119px] object-contain" />
              </CarouselItem>
              <CarouselItem className="basis-auto pl-4">
                <Image
                  src={StoryAllianceLogo}
                  alt={t("Alliance of Bioversity International and CIAT logo")}
                  className="h-8 w-16 object-contain"
                />
              </CarouselItem>
              <CarouselItem className="basis-auto pl-4">
                <Image
                  src={StoryIcardaLogo}
                  alt={t("ICARDA logo")}
                  className="h-8 w-[94px] object-contain"
                />
              </CarouselItem>
              <CarouselItem className="basis-auto pl-4">
                <Image
                  src={StorySfaLogo}
                  alt={t("Sustainable Fibre Alliance logo")}
                  className="h-8 w-[100px] object-contain"
                />
              </CarouselItem>
              <CarouselItem className="basis-auto pl-4">
                <Image
                  src={StoryTncLogo}
                  alt={t("The Nature Conservancy logo")}
                  className="h-8 w-[111px] object-contain"
                />
              </CarouselItem>
              <CarouselItem className="basis-auto pl-4">
                <Image
                  src={StoryGlfLogo}
                  alt={t("Global Landscapes Forum logo")}
                  className="h-8 w-[83px] object-contain"
                />
              </CarouselItem>
              <CarouselItem className="basis-auto pl-4">
                <Image
                  src={StoryGrsbLogo}
                  alt={t("Global Roundtable for Sustainable Beef logo")}
                  className="h-8 w-[174px] object-contain"
                />
              </CarouselItem>
            </CarouselContent>
            <CarouselNext
              variant="ghost"
              className="static h-5 w-5 translate-y-0 text-green-dark hover:bg-transparent"
            />
          </div>
        </Carousel>
      </div>

      <div className="flex flex-col items-center gap-4 border-t border-brown-light px-4 py-[26px] sm:flex-row sm:items-center sm:justify-between sm:px-[100px]">
        <p className="text-sm text-green-dark/80">© Data Rangelands, 2025</p>
        <div className="flex items-center gap-6">
          <p className="text-sm text-green-dark/80">{t("Designed and Developed by")}</p>
          <div className="flex items-center gap-4">
            <Image
              src={GMVLogoDark}
              width={45}
              height={32}
              alt={t("gmv innovating solutions")}
              className="w-[40px] object-contain"
            />
            <Image src={VizzLogoDark} alt={t("Vizzuality")} className="w-[70px] object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  const pathname = usePathname();
  const isStories = pathname.startsWith("/stories");

  return isStories ? <StoriesFooter /> : <DefaultFooter />;
};

export default Footer;
