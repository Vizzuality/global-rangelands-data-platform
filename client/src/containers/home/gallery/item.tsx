import { cn } from "@/lib/utils";
import Image from "next/image";

import { IMAGE_PLACEHOLDER_CLASS_NAME } from "@/lib/image-placeholder";

type HomeGalleryItemProps = {
  src: string;
  alt: string;
  isSelected?: boolean;
};
const HomeGalleryItem = ({ src, alt, isSelected }: HomeGalleryItemProps) => {
  return (
    <div
      className={cn(
        "relative aspect-square shrink-0 overflow-hidden transition-all duration-500 ease-in-out before:bg-foreground/10",
        IMAGE_PLACEHOLDER_CLASS_NAME,
        isSelected ? "w-[80vw] sm:w-[24vw]" : "w-[40vw] sm:w-[12vw]",
      )}
    >
      <Image
        src={src}
        width={200}
        height={200}
        alt={alt}
        className="relative h-full w-full object-cover transition-all duration-500 ease-in-out"
      />
    </div>
  );
};

export default HomeGalleryItem;
