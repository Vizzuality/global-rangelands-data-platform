"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n";
import RangelandsIcon from "@/svgs/dataset-categories/rangelands.svg";
import EnvironmentIcon from "@/svgs/dataset-categories/tree.svg";
import LandUseIcon from "@/svgs/dataset-categories/people.svg";
import BiodiversityIcon from "@/svgs/dataset-categories/bio.svg";
import Link from "next/link";

const categoryIcons = {
  "rangeland-systems": RangelandsIcon,
  "environment-and-climate": EnvironmentIcon,
  "land-use-and-people": LandUseIcon,
  "biodiversity-and-conservation": BiodiversityIcon,
};

export type CategoryButtonProps = {
  title: string;
  slug: string;
};

const CategoryButton = ({ title, slug }: CategoryButtonProps) => {
  const Icon = categoryIcons[slug as keyof typeof categoryIcons];
  return (
    <Button
      key={title}
      variant="ghost"
      size="icon"
      className="h-auto w-20 rounded-md py-2 text-foreground hover:text-green-light"
    >
      <Link className="flex flex-col items-center gap-1 text-sm" href={`#${slug}`}>
        <Icon className="shrink-0" />
        <span className="text-wrap text-xs font-medium uppercase underline underline-offset-2">
          {title}
        </span>
      </Link>
    </Button>
  );
};

type DatasetsHeaderProps = {
  categories?: CategoryButtonProps[];
};

const DatasetsHeader = ({ categories }: DatasetsHeaderProps) => {
  const t = useTranslations();

  return (
    <header className="space-y-4 border-b border-foreground p-6 pt-10">
      <h1 className="font-serif text-[50px] font-light leading-[90%]">{t("Rangelands Layers")}</h1>
      <h2 className="font-serif text-xl font-medium">{t("Grasslands vital for biodiversity")}.</h2>
      <p className="text-sm leading-relaxed">
        {t(
          "Rangelands are expansive areas characterized by a variety of vegetation, including grasses, shrubs, and occasional trees",
        )}
        .
      </p>
      <div className="flex justify-between">
        {categories?.map((category) => (
          <CategoryButton key={category.slug} slug={category.slug} title={category.title} />
        ))}
      </div>
    </header>
  );
};

export default DatasetsHeader;
