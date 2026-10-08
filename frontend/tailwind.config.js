/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          900: '#070B13',
          800: '#0B111E',
          700: '#111B2E',
          600: '#18253D',
          border: '#1E2D48',
          accent: '#10B981',
          crimson: '#EF4444',
          amber: '#F59E0B',
          neon: '#06B6D4'
        }
      },
      boxShadow: {
        '2d-sm': '2px 2px 0px 0px rgba(0, 0, 0, 1)',
        '2d': '4px 4px 0px 0px rgba(0, 0, 0, 1)',
        '2d-emerald': '4px 4px 0px 0px rgba(16, 185, 129, 0.4)',
        '2d-crimson': '4px 4px 0px 0px rgba(239, 68, 68, 0.4)',
        '2d-amber': '4px 4px 0px 0px rgba(245, 158, 11, 0.4)',
        '2d-cyan': '4px 4px 0px 0px rgba(6, 182, 212, 0.4)',
      }
    },
  },
  plugins: [],
}
