import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        global: "rgb(var(--global-rgb) / <alpha-value>)",
        foreground: "rgb(var(--foreground-rgb) / <alpha-value>)",
        background: "rgb(var(--background-rgb) / <alpha-value>)",
      },
      lineHeight: {
        relaxed: "185%",
      },
    },
    container: {
      padding: '2rem',
    },
  },
};
export default config;
