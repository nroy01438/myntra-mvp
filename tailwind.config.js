/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        coral: {
          50: "#fff1f2",
          100: "#ffe1e3",
          200: "#ffc7cb",
          300: "#ff9fa7",
          400: "#fd6d79",
          500: "#f5405a", // primary brand accent
          600: "#e0224a",
          700: "#bc163e",
          800: "#9c163a",
          900: "#851838",
        },
      },
    },
  },
  plugins: [],
};
