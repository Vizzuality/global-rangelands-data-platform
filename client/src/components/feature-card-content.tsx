import Image from "next/image";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { cmsImageSrc } from "@/lib/cms";
import { IMAGE_PLACEHOLDER_CLASS_NAME } from "@/lib/image-placeholder";

type FeatureCardContentProps = {
  variant: string;
  href: string;
  categoryTitle?: string;
  title: string;
  subtitle?: string;
  location?: string;
  imageUrl?: string;
  imageFormats?: unknown;
  imageAlt: string;
  imageCaption?: string;
};

function getTitleClassName(hasSubtitle: boolean): string {
  return hasSubtitle ? "font-medium" : "line-clamp-2 min-h-12 font-medium";
}

function getBodyPaddingBottomClassName(hasLocation: boolean): string {
  return hasLocation ? "pb-8" : "pb-5";
}

const FeatureCardContent = ({
  variant,
  href,
  categoryTitle,
  title,
  subtitle,
  location,
  imageUrl,
  imageFormats,
  imageAlt,
  imageCaption,
}: FeatureCardContentProps) => (
  <Link
    href={href}
    className="block overflow-hidden focus-visible:underline focus-visible:outline-none"
  >
    <div
      className={cn(
        "flex flex-col gap-2.5 px-8 pt-8",
        getBodyPaddingBottomClassName(!!location),
        variant,
      )}
    >
      {categoryTitle && (
        <p className="text-[10px] font-medium uppercase leading-5">{categoryTitle}</p>
      )}
      <div className="text-base leading-6">
        <h3 className={getTitleClassName(!!subtitle)}>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {location && <p className="mt-6 text-xs font-medium leading-5">{location}</p>}
    </div>
    {imageUrl && (
      <div className={cn("relative h-44 before:bg-hunter-green-200", IMAGE_PLACEHOLDER_CLASS_NAME)}>
        <Image
          src={cmsImageSrc(imageUrl, imageFormats, 704)}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="352px"
          unoptimized
        />
        {imageCaption && (
          <span className="absolute bottom-2 left-2 rounded bg-foreground/10 px-2.5 text-[10px] leading-6 text-white backdrop-blur-sm">
            {imageCaption}
          </span>
        )}
      </div>
    )}
  </Link>
);

export default FeatureCardContent;
