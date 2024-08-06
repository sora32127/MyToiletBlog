import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "fade-in": {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        "fade-in": "fade-in 1.0s ease-out",
      },
      fontFamily: {
        "sans" : ["IBM Plex Sans JP"],
        "serif" : ["Noto Serif JP"],
      },
    },
  },
  
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
  daisyui: {
    themes: [{
      nord: {
        ...require("daisyui/src/theming/themes")["nord"],
        "primary": "#dd5660",
      },
      sunset: {
        ...require("daisyui/src/theming/themes")["sunset"],
        "primary": "#dd5660",
      }
    }],
  }
} satisfies Config;
