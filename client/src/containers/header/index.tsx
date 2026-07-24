"use client";

import { usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import HeaderNavigation from "./navigation";

const Header = () => {
  const pathname = usePathname();
  const isStories = pathname.startsWith("/stories");

  return (
    <div
      className={cn(
        "z-50",
        isStories
          ? "absolute inset-x-0 top-0 bg-transparent"
          : "bg-brown-light bg-[url(/images/header-pattern.png)] bg-contain bg-repeat-x",
      )}
    >
      <div className="mx-6 flex items-center justify-between gap-7">
        <HeaderNavigation />
      </div>
    </div>
  );
};

export default Header;
