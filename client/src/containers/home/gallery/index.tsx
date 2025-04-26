"use client";

import { Carousel, CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";

import { useEffect, useRef, useState } from "react";
import HomeGalleryItem from "./item";
import { useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";

import { motion } from "framer-motion";

const HomeGallery = () => {
  const t = useTranslations();
  const [selectedImage, setSelectedImage] = useState(2);
  const selectImageInterval = useRef<NodeJS.Timeout | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const isInView = useInView(ref);

  const images = [
    { src: "/images/home/gallery/3.png", alt: t("White cattle") },
    { src: "/images/home/gallery/8.png", alt: t("Brown cattle") },

    { src: "/images/home/gallery/1.png", alt: t("Woman with alpacas") },
    { src: "/images/home/gallery/10.png", alt: t("Field with flowers") },
    { src: "/images/home/gallery/2.png", alt: t("Man with cattle") },
    { src: "/images/home/gallery/9.svg", alt: t("54% covered of earth surface") },
    { src: "/images/home/gallery/4.png", alt: t("Man with goats") },
    { src: "/images/home/gallery/7.png", alt: t("Sheep in field") },
    { src: "/images/home/gallery/5.png", alt: t("Man with camels") },
    { src: "/images/home/gallery/6.png", alt: t("Tundra landscape") },
    { src: "/images/home/gallery/3.png", alt: t("White cattle") },
    { src: "/images/home/gallery/8.png", alt: t("Brown cattle") },

    { src: "/images/home/gallery/1.png", alt: t("Woman with alpacas") },
    { src: "/images/home/gallery/10.png", alt: t("Field with flowers") },
  ];

  const animate = () => {
    return setInterval(() => {
      setSelectedImage((prev) => {
        return prev < 10 ? prev + 1 : 2;
      });
    }, 2000);
  };

  useEffect(() => {
    if (isInView) {
      selectImageInterval.current = animate();
    }

    return () => {
      if (selectImageInterval.current) {
        clearInterval(selectImageInterval.current);
      }
    };
  }, [isInView]);

  return (
    <div className="h-[80vw] translate-y-[20vw] sm:h-[24vw] sm:translate-y-[6vw]" ref={ref}>
      <motion.div
        style={{
          x: `-${(selectedImage - 2) * 5}%`,
        }}
        className="hidden h-full w-fit items-center transition-all duration-300 sm:flex "
      >
        {images.map((image, index) => (
          <HomeGalleryItem
            key={index}
            src={image.src}
            alt={image.alt}
            isSelected={selectedImage === index}
          />
        ))}
      </motion.div>

      <motion.div
        style={{
          x: `calc(-${selectedImage * 40}vw + 10vw)`,
        }}
        className="flex h-full w-fit items-center transition-all duration-300 sm:hidden"
      >
        {images.map((image, index) => (
          <HomeGalleryItem
            key={index}
            src={image.src}
            alt={image.alt}
            isSelected={selectedImage === index}
          />
        ))}
      </motion.div>
    </div>
  );
};

// const HomeGallery = () => {
//   const t = useTranslations();
//   const images = [
//     { src: "/images/home/gallery/1.png", alt: t("Woman with alpacas") },
//     { src: "/images/home/gallery/10.png", alt: t("Field with flowers") },
//     { src: "/images/home/gallery/2.png", alt: t("Man with cattle") },
//     { src: "/images/home/gallery/9.svg", alt: t("54% covered of earth surface") },
//     { src: "/images/home/gallery/4.png", alt: t("Man with goats") },
//     { src: "/images/home/gallery/7.png", alt: t("Sheep in field") },
//     { src: "/images/home/gallery/5.png", alt: t("Man with camels") },
//     { src: "/images/home/gallery/6.png", alt: t("Tundra landscape") },
//     { src: "/images/home/gallery/3.png", alt: t("White cattle") },
//     { src: "/images/home/gallery/8.png", alt: t("Brown cattle") },
//     // { src: "/images/home/gallery/1.png", alt: t("Woman with alpacas") },
//     // { src: "/images/home/gallery/10.png", alt: t("Field with flowers") },
//   ];

//   const plugin = useRef(Autoplay({ delay: 2000 }));

//   const [api, setApi] = useState<CarouselApi>();
//   const [selectedIndex, setSelectedIndex] = useState(0);

//   useEffect(() => {
//     if (!api) {
//       return;
//     }

//     api.on("select", () => {
//       console.log("Selected slide index:", api.selectedScrollSnap());
//       setSelectedIndex(api.selectedScrollSnap());
//       // Do something on select.
//     });
//   }, [api]);

//   return (
//     <Carousel
//       setApi={setApi}
//       opts={{
//         align: "start",
//         loop: true,
//       }}
//       plugins={[plugin.current]}
//       className="h-[400px] w-full items-center"
//     >
//       <CarouselContent>
//         {images.map((image, index) => (
//           <CarouselItem
//             key={image.src}
//             className={cn(
//               "aaspect-square flex h-[200px] w-[200px] items-center justify-center overflow-visible",
//               selectedIndex + 2 === index ? "Aflex-[2] basis-1/6" : "Aflex-1 basis-1/6 ",
//             )}
//           >
//             <div
//               className={cn(
//                 " bg-green-500 object-cover",
//                 selectedIndex + 2 === index
//                   ? "sscale-[2] aabsolute z-50 h-[400px] w-[400px] border-4 border-red-700"
//                   : "relative h-full w-full",
//               )}
//             >
//               <Image
//                 key={image.src}
//                 src={image.src}
//                 alt={image.alt}
//                 width={200}
//                 height={200}
//                 className={cn(
//                   "h-full w-full object-cover",
//                   // selectedIndex + 2 === index
//                   //   ? "sh-[400px] sw-[400px] absolute z-50 scale-[2] border-4 border-red-700"
//                   //   : "relative h-full w-full",
//                 )}
//               />
//             </div>
//           </CarouselItem>
//         ))}
//       </CarouselContent>
//     </Carousel>
//   );
// };

export default HomeGallery;
