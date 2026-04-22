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
        primary: "rgb(var(--primary-rgb) / <alpha-value>)",
        secondary: "rgb(var(--secondary-rgb) / <alpha-value>)",
        surface: "rgb(var(--surface-rgb) / <alpha-value>)",
        "on-surface": "rgb(var(--on-surface-rgb) / <alpha-value>)",
        "on-surface-variant": "rgb(var(--on-surface-variant-rgb) / <alpha-value>)",
        outline: "rgb(var(--outline-rgb) / <alpha-value>)",
        "outline-variant": "rgb(var(--outline-variant-rgb) / <alpha-value>)",
        "surface-container": "rgb(var(--surface-rgb) / <alpha-value>)",
        "surface-container-low": "rgb(var(--surface-container-low-rgb) / <alpha-value>)",
        "surface-container-lowest": "rgb(var(--surface-container-lowest-rgb) / <alpha-value>)",
        error: "rgb(var(--error-rgb) / <alpha-value>)",
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
