import { useTranslations } from "@/i18n";
import Image from "next/image";

const COLLABORATORS = ["ilc", "rangelands", "ilri", "unep", "FAO", "wwf", "iucn"];

const imageSrc = "https://storage.googleapis.com/rdp-landing-bucket/collaborators/";

const Collaborators = () => {
  const t = useTranslations();
  return (
    <div className="space-y-10">
      <p className="text-center uppercase">{t("collaborators")}:</p>
      <div className="flex flex-wrap content-center items-center justify-between gap-6">
        {COLLABORATORS.map((name) => (
          <div key={name} className="p-5">
            <Image
              src={`${imageSrc}${name}.png`}
              alt={name}
              width={180}
              height={100}
              className="h-full max-h-16 w-full max-w-40 object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Collaborators;
