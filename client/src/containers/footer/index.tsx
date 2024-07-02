"use client";

import HomeLink from "@/components/ui/home-link";
import { useTranslations } from "@/i18n";
import Image from "next/image";
import Link from "next/link";
import GMVLogo from "@/assets/images/gmv-logo.png";
import VizzLogo from "@/assets/images/vizzuality-logo.png";

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
    <div className=" relative bg-foreground">
      <div className="container z-50 mx-auto">
        <div className="flex w-[55%] flex-col justify-between gap-10 py-10 pr-40">
          <HomeLink className="text-white" />
          <div className="space-y-3">
            <p className="text-xs text-white">{t("Designed and developed by")}:</p>
            <div className="flex items-center gap-4">
              <Image
                src={GMVLogo}
                alt={t("gmv innovating solutions")}
                className="h-6 w-16 object-contain"
              />
              <Image src={VizzLogo} alt={t("Vizzuality")} className="h-6 w-24 object-contain" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-0 h-full w-full">
        <div className="mx-auto flex h-full justify-end">
          <div className="flex w-[45vw] flex-col justify-center gap-2  border-l border-[#4D4C71] px-20 py-10 text-sm leading-loose text-white">
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
      </div>
    </div>
  );
};

export default Footer;
