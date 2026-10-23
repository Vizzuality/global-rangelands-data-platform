"use client";
import type { ReactNode } from "react";

import useMediaQuery from "@/hooks/use-media-query";

const DesktopOnly = ({ children }: { children: ReactNode }) => {
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return isDesktop ? children : null;
};

export default DesktopOnly;
