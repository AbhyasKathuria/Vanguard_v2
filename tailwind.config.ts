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
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Custom Monochromatic Palette from Swatches
        vg: {
          50: '#fafafa',
          100: '#f5f5f5', // Swatch 1
          200: '#dcdcdc', // Swatch 2
          300: '#c5c5c5',
          400: '#a6a6a6', // Swatch 3
          500: '#8a8a8a',
          600: '#707070', // Swatch 4
          700: '#545454',
          800: '#404040', // Swatch 5
          900: '#262626',
          950: '#141414',
        },
      },
    },
  },
  plugins: [],
};

export default config;
