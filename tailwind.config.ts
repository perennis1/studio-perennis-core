import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        perennis: {
          DEFAULT: "#0B1118",
          foreground: "#EDEDED",
          accent: "#5CA8E5",
          muted: "#B0B6C0",
        },
      },
      backgroundColor: {
        perennis: "#0B1118",
      },
    },
  },
  plugins: [typography],
};

export default config;

