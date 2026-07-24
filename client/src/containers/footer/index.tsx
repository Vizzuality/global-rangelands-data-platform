"use client";

import { useTranslations } from "@/i18n";
import Image from "next/image";
import Link from "next/link";
import { Link as LocaleLink, usePathname } from "@/i18n/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import GMVLogo from "@/assets/images/gmv-logo.png";
import VizzLogo from "@/assets/images/vizzuality-logo.png";
import GMVLogoDark from "@/assets/images/gmv-logo-dark.png";
import VizzLogoDark from "@/assets/images/vizzuality-logo-dark.png";
import ILRILogo from "@/assets/images/collaborators/ilri.png";
import GEFLogo from "@/assets/images/collaborators/gef.png";
import IUCNLogo from "@/assets/images/collaborators/iucn.png";
import GizLogo from "@/assets/images/collaborators/giz.png";
import AllianceLogo from "@/assets/images/collaborators/alliance.png";
import IcardaLogo from "@/assets/images/collaborators/icarda.png";
import SfaLogo from "@/assets/images/collaborators/sfa.png";
import TncLogo from "@/assets/images/collaborators/tnc.png";
import GlfLogo from "@/assets/images/collaborators/glf.png";
import GrsbLogo from "@/assets/images/collaborators/grsb.png";

const DefaultFooter = () => {
  const t = useTranslations();

  const LINKS = [
    {
      title: t("Home"),
      href: "/",
    },
    {
      title: t("Explore Map"),
      href: "/map",
    },
    // {
    //   title: t("About"),
    //   href: "/about",
    // },
    // {
    //   title: t("Terms & Conditions"),
    //   href: "/terms-and-conditions",
    // },
    // {
    //   title: t("Privacy Policy"),
    //   href: "/privacy",
    // },
  ];

  return (
    <div className="relative bg-[#182219]">
      <div className="container mx-auto text-white sm:px-[100px]">
        <div className="flex flex-col pt-14 sm:flex-row sm:gap-[120px] sm:py-20">
          <div className="flex-1 space-y-6">
            <div className="flex flex-col justify-between gap-10">
              <Link href="/" className="flex gap-4">
                <Image
                  src="/images/logo-footer.png"
                  className="h-[48px] w-[17px]"
                  height={17}
                  width={48}
                  alt="Rangelands"
                />
                <h1 className="w-36 text-balance font-serif text-[28px] leading-[24px]">
                  {t("Data Rangelands")}
                </h1>
              </Link>
              <p className="max-w-[360px] text-sm leading-[185%] text-white/80">
                {t(
                  "We are proud to partner with a diverse group of visionary organizations who share our commitment to innovation, excellence, and creating meaningful impact",
                )}
                .
              </p>
            </div>
            <div className="flex gap-6 pt-5">
              <Image
                src={GEFLogo}
                alt={t("Global environment facility logo")}
                className="w-[72px] object-contain"
              />
              <Image
                src={ILRILogo}
                alt={t("International Livestock Research Institute logo")}
                className="w-[115px] object-contain"
              />
              <Image
                src={IUCNLogo}
                alt={t("International Union for Conservation of Nature logo")}
                className="w-[34px] object-contain"
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col  gap-2 py-10 text-sm leading-loose text-white">
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
        <div className="absolute left-0 h-px w-screen bg-white/10"></div>
        <div className="flex flex-col items-center  gap-10 py-6 sm:flex-row ">
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
                <Image src={GizLogo} alt={t("GIZ logo")} className="h-8 w-[119px] object-contain" />
              </CarouselItem>
              <CarouselItem className="basis-auto pl-4">
                <Image
                  src={AllianceLogo}
                  alt={t("Alliance of Bioversity International and CIAT logo")}
                  className="h-8 w-16 object-contain"
                />
              </CarouselItem>
              <CarouselItem className="basis-auto pl-4">
                <Image
                  src={IcardaLogo}
                  alt={t("ICARDA logo")}
                  className="h-8 w-[94px] object-contain"
                />
              </CarouselItem>
              <CarouselItem className="basis-auto pl-4">
                <Image
                  src={SfaLogo}
                  alt={t("Sustainable Fibre Alliance logo")}
                  className="h-8 w-[100px] object-contain"
                />
              </CarouselItem>
              <CarouselItem className="basis-auto pl-4">
                <Image
                  src={TncLogo}
                  alt={t("The Nature Conservancy logo")}
                  className="h-8 w-[111px] object-contain"
                />
              </CarouselItem>
              <CarouselItem className="basis-auto pl-4">
                <Image
                  src={GlfLogo}
                  alt={t("Global Landscapes Forum logo")}
                  className="h-8 w-[83px] object-contain"
                />
              </CarouselItem>
              <CarouselItem className="basis-auto pl-4">
                <Image
                  src={GrsbLogo}
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
