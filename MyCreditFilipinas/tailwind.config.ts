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
        cream: {
          50: "#FFFDFB",
          100: "#FFF8F0",
          200: "#FFF0E0",
          300: "#FFE8D0",
          400: "#FFDFC0",
        },
        "ph-blue": {
          50: "#E8EDF7",
          100: "#C5D2EC",
          200: "#9EB4E0",
          300: "#7796D4",
          400: "#5A80CB",
          500: "#0038A8",
          600: "#003297",
          700: "#002A82",
          800: "#00226D",
          900: "#001750",
          950: "#000D30",
        },
        "ph-red": {
          50: "#FDE8EB",
          100: "#F9C5CC",
          200: "#F49DAA",
          300: "#EF7588",
          400: "#EB586E",
          500: "#CE1126",
          600: "#B80F22",
          700: "#9E0D1D",
          800: "#840A18",
          900: "#5E0711",
          950: "#3A0409",
        },
        "ph-gold": {
          50: "#FFFDE6",
          100: "#FFF9BF",
          200: "#FFF596",
          300: "#FFF06D",
          400: "#FFEB4D",
          500: "#FCD116",
          600: "#E5BD14",
          700: "#C4A011",
          800: "#A3840E",
          900: "#7A630A",
          950: "#524205",
        },
      },
    },
  },
  plugins: [],
};

export default config;
