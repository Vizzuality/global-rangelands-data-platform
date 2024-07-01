"use client";
import Image, { StaticImageData } from "next/image";

import CloudIcon from "@/svgs/cloud.svg";
import GroupIcon from "@/svgs/user-group.svg";
import GlobeIcon from "@/svgs/globe-europe-africa.svg";
import { useMemo } from "react";

type HomeCardProps = {
  title: string;
  description: string;
  image: StaticImageData;
  icon: string;
};

const HomeCard = ({ title, description, image, icon }: HomeCardProps) => {
  const ICON = useMemo(() => {
    switch (icon) {
      case "group":
        return <GroupIcon />;
      case "globe":
        return <GlobeIcon />;
      default:
        return <CloudIcon />;
    }
  }, [icon]);
  return (
    <div className="flex max-w-lg flex-1 flex-col justify-between">
      <div className="space-y-3">
        <div className="w-fit rounded-lg border border-gray-300 p-2.5">{ICON}</div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">{title}</h3>
          <p className="text-pretty leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="w-full pt-12">
        <Image src={image} alt={title} className="w-full rounded-xl object-cover" />
      </div>
    </div>
  );
};

export default HomeCard;
