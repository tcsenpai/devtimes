import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        paper: "var(--paper)",
        "paper-shade": "var(--paper-shade)",
        "paper-deep": "var(--paper-deep)",
        rule: "var(--rule)",
        accent: "var(--accent)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "Georgia", "serif"],
        masthead: ["var(--font-masthead)", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
