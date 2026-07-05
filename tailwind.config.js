/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        'bento-navy': '#1E3A5F',
        'bento-light-blue': '#E0F2FE',
        'bento-bg': '#F8FAFC',
        'bento-text-dark': '#1E293B',
        'bento-text-muted': '#64748B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
