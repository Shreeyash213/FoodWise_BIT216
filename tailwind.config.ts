import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#1F2A22",
        surface: "#26362A",
        "surface-2": "#31462F",
        shelf: "#16201A",
        paper: "#F4EEDD",
        gold: "#E7AC3F",
        paprika: "#C1553B",
        sage: "#8FA38C",
        "sage-dim": "#5E7360",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
      backgroundImage: {
        "shelf-line":
          "repeating-linear-gradient(0deg, transparent, transparent 87px, rgba(244,238,221,0.06) 87px, rgba(244,238,221,0.06) 89px)",
      },
      boxShadow: {
        jar: "inset 0 1px 0 rgba(244,238,221,0.08), 0 6px 16px rgba(0,0,0,0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
