import { cn } from "@/lib/utils";
import Image from "next/image";

type HomeGalleryItemProps = {
  src: string;
  alt: string;
  isSelected?: boolean;
};
const HomeGalleryItem = ({ src, alt, isSelected }: HomeGalleryItemProps) => {
  return (
    <Image
      src={src}
      width={300}
      height={300}
      alt={alt}
      className={cn(
        "object-cover transition-all duration-500 ease-in-out",
        isSelected ? "h-[440px] w-[440px]" : "h-[200px] w-[200px]",
      )}
    />
  );
};

export default HomeGalleryItem;
