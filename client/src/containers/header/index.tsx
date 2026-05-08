import { cn } from "@/lib/utils";
import HeaderNavigation from "./navigation";
import LanguageSelector from "../language-selector";

const Header = () => {
  return (
    <div
      className={cn(
        "z-50 bg-brown-light bg-[url(/images/header-pattern.png)] bg-contain bg-repeat-x",
      )}
    >
      <div className="mx-6 flex items-center justify-between gap-7">
        <HeaderNavigation />
        <div className="h-5 w-px bg-white"></div>
        <LanguageSelector variant="dark" />
      </div>
    </div>
  );
};

export default Header;
