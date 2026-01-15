/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Outfit"', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#6366f1', // Indigo 500
          hover: '#4f46e5',
          light: '#e0e7ff',
        },
        secondary: {
          DEFAULT: '#a855f7', // Purple 500
          hover: '#9333ea',
          light: '#f3e8ff',
        },
        background: '#f8fafc',
        surface: '#ffffff',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 15px rgba(99, 102, 241, 0.3)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
