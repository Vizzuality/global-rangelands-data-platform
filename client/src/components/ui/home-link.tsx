"use client";

import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import { Link } from "@/navigation";
import RangelandLogoIcon from "@/svgs/rangeland-logo.svg";

type HomeLinkProps = {
  className?: string;
};

const HomeLink = ({ className }: HomeLinkProps) => {
  const t = useTranslations();
  return (
    <Link href="/" className="flex gap-4">
      <RangelandLogoIcon className="fill-global" />
      <h1 className={cn("w-32 text-sm", className)}>{t("Rangelands Data Platform")}</h1>
    </Link>
  );
};

export default HomeLink;
