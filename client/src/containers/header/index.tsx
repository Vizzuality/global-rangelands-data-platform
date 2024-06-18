import LanguageSelector from "./language-selector";
import HeaderNavigation from "./navigation";

const Header = () => {
  return (
    <div className="relative z-50 flex items-center justify-between gap-7 bg-foreground px-10">
      <HeaderNavigation />
      <LanguageSelector />
    </div>
  );
};

export default Header;
