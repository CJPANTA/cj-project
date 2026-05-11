/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'cj-dark': '#0a141d',
        'cj-cyan': '#22d3ee',
        'cj-emerald': '#10b981',
        'cj-glass': 'rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}