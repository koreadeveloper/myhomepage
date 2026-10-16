/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './index.tsx', './App.tsx', './{components,pages,hooks,services,lib,data}/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F8F9FD',
        ink: '#101828',
        muted: '#475467',
        brand: '#6846FF',
        night: '#0B1020',
        nightcard: '#141B2E',
      },
    },
  },
  plugins: [],
};
