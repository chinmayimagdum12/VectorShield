/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B'
        }
      },
      boxShadow: {
        '2d-sm': '2px 2px 0px 0px #0F172A',
        '2d': '3px 3px 0px 0px #0F172A',
        '2d-lg': '5px 5px 0px 0px #0F172A',
        '2d-indigo': '4px 4px 0px 0px #4338CA',
        '2d-emerald': '4px 4px 0px 0px #047857',
        '2d-rose': '4px 4px 0px 0px #BE123C',
        '2d-amber': '4px 4px 0px 0px #B45309',
        'soft': '0 2px 10px -2px rgba(15, 23, 42, 0.06), 0 10px 25px -5px rgba(15, 23, 42, 0.04)',
      }
    },
  },
  plugins: [],
}
