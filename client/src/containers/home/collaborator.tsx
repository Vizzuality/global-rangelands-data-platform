import { useTranslations } from "@/i18n";
import Image from "next/image";

import ILRI from "@/assets/images/collaborators/ilri.png";
import GEF from "@/assets/images/collaborators/gef.png";
import IUCN from "@/assets/images/collaborators/iucn.png";

const COLLABORATORS = [
  { name: "gef", image: GEF },
  { name: "ilri", image: ILRI },
  { name: "iucn", image: IUCN },
];

const Collaborators = () => {
  const t = useTranslations();
  return (
    <div className="space-y-10">
      <p className="text-center uppercase">{t("collaborators")}:</p>
      <div className="flex flex-wrap content-center items-center justify-between gap-6">
        {COLLABORATORS.map(({ name, image }) => (
          <div key={name} className="flex-1 p-5">
            <Image src={image} alt={name} className="mx-auto h-20 w-full max-w-44 object-contain" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Collaborators;
