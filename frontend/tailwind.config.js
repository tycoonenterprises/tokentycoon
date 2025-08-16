/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'eth-dark': '#1c1c1e',
        'eth-primary': '#627eea',
        'eth-secondary': '#f7931a',
        'eth-success': '#4ade80',
        'eth-danger': '#ef4444',
      },
    },
  },
  plugins: [],
}