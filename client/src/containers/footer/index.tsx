"use client";

import { useTranslations } from "@/i18n";
import Image from "next/image";
import Link from "next/link";
import GMVLogo from "@/assets/images/gmv-logo.png";
import VizzLogo from "@/assets/images/vizzuality-logo.png";
import ILRILogo from "@/assets/images/collaborators/ilri.png";
import GEFLogo from "@/assets/images/collaborators/gef.png";
import IUCNLogo from "@/assets/images/collaborators/iucn.png";

const Footer = () => {
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

export default Footer;
