"use client";

import { useEffect, useRef, useState } from "react";
import HomeGalleryItem from "./item";
import { useInView, motion } from "motion/react";
import { useTranslations } from "next-intl";

const HomeGallery = () => {
  const t = useTranslations();
  const [selectedImage, setSelectedImage] = useState(2);
  const selectImageInterval = useRef<NodeJS.Timeout | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const isInView = useInView(ref);

  const images = [
    { src: "/images/home/gallery/slide09.png", alt: t("Brown cattle") },
    { src: "/images/home/gallery/slide10.png", alt: t("Goats") },

    { src: "/images/home/gallery/slide01.png", alt: t("White cattle") },
    { src: "/images/home/gallery/slide02.png", alt: t("Man with goats") },
    { src: "/images/home/gallery/slide03.png", alt: t("Field with flowers") },
    { src: "/images/home/gallery/9.svg", alt: t("54% covered of earth surface") },
    { src: "/images/home/gallery/slide04.png", alt: t("Man with cattle") },
    { src: "/images/home/gallery/slide05.png", alt: t("Goats in field") },
    { src: "/images/home/gallery/slide06.png", alt: t("Sheep in field") },
    { src: "/images/home/gallery/slide07.png", alt: t("Man with camels") },
    { src: "/images/home/gallery/slide08.png", alt: t("Tundra landscape") },
    { src: "/images/home/gallery/slide09.png", alt: t("Brown cattle") },
    { src: "/images/home/gallery/slide10.png", alt: t("Goats") },

    { src: "/images/home/gallery/slide01.png", alt: t("White cattle") },
    { src: "/images/home/gallery/slide02.png", alt: t("Man with goats") },
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

export default HomeGallery;
