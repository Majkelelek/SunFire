/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'theme-bg': 'var(--theme-bg)',
        'sunfire': 'var(--sunfire-accent)',
        'primary': 'var(--sunfire-accent)',
        'dark-bg': 'var(--dark-bg, #050505)',
        'card-bg': 'var(--card-bg, #111111)',
        'input-bg': 'var(--input-bg, #1a1a1a)',
        'text-main': 'var(--text-main, #ffffff)',
        'text-dim': 'var(--text-dim, #888888)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
