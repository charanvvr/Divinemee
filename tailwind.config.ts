import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#f7f3ec',
          deep: '#efe8db',
          warm: '#f3ecdf',
        },
        paper: '#fdfbf7',
        ink: {
          DEFAULT: '#211a14',
          soft: '#4a4038',
          faint: '#8a7d70',
        },
        gold: {
          DEFAULT: '#b08538',
          bright: '#d9b06a',
          soft: '#ecdfc3',
        },
        rose: {
          DEFAULT: '#c97c92',
          deep: '#a85570',
          soft: '#f6e7eb',
        },
        lavender: {
          DEFAULT: '#8a72c0',
          deep: '#6a539e',
          soft: '#ece7f6',
        },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      transitionTimingFunction: {
        silk: 'cubic-bezier(0.22, 1, 0.36, 1)',
        lux: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      boxShadow: {
        product: '0 30px 60px -18px rgba(70, 50, 30, 0.28)',
        card: '0 24px 60px -24px rgba(70, 50, 30, 0.18)',
        lift: '0 40px 80px -28px rgba(70, 50, 30, 0.32)',
      },
    },
  },
  plugins: [],
};

export default config;
