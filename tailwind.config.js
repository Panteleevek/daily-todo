/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: {
          DEFAULT: '#f0eee9',
          50: '#faf9f7',
          100: '#f0eee9',
          200: '#e6e3db',
          300: '#dcd8cd',
          400: '#d2cdbf',
          500: '#f0eee9',
        },
      },
    },
  },
  safelist: [
    'from-main-100',
    'to-main-100',
    'bg-main-100',
    'bg-gradient-to-br',
    'bg-gradient-to-tr',
    'bg-gradient-to-bl',
    'bg-gradient-to-tl',
  ],
  plugins: [],
};