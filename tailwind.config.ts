import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        crimson: {
          50: "#fff0f0",
          100: "#ffdddd",
          200: "#ffc0c0",
          300: "#ff9494",
          400: "#ff5757",
          500: "#ff2323",
          600: "#ff0000",
          700: "#d70000",
          800: "#b10303",
          900: "#8B1A1A",
          950: "#4c0202",
        },
        gold: {
          50: "#fefce8",
          100: "#fef9c3",
          200: "#fef08a",
          300: "#fde047",
          400: "#facc15",
          500: "#D4AF37",
          600: "#b89a2e",
          700: "#9a7e24",
          800: "#7d661d",
          900: "#665219",
          950: "#3d2f0a",
        },
        ivory: {
          50: "#FFFEF9",
          100: "#FFF8EE",
          200: "#FFF0D6",
          300: "#FFE4B5",
          400: "#FFD27F",
          500: "#F5C842",
        },
        mahogany: {
          50: "#fdf5ef",
          100: "#fae8d9",
          200: "#f5cdb1",
          300: "#edaa80",
          400: "#e37f4d",
          500: "#dc622b",
          600: "#ce4d20",
          700: "#ab3b1d",
          800: "#88311f",
          900: "#6e2b1d",
          950: "#2D1B00",
        },
        copper: "#C9956C",
        ebony: "#1A0A00",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        utility: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "silk-gradient":
          "linear-gradient(135deg, #8B1A1A 0%, #D4AF37 50%, #8B1A1A 100%)",
        "gold-shimmer":
          "linear-gradient(90deg, transparent 0%, #D4AF37 50%, transparent 100%)",
        "dark-luxury":
          "linear-gradient(135deg, #1A0A00 0%, #2D1B00 50%, #1A0A00 100%)",
        "card-glass":
          "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
        "hero-pattern":
          "radial-gradient(ellipse at top, #4c0202 0%, #1A0A00 60%, #000 100%)",
        "footer-gradient":
          "linear-gradient(180deg, #1A0A00 0%, #0a0500 100%)",
      },
      boxShadow: {
        luxury:
          "0 20px 60px -15px rgba(139, 26, 26, 0.4), 0 0 0 1px rgba(212, 175, 55, 0.1)",
        "gold-glow": "0 0 30px rgba(212, 175, 55, 0.3)",
        "card-hover":
          "0 30px 80px -20px rgba(139, 26, 26, 0.5), 0 0 40px rgba(212, 175, 55, 0.15)",
        glass: "inset 0 1px 1px rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.3)",
      },
      animation: {
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "pulse-gold": "pulseGold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-up": "slideUp 0.5s ease-out",
        "fade-in": "fadeIn 0.5s ease-out",
        "spin-slow": "spin 8s linear infinite",
        "scale-in": "scaleIn 0.3s ease-out",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        pulseGold: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionTimingFunction: {
        luxury: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
    },
  },
  plugins: [],
};

export default config;
