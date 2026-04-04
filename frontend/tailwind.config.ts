import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#6C63FF",
          foreground: "#F0F0FF",
          50: "#f0efff",
          100: "#e4e2ff",
          500: "#6C63FF",
          600: "#5a52e0",
          700: "#4940c0",
        },
        accent: {
          DEFAULT: "#00D4AA",
          foreground: "#0F0F1A",
        },
        warning: { DEFAULT: "#F59E0B" },
        success: { DEFAULT: "#10B981" },
        background: { DEFAULT: "#0F0F1A" },
        surface: {
          DEFAULT: "#1A1A2E",
          2: "#252540",
        },
        text: {
          primary: "#F0F0FF",
          secondary: "#9090B0",
        },
        border: { DEFAULT: "rgba(108, 99, 255, 0.2)" },
        // shadcn/ui compatibility
        card: { DEFAULT: "#1A1A2E", foreground: "#F0F0FF" },
        popover: { DEFAULT: "#252540", foreground: "#F0F0FF" },
        secondary: { DEFAULT: "#252540", foreground: "#F0F0FF" },
        muted: { DEFAULT: "#252540", foreground: "#9090B0" },
        destructive: { DEFAULT: "#ef4444", foreground: "#F0F0FF" },
        input: "#252540",
        ring: "#6C63FF",
        foreground: "#F0F0FF",
      },
      borderRadius: {
        lg: "12px",
        md: "10px",
        sm: "8px",
      },
      fontFamily: {
        sans: ["DM Sans", "Noto Sans Arabic", "system-ui", "sans-serif"],
        heading: ["Syne", "IBM Plex Arabic", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
        arabic: ["IBM Plex Arabic", "Noto Sans Arabic", "sans-serif"],
      },
      keyframes: {
        "flip-in": {
          "0%": { transform: "rotateY(90deg)", opacity: "0" },
          "100%": { transform: "rotateY(0deg)", opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "flip-in": "flip-in 0.3s ease-out",
        shimmer: "shimmer 2s infinite",
        "fade-in": "fade-in 0.3s ease-out",
      },
      boxShadow: {
        glow: "0 0 20px rgba(108, 99, 255, 0.3)",
        "glow-accent": "0 0 20px rgba(0, 212, 170, 0.3)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
