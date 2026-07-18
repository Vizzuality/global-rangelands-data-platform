import Image from "next/image";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { CMS_MEDIA_BASE } from "@/lib/cms";

type StoryCardSmallProps = {
  href: string;
  title: string;
  imageUrl?: string;
  imageAlt: string;
  className?: string;
};

const StoryCardSmall = ({ href, title, imageUrl, imageAlt, className }: StoryCardSmallProps) => (
  <Link href={href} className={cn("flex h-40 flex-col overflow-hidden", className)}>
    <div className="bg-brown-dark p-4">
      <p className="line-clamp-3 text-xs font-medium leading-4 text-white">{title}</p>
    </div>
    {imageUrl && (
      <div className="relative flex-1">
        <Image
          src={`${CMS_MEDIA_BASE}${imageUrl}`}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="176px"
        />
      </div>
    )}
  </Link>
);

export default StoryCardSmall;
