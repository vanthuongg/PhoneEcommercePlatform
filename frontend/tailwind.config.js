/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#1F5A62',
          50: '#F2F7F8',
          100: '#E3EEF0',
          200: '#C7DBE0',
          300: '#A1C2C9',
          400: '#72A2AC',
          500: '#48828D',
          600: '#1F5A62', // Core primary
          700: '#194950',
          800: '#153C42',
          900: '#112E34',
          950: '#0A1C20',
        },
        accent: {
          DEFAULT: '#B98D42',
          50: '#FAF6ED',
          100: '#F3EAD5',
          200: '#E6D4AA',
          300: '#D8BD7C',
          400: '#CBA55B',
          500: '#B98D42', // Core accent
          600: '#A37B37',
          700: '#87652D',
          800: '#6C5024',
          900: '#523C1A',
          950: '#392A12',
        },
        slate: {
          50: '#F7F8F9',
          100: '#EEF0F2',
          200: '#DEE1E5',
          300: '#C5CBD2',
          400: '#9FA7B2',
          500: '#748090',
          600: '#5C6878',
          700: '#495362',
          800: '#313742',
          900: '#16181C',
          950: '#0E0F12',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-up': 'fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in-down': 'fadeInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-left': 'slideInLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.05)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.35)',
        'glass-lg': '0 16px 48px -8px rgba(0, 0, 0, 0.1)',
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        'premium': '0 12px 30px -4px rgba(22, 24, 28, 0.05), 0 4px 12px -2px rgba(22, 24, 28, 0.02)',
        'premium-dark': '0 12px 30px -4px rgba(0, 0, 0, 0.4), 0 4px 12px -2px rgba(0, 0, 0, 0.2)',
        'premium-hover': '0 20px 40px -8px rgba(22, 24, 28, 0.08), 0 8px 16px -4px rgba(22, 24, 28, 0.03)',
        'premium-hover-dark': '0 20px 40px -8px rgba(0, 0, 0, 0.5), 0 8px 16px -4px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}
