import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        "xxs": ["0.625rem", "0.875rem"]
      },
      colors: {
        primary: {
          100: "#E2E3F6",
          300: "#BFC1EE",
          500: "#5361F8",
          900: "#161839",
        },
        success: {
          300: "#F3FDEF",
          500: "#89EB5B",
        },
        loading: {
          300: "#EEEFFF",
          500: "#5361F8",
        },
        error: {
          300: "#FEEAEA",
          500: "#F12D2D",
        },
      },
    },
  },
  plugins: [],
};
export default config;
