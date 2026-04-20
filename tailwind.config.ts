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
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        surface: "var(--surface)",
        "on-surface": "var(--on-surface)",
        "on-surface-variant": "var(--on-surface-variant)",
        outline: "var(--outline)",
        "outline-variant": "var(--outline-variant)",
        "surface-container": "var(--surface-container)",
        "surface-container-low": "var(--surface-container-low)",
        "surface-container-lowest": "var(--surface-container-lowest)",
        error: "var(--error)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        headline: ["var(--font-saira-stencil)"],
        body: ["var(--font-sans)"],
      },
    },
  },
  plugins: [],
};
export default config;
