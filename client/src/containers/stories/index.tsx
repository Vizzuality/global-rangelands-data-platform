import { useTranslations } from "next-intl";
import Image from "next/image";

const Stories = () => {
  const t = useTranslations();

  return (
    <div className="">
      <header className="space-y-4 border-b border-foreground p-6 pt-10">
        <h1 className="font-serif text-[50px] font-light leading-[90%]">
          {t("Rangelands Stories")}
        </h1>

        <p className="text-sm leading-relaxed">
          {t(
            "These case studies show the impact of changes in rangelands on local communities, their livestock, and natural resources. They also highlight efforts by pastoralists and organizations to protect these rangelands and their wildlife, while strengthening livelihoods reliant on extensive livestock systems.",
          )}
        </p>
      </header>
      <div className="space-y-10 p-6">
        <p>{t("Coming soon...")}</p>
        <div>
          <Image
            src="/images/stories/rangelands-stories.png"
            alt="Rangelands Stories"
            width={500}
            height={500}
          />
        </div>
      </div>
    </div>
  );
};

export default Stories;
