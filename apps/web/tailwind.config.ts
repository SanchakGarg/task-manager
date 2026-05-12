import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        nb: {
          bg: "#FFFDF5",
          card: "#FFFFFF",
          border: "#0A0A0A",
          "primary": "#E84E10",
          "primary-hover": "#C43D09",
          "secondary": "#7C3AED",
          "accent": "#FBBF24",
          "success": "#059669",
          "danger": "#DC2626",
          "warning": "#D97706",
          "info": "#3B82F6",
          "low": "#059669",
          "medium": "#3B82F6",
          "high": "#F59E0B",
          "urgent": "#EF4444",
        },
      },
      boxShadow: {
        nb: "4px 4px 0px #0A0A0A",
        "nb-lg": "6px 6px 0px #0A0A0A",
        "nb-sm": "2px 2px 0px #0A0A0A",
        "nb-xl": "8px 8px 0px #0A0A0A",
        "nb-hover": "6px 6px 0px #0A0A0A",
        "nb-pressed": "1px 1px 0px #0A0A0A",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        nb: "12px",
        "nb-lg": "16px",
        "nb-xl": "24px",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-up": {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "60%": { transform: "scale(1.05)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-2deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        "nb-press": {
          "0%": { transform: "translate(0, 0)", boxShadow: "4px 4px 0px #0A0A0A" },
          "100%": { transform: "translate(4px, 4px)", boxShadow: "0px 0px 0px #0A0A0A" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "bounce-in": "bounce-in 0.4s ease-out",
        wiggle: "wiggle 0.3s ease-in-out",
      },
    },
  },
  plugins: [animate],
};

export default config;
