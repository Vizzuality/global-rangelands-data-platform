import Image from "next/image";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { cmsImageSrc } from "@/lib/cms";

type FeatureCardSmallProps = {
  variant: string;
  href: string;
  title: string;
  imageUrl?: string;
  imageFormats?: unknown;
  imageAlt: string;
  className?: string;
};

const FeatureCardSmall = ({
  variant,
  href,
  title,
  imageUrl,
  imageFormats,
  imageAlt,
  className,
}: FeatureCardSmallProps) => (
  <Link href={href} className={cn("flex h-40 flex-col overflow-hidden", className)}>
    <div className={cn("p-4", variant)}>
      <p className="line-clamp-3 text-xs font-medium leading-4">{title}</p>
    </div>
    {imageUrl && (
      <div className="relative flex-1">
        <Image
          src={cmsImageSrc(imageUrl, imageFormats, 352)}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="176px"
          unoptimized
        />
      </div>
    )}
  </Link>
);

export default FeatureCardSmall;
