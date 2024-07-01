import { useTranslations } from "@/i18n";
import Image from "next/image";
import ILC from "@/assets/images/collaborators/ilc.png";
import Rangelands from "@/assets/images/collaborators/rangelands.png";
import ILRI from "@/assets/images/collaborators/ilri.png";
import UNEP from "@/assets/images/collaborators/unep.png";
import FAO from "@/assets/images/collaborators/FAO.png";
import WWF from "@/assets/images/collaborators/wwf.png";
import IUCN from "@/assets/images/collaborators/iucn.png";

const COLLABORATORS = [
  { name: "ilc", image: ILC },
  { name: "rangelands", image: Rangelands },
  { name: "ilri", image: ILRI },
  { name: "unep", image: UNEP },
  { name: "fao", image: FAO },
  { name: "wwf", image: WWF },
  { name: "iucn", image: IUCN },
];

const Collaborators = () => {
  const t = useTranslations();
  return (
    <div className="space-y-10">
      <p className="text-center uppercase">{t("collaborators")}:</p>
      <div className="flex flex-wrap content-center items-center justify-between gap-6">
        {COLLABORATORS.map(({ name, image }) => (
          <div key={name} className="p-5">
            <Image
              src={image}
              alt={name}
              className="h-full max-h-16 w-full max-w-40 object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Collaborators;
