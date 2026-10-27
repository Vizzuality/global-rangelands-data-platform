import Image from "next/image";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

const MobileNotice = () => {
  const t = useTranslations();

  return (
    <div className="relative min-h-[calc(100dvh-var(--mobile-header-height))] overflow-hidden bg-brown-light px-5 pt-20 lg:hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-orange-light opacity-30 [mask-image:url(/images/features-pattern-tile.svg)] [mask-repeat:repeat] [mask-size:768px_576px]"
      />
      <div className="relative flex flex-col items-center gap-6 bg-white px-6 py-8 text-center">
        <div className="flex flex-col items-center gap-2.5">
          <Image
            src="/images/home/icon-color.png"
            alt={t("logo colored")}
            width={166}
            height={50}
          />
          <p className="font-serif text-[40px] font-light leading-[56px] text-champion-ink">
            {t("Data Rangelands")}
          </p>
        </div>
        <p className="text-body-22-tight text-green-dark opacity-80">
          The map explorer is currently available on desktop only. Switch to a desktop device to
          access the full experience, or return to the homepage to explore other content.
        </p>
        <Button
          asChild
          className="h-auto rounded-none bg-brown-dark px-5 py-3 font-sans text-base font-medium leading-6 text-white hover:bg-brown-light"
        >
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default MobileNotice;
