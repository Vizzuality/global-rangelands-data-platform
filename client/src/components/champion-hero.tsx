import Image from "next/image";

import { cmsImageSrc } from "@/lib/cms";
import { IMAGE_PLACEHOLDER_CLASS_NAME } from "@/lib/image-placeholder";
import { cn } from "@/lib/utils";

type ChampionHeroProps = {
  title?: string;
  subtitle?: string;
  location?: string;
  imageUrl?: string;
  imageCaption?: string;
};

const ChampionHero = ({ title, subtitle, location, imageUrl, imageCaption }: ChampionHeroProps) => (
  <div className="-mx-6 flex flex-col items-stretch bg-champion-mint px-6 lg:flex-row lg:items-start lg:justify-center lg:px-12 xl:-mx-24 xl:px-[192px]">
    <div className="flex min-w-0 flex-col justify-center gap-4 py-6 text-champion-ink lg:w-[328px] lg:shrink-0 lg:self-stretch lg:py-0 lg:pr-6">
      {title && (
        <h1 className="break-words font-serif text-4xl font-light leading-[44px] sm:text-5xl sm:leading-[56px]">
          {title}
        </h1>
      )}
      {subtitle && <p className="font-sans text-base font-medium leading-6">{subtitle}</p>}
      {location && <p className="font-sans text-base font-normal leading-7">From {location}</p>}
    </div>
    <div
      className={cn(
        "relative aspect-[4/3] w-full lg:aspect-auto lg:min-h-[356px] lg:w-[328px] lg:shrink-0 lg:self-stretch",
        !imageUrl && "hidden lg:block",
        !!imageUrl && [IMAGE_PLACEHOLDER_CLASS_NAME, "before:bg-champion-ink/10"],
      )}
    >
      {imageUrl && (
        <Image
          src={cmsImageSrc(imageUrl)}
          alt={title ?? ""}
          fill
          className="object-cover"
          unoptimized
        />
      )}
      {imageUrl && imageCaption && (
        <span className="absolute bottom-2 left-2 rounded bg-foreground/60 px-2.5 text-[10px] leading-6 text-white backdrop-blur-sm">
          {imageCaption}
        </span>
      )}
    </div>
  </div>
);

export default ChampionHero;
