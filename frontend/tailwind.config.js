/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crimson: {
          50: '#fef2f3',
          100: '#ffe1e4',
          200: '#ffc8cd',
          300: '#ffa1aa',
          400: '#ff6b7b',
          500: '#fa3953',
          600: '#e71c3b',
          700: '#c2102c',
          800: '#9f1029',
          900: '#841227',
          950: '#4a0d17', // Primary Luxury Wine Red
        },
        gold: {
          50: '#fbf8ee',
          100: '#f4ebb9',
          200: '#ebd982',
          300: '#dfc04c',
          400: '#d4af37', // Brand Gold Accent
          500: '#be982a',
          600: '#a17a20',
          700: '#815c1b',
          800: '#684a1a',
          900: '#563d19',
          950: '#32210c',
          antique: '#C5A880',
          bronze: '#8C6239',
        },
        obsidian: {
          50: '#f6f6f6',
          100: '#e7e7e7',
          200: '#d1d1d1',
          300: '#b0b0b0',
          400: '#888888',
          500: '#6d6d6d',
          600: '#5d5d5d',
          700: '#4f4f4f',
          800: '#333333',
          900: '#1a1a1a',
          950: '#121212', // Primary Dark obsidian
        },
        ivory: {
          50: '#ffffff',
          100: '#fcfcf9',
          200: '#faf8f2',
          300: '#f5f0e3', // Luxurious light warm ivory
          400: '#ebe0cb',
          500: '#dbcaa8',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Cinzel', 'Georgia', 'serif'],
        sans: ['Montserrat', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'gold-sm': '0 1px 3px 0 rgba(212, 175, 55, 0.1), 0 1px 2px -1px rgba(212, 175, 55, 0.1)',
        'gold': '0 4px 6px -1px rgba(212, 175, 55, 0.15), 0 2px 4px -2px rgba(212, 175, 55, 0.15)',
        'gold-md': '0 10px 15px -3px rgba(212, 175, 55, 0.15), 0 4px 6px -4px rgba(212, 175, 55, 0.15)',
        'gold-lg': '0 20px 25px -5px rgba(212, 175, 55, 0.2), 0 8px 10px -6px rgba(212, 175, 55, 0.2)',
        'gold-xl': '0 25px 50px -12px rgba(212, 175, 55, 0.25)',
      },
      backgroundImage: {
        'luxury-gradient': 'linear-gradient(135deg, #4a0d17 0%, #121212 100%)',
        'gold-gradient': 'linear-gradient(135deg, #f4ebb9 0%, #d4af37 50%, #815c1b 100%)',
        'gold-gradient-light': 'linear-gradient(135deg, #ffffff 0%, #fcfcf9 50%, #f4ebb9 100%)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        pulseGold: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6, transform: 'scale(1.02)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        shimmer: 'shimmer 1.5s infinite',
        pulseGold: 'pulseGold 2s infinite ease-in-out',
      }
    },
  },
  plugins: [],
}
