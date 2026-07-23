import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "serif"],
        sans: ["var(--font-wotfard)", "sans-serif"],
      },
      colors: {
        global: "rgb(var(--global-rgb) / <alpha-value>)",
        foreground: "rgb(var(--foreground-rgb) / <alpha-value>)",
        background: "rgb(var(--background-rgb) / <alpha-value>)",
        "popover-foreground": "rgb(var(--popover-foreground-rgb) / <alpha-value>)",
        "brown-dark": "rgba(128, 0, 0, 1)",
        "brown-light": "rgba(194, 57, 12, 1)",
        "orange-dark": "rgba(208, 96, 16, 1)",
        "orange-light": "rgba(217, 100, 16, 1)",
        "orange-bright": "rgba(255, 147, 70, 1)",
        "green-dark": "rgba(24, 34, 25, 1)",
        "green-medium": "rgba(5, 73, 38, 1)",
        "green-light": "rgba(64, 133, 64, 1)",
        "hunter-green-50": "rgba(243, 246, 243, 1)",
        "hunter-green-200": "rgba(199, 212, 198, 1)",
        "hunter-green-300": "rgba(160, 182, 159, 1)",
        "hunter-green-400": "rgba(117, 147, 116, 1)",
        navy: "rgba(26, 25, 62, 1)",
        gold: "rgba(184, 183, 86, 1)",
      },
      lineHeight: {
        relaxed: "185%",
      },
      fontSize: {
        "body-22": ["22px", { lineHeight: "38px", fontWeight: "400" }],
        "body-22-tight": ["22px", { lineHeight: "30px", fontWeight: "400" }],
        "label-16": ["16px", { lineHeight: "24px", fontWeight: "500" }],
        "body-14": ["14px", { lineHeight: "26px", fontWeight: "400" }],
      },
    },
    container: {
      padding: "2rem",
    },
  },
};
export default config;
