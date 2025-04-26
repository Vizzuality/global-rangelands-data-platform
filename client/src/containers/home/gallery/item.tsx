import { cn } from "@/lib/utils";
import Image from "next/image";

type HomeGalleryItemProps = {
  src: string;
  alt: string;
  isSelected?: boolean;
};
const HomeGalleryItem = ({ src, alt, isSelected }: HomeGalleryItemProps) => {
  return (
    <div
      className={cn(
        "aspect-square shrink-0 transition-all duration-500 ease-in-out",
        isSelected ? "w-[80vw] sm:w-[24vw]" : "w-[40vw] sm:w-[12vw]",
      )}
    >
      <Image
        src={src}
        width={200}
        height={200}
        alt={alt}
        className="h-full w-full object-cover transition-all duration-500 ease-in-out"
      />
    </div>
  );
};

export default HomeGalleryItem;
