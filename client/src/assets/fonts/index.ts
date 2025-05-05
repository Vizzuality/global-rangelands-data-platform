import localFont from "next/font/local";

const wotfard = localFont({
  src: [
    {
      path: "./wotfard/Wotfard-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./wotfard/Wotfard-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./wotfard/Wotfard-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./wotfard/Wotfard-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./wotfard/Wotfard-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-wotfard",
});

const eyesForSerifs = localFont({
  src: [
    {
      path: "./eyes-for-serif/eyesforserifs-light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./eyes-for-serif/eyesforserifs-regular.otf",
      weight: "400",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-serif",
});

export { wotfard, eyesForSerifs };
