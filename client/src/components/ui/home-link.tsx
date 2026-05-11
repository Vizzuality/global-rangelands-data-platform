"use client";

import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

type HomeLinkProps = {
  className?: string;
};

const HomeLink = ({ className }: HomeLinkProps) => {
  const t = useTranslations();
  return (
    <Link href="/" className="flex gap-4">
      <Image
        src="/images/rangelands-logo-white.png"
        className="h-[26px] w-[72px]"
        height={26}
        width={72}
        alt="Rangelands"
      />
      <h1 className={cn("text-balance font-serif text-[28px] leading-[24px]", className)}>
        {t("Data Rangelands")}
      </h1>
    </Link>
  );
};

export default HomeLink;
