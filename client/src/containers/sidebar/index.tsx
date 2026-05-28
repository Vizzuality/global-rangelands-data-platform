"use client";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { useAtom } from "jotai";
import { AnimatePresence, motion } from "motion/react";
import { sidebarOpenAtom } from "@/store/map";
import { usePathname } from "@/i18n/navigation";
import { ScrollAreaWithThumb } from "@/components/ui/scroll-area";
import Datasets from "../datasets";
import Stories from "../stories";
import StoryDetail from "../stories/detail";

import type { JSX } from "react";

const Sidebar = (): JSX.Element => {
  const [open, setOpen] = useAtom(sidebarOpenAtom);
  const pathname = usePathname();

  const toggleOpen = () => setOpen((prev) => !prev);

  const storyDetailMatch = pathname.match(/^\/map\/story\/([^/]+)/);
  const storyDetailSlug = storyDetailMatch?.[1] ?? null;
  const inStoriesMode = pathname.startsWith("/map/stor");

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
        {inStoriesMode ? <Stories /> : <Datasets />}
      </ScrollAreaWithThumb>
      <AnimatePresence>
        {storyDetailSlug && (
          <motion.div
            key="story-detail"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 z-20 w-[400px] bg-white shadow-lg"
          >
            <ScrollAreaWithThumb className="h-[var(--content-height)] w-full">
              <StoryDetail slug={storyDetailSlug} />
            </ScrollAreaWithThumb>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};

export default Sidebar;
