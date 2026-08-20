import type { Config } from "tailwindcss";

// Ayurvedic-tech design tokens.
// Palette: deep forest/herb green (primary), turmeric/saffron (accent), earthy brown, parchment background.
// Deliberately avoids default SaaS blue and neon accents.
const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: "#f2f7f3",
          100: "#dfeade",
          200: "#bcd6ba",
          300: "#93bd8e",
          400: "#699f66",
          500: "#4a8047",
          600: "#376536",
          700: "#2d502e",
          800: "#254026",
          900: "#1c3320",
          950: "#0e1c11",
        },
        saffron: {
          50: "#fef8ec",
          100: "#fcecc7",
          200: "#f8d68a",
          300: "#f4bc4d",
          400: "#f0a524",
          500: "#e2890f",
          600: "#c2680b",
          700: "#9c4a0d",
          800: "#7f3b10",
          900: "#6a3110",
          950: "#3c1806",
        },
        earth: {
          50: "#f7f3ee",
          100: "#ece1d3",
          200: "#d8c2a6",
          300: "#bf9d76",
          400: "#a97e54",
          500: "#8f6641",
          600: "#745137",
          700: "#5c4130",
          800: "#4c372c",
          900: "#413027",
          950: "#231813",
        },
        parchment: {
          DEFAULT: "#faf6ee",
          50: "#fefdfb",
          100: "#faf6ee",
          200: "#f3ead6",
          300: "#e9dbb9",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
