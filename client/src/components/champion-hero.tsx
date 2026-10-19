import Image from "next/image";

import { cmsImageSrc } from "@/lib/cms";

type ChampionHeroProps = {
  title?: string;
  subtitle?: string;
  location?: string;
  imageUrl?: string;
  imageCaption?: string;
};

const ChampionHero = ({ title, subtitle, location, imageUrl, imageCaption }: ChampionHeroProps) => (
  <div className="-mx-6 flex flex-col items-stretch bg-champion-mint px-6 md:flex-row md:items-start md:justify-center md:px-12 xl:-mx-24 xl:px-[192px]">
    <div className="flex flex-col justify-center gap-4 py-6 text-champion-ink md:w-[328px] md:shrink-0 md:self-stretch md:py-0 md:pr-6">
      {title && <h1 className="font-serif text-5xl font-light leading-[56px]">{title}</h1>}
      {subtitle && <p className="font-sans text-base font-medium leading-6">{subtitle}</p>}
      {location && <p className="font-sans text-base font-normal leading-7">From {location}</p>}
    </div>
    {imageUrl && (
      <div className="relative h-[356px] w-full md:w-[328px] md:shrink-0">
        <Image
          src={cmsImageSrc(imageUrl)}
          alt={title ?? ""}
          fill
          className="object-cover"
          unoptimized
        />
        {imageCaption && (
          <span className="absolute bottom-2 left-2 rounded bg-foreground/60 px-2.5 text-[10px] leading-6 text-white backdrop-blur-sm">
            {imageCaption}
          </span>
        )}
      </div>
    )}
  </div>
);

export default ChampionHero;
