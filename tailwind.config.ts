/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#ddd1b3',
        secondary: {
          100: '#f0eee9',
          200: '#f6f4ef',
          300: '#f6efde',
          400: '#e9e2d2',
        },
      },
    },
  },
  plugins: [],
};
