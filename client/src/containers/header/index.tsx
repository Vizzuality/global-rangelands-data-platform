"use client";
import { cn } from "@/lib/utils";
import LanguageSelector from "./language-selector";
import HeaderNavigation from "./navigation";
import { usePathname } from "@/navigation";

const Header = () => {
  const pathname = usePathname();

  const isMap = pathname === "/map";
  return (
    <div className={cn("z-50 ", isMap ? "bg-foreground" : "bg-background")}>
      <div className="container mx-auto flex items-center justify-between gap-7">
        <HeaderNavigation />
        <LanguageSelector />
      </div>
    </div>
  );
};

export default Header;
