import Image from "next/image";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { CMS_MEDIA_BASE } from "@/lib/cms";

type StoryCardContentProps = {
  variant: string;
  href: string;
  categoryTitle?: string;
  title: string;
  imageUrl?: string;
  imageAlt: string;
  imageCaption?: string;
};

const StoryCardContent = ({
  variant,
  href,
  categoryTitle,
  title,
  imageUrl,
  imageAlt,
  imageCaption,
}: StoryCardContentProps) => (
  <div className="overflow-hidden">
    <div className={cn("flex flex-col gap-2.5 px-8 pb-5 pt-8", variant)}>
      {categoryTitle && (
        <p className="text-[10px] font-medium uppercase leading-5">{categoryTitle}</p>
      )}
      <h3 className="text-base font-medium leading-6">
        <Link
          href={href}
          className="before:absolute before:inset-0 focus-visible:underline focus-visible:outline-none"
        >
          {title}
        </Link>
      </h3>
    </div>
    {imageUrl && (
      <div className="relative h-44">
        <Image
          src={`${CMS_MEDIA_BASE}${imageUrl}`}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="352px"
        />
        {imageCaption && (
          <span className="absolute bottom-2 left-2 rounded bg-foreground/10 px-2.5 text-[10px] leading-6 text-white backdrop-blur-sm">
            {imageCaption}
          </span>
        )}
      </div>
    )}
  </div>
);

export default StoryCardContent;
