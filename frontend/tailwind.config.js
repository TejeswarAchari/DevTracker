/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        /* ==============================
           GitHub-Style Dark Base
        ============================== */
        devDark: "#0d1117",   // Main background
        devCard: "#161b22",   // Cards / panels
        devBorder: "#30363d", // Borders

        /* ==============================
           Contribution Heatmap (Green)
        ============================== */
        devGreen: {
          100: "#0e4429", // Lowest activity
          300: "#006d32",
          500: "#26a641",
          700: "#39d353", // Highest activity
        },

        /* ==============================
           Neon Accent Palette (UI flair)
        ============================== */
        primary: "#8b5cf6",   // Violet
        secondary: "#06b6d4", // Cyan
        accent: "#d946ef",    // Fuchsia

        /* ==============================
           Glass / Effects
        ============================== */
        glassBorder: "rgba(255, 255, 255, 0.1)",
      },

      fontFamily: {
        sans: ["Inter", "sans-serif"], // remember to import Inter
      },

      /* ==============================
         Animations
      ============================== */
      animation: {
        blob: "blob 7s infinite",
        "fade-in": "fadeIn 0.5s ease-out forwards",
      },

      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
