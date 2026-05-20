import { cn } from "@/lib/utils";
import HeaderNavigation from "./navigation";

const Header = () => {
  return (
    <div
      className={cn(
        "z-50 bg-brown-light bg-[url(/images/header-pattern.png)] bg-contain bg-repeat-x",
      )}
    >
      <div className="mx-6 flex items-center justify-between gap-7">
        <HeaderNavigation />
      </div>
    </div>
  );
};

export default Header;
