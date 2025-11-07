"use client";

import { PropsWithChildren, useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MapProvider } from "react-map-gl";

export default function LayoutProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <MapProvider>{children}</MapProvider>
      </QueryClientProvider>
    </>
  );
}
