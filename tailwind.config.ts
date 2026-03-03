import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        black: '#0a0a0a',
        white: '#ffffff',
        accent: '#B57170',
        positive: '#22c55e',
        negative: '#ef4444',
        warning: '#f59e0b',
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      fontFamily: {
        main: ['Outfit', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '12px',
        lg: '16px',
      },
      boxShadow: {
        DEFAULT: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
        lg: '0 4px 24px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
} satisfies Config;
