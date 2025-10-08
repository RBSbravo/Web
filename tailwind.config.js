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
        primary: {
          DEFAULT: '#10B981', // Green
          light: '#34D399',
          dark: '#059669',
        },
        secondary: {
          DEFAULT: '#F3F4F6',
          dark: '#E5E7EB',
        },
        accent: '#6366F1',
        background: '#F9FAFB',
        text: {
          DEFAULT: '#1F2937', // Dark Gray
          light: '#6B7280',
        },
        error: '#EF4444',
        success: '#10B981',
        warning: '#F59E0B',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
} 