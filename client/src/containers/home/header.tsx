import Link from "next/link";
import LanguageSelector from "../language-selector";
import { useTranslations } from "next-intl";

const Header = () => {
  const t = useTranslations();
  return (
    <div className="flex items-end justify-end px-8 pt-8">
      <div className="flex items-center gap-10 bg-white px-8 py-4 text-sm font-medium text-brown-dark">
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
