"use client";

import { useTranslations } from "@/i18n";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

type HomeLinkProps = {
  className?: string;
  responsive?: boolean;
};

const HomeLink = ({ className, responsive = false }: HomeLinkProps) => {
  const t = useTranslations();
  return (
    <Link href="/" className={cn("flex", responsive ? "gap-1.5 lg:gap-4" : "gap-4", className)}>
      <span
        aria-hidden
        className={cn(
          "bg-current [mask-image:url(/images/rangelands-logo-white.png)] [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
          responsive ? "h-5 w-14 lg:h-[26px] lg:w-[72px]" : "h-[26px] w-[72px]",
        )}
      />
      <h1
        className={cn(
          "text-balance font-serif",
          responsive
            ? "text-[22px] leading-[19px] lg:text-[28px] lg:leading-[24px]"
            : "text-[28px] leading-[24px]",
        )}
      >
        {t("Data Rangelands")}
      </h1>
    </Link>
  );
};

export default HomeLink;
