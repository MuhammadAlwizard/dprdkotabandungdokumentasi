/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        dprd: {
          red: "#8B1E1E",
          dark: "#5c1414",
          gold: "#D4AF37",
          cream: "#FBF7EF",
        },
      },
    },
  },
  plugins: [],
};
