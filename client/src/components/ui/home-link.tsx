"use client";

import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import { Link } from "@/navigation";
import RangelandLogoIcon from "@/svgs/logo.svg";

type HomeLinkProps = {
  className?: string;
};

const HomeLink = ({ className }: HomeLinkProps) => {
  const t = useTranslations();
  return (
    <Link href="/" className="flex gap-4">
      <RangelandLogoIcon className="shrink-0 fill-global" />
      <h1 className={cn("w-36 text-balance font-serif text-[28px] leading-[24px]", className)}>
        {t("Data Rangelands")}
      </h1>
    </Link>
  );
};

export default HomeLink;
