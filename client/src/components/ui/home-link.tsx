"use client";

import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

type HomeLinkProps = {
  className?: string;
};

const HomeLink = ({ className }: HomeLinkProps) => {
  const t = useTranslations();
  return (
    <Link href="/" className={cn("flex gap-4", className)}>
      <span
        aria-hidden
        className="h-[26px] w-[72px] bg-current [mask-image:url(/images/rangelands-logo-white.png)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
      />
      <h1 className="text-balance font-serif text-[28px] leading-[24px]">{t("Data Rangelands")}</h1>
    </Link>
  );
};

export default HomeLink;
