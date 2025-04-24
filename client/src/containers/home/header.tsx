import Link from "next/link";
import LanguageSelector from "../language-selector";
import { useTranslations } from "next-intl";

const Header = () => {
  const t = useTranslations();
  return (
    <div className="HEADER flex items-end sm:justify-end sm:px-8 sm:pt-8">
      <div className="flex w-full items-center gap-10 bg-white px-8 py-4 text-sm font-medium text-brown-dark sm:w-auto">
        <Link className="transition-colors duration-300 hover:text-brown-light" href="/map">
          {t("Explore map")}
        </Link>
        <Link className="transition-colors duration-300 hover:text-brown-light" href="/about">
          {t("About")}
        </Link>
        <div className="h-5 w-px bg-brown-dark"></div>
        <LanguageSelector />
      </div>
    </div>
  );
};

export default Header;
