"use client";

import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useAtom } from "jotai";
import { sidebarOpenAtom } from "@/store/map";
import { ScrollAreaWithThumb } from "@/components/ui/scroll-area";

const Sidebar = ({ children }: PropsWithChildren): JSX.Element => {
  const [open, setOpen] = useAtom(sidebarOpenAtom);

  const toggleOpen = () => setOpen((prev) => !prev);

  return (
    <aside
      className={cn(
        "relative left-0 top-0 z-10 h-full bg-background shadow transition-transform duration-300 ease-in-out",
        {
          "-translate-x-full": !open,
          "translate-x-0": open,
        },
      )}
    >
      <ScrollAreaWithThumb className="h-[var(--content-height)] w-96">
        {children}
      </ScrollAreaWithThumb>

      <div className="absolute left-full top-6 z-0 rounded-r-full bg-white/40 p-1 pl-0 shadow backdrop-blur-lg">
        <button className="rounded-r-full bg-background px-1 py-2.5 " onClick={toggleOpen}>
          <ArrowLeft
            className={cn("h-5 w-5 transition-transform duration-300", !open && "rotate-180")}
          />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
