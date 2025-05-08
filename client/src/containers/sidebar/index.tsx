"use client";

import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useAtom, useAtomValue } from "jotai";
import { sidebarModeAtom, sidebarOpenAtom } from "@/store/map";
import { ScrollAreaWithThumb } from "@/components/ui/scroll-area";
import Datasets from "../datasets";
import Stories from "../stories";

const Sidebar = (): JSX.Element => {
  const [open, setOpen] = useAtom(sidebarOpenAtom);

  const toggleOpen = () => setOpen((prev) => !prev);
  const sidebarMode = useAtomValue(sidebarModeAtom);

  return (
    <aside
      className={cn(
        "relative left-0 top-0 z-50 h-full bg-background shadow transition-transform duration-300 ease-in-out",
        {
          "-translate-x-full": !open,
          "translate-x-0": open,
        },
      )}
    >
      <div
        className={cn(
          "full absolute top-6 z-0 h-[48px] w-10 rounded-r-full bg-white/40 p-[5px] pl-0 shadow backdrop-blur-lg transition-transform duration-300 ease-in-out",
          open ? "-right-9 hover:-translate-x-2" : "-right-8 hover:translate-x-2",
        )}
      >
        <button className="h-[38px] w-full rounded-r-full bg-background px-1" onClick={toggleOpen}>
          <ArrowLeft
            className={cn(
              "ml-auto h-5 w-5 transition-transform duration-300",
              !open && "rotate-180",
            )}
          />
        </button>
      </div>
      <ScrollAreaWithThumb className="relative z-10 h-[var(--content-height)] w-[400px] bg-white">
        {sidebarMode === "layers" ? <Datasets /> : <Stories />}
      </ScrollAreaWithThumb>
    </aside>
  );
};

export default Sidebar;
