import type { Config } from "tailwindcss"
import colors from "tailwindcss/colors"

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: colors.blue,
        navy: {
          700: "#1a2c55",
          800: "#122246",
          900: "#0c1a3a",
          950: "#081229",
        },
      },
      keyframes: {
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(0.5rem)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "toast-in": "toast-in 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "pop-in": "pop-in 0.18s ease-out",
      },
    },
  },
  plugins: [],
}

export default config
