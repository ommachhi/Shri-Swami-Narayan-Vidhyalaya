/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B3A6B', // Deep Blue
          light: '#2a5298',
          dark: '#122647',
        },
        accent: {
          DEFAULT: '#F97316', // Saffron/Orange
          light: '#fb923c',
          dark: '#c2410c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
