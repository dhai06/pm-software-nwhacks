import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Arial", "sans-serif"],
        serif: ["var(--font-source-serif)", "Georgia", "serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        stone: {
          50: '#FAF9F6',  // Warm Paper Background
          100: '#F4F3F0', // Cards
          200: '#E6E4DD', // Borders
          300: '#D5D3CC', // Accents
          400: '#A8A29E', // Edges/Icons
          800: '#383835', // Primary Text (Charcoal)
          900: '#1F1E1D',
        },
        accent: {
          DEFAULT: '#3B82F6', // Blue 500
          hover: '#2563EB',
        },
      },
    },
  },
  plugins: [],
};
export default config;
