"use client";

import { PropsWithChildren, useState } from "react";

import { usePathname } from "next/navigation";

// import { LuChevronLeft } from "react-icons/lu";

import { cn } from "@/lib/utils";

const Sidebar = ({ children }: PropsWithChildren): JSX.Element => {
  const [open, setOpen] = useState(true);

  const toggleOpen = () => setOpen((prev) => !prev);

  return (
    <aside
      className={cn({
        "absolute left-0 top-0 z-10 h-full w-full bg-background p-6 pt-10 shadow transition-transform duration-300 ease-in-out":
          true,
        "-translate-x-full": !open,
        "translate-x-0": open,
        "max-w-sm": true,
      })}
    >
      {children}

      <button
        className="absolute left-full top-0 z-0 rounded-r-lg bg-white py-2.5 shadow"
        onClick={toggleOpen}
      >
        {open ? "Close" : "Open"}
      </button>
    </aside>
  );
};

export default Sidebar;
