/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-assistant)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        coral: {
          50: "#fff0f3",
          100: "#ffe0e6",
          200: "#ffc2ce",
          300: "#ff8fa3",
          400: "#ff6685",
          500: "#ff3f6c", // Myntra's actual brand pink/red
          600: "#e0294f",
          700: "#bc1c3f",
          800: "#9c1a37",
          900: "#851a33",
        },
      },
    },
  },
  plugins: [],
};
