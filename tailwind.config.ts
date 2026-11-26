import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        garud: {
          cream: '#FBF4D8',
          'cream-dark': '#F2E7BE',
          'cream-border': '#DFD1A0',
          teal: '#0B4654',
          'teal-deep': '#07313B',
          'teal-light': '#146072',
          ink: '#0E2A31',
          muted: '#52727A',
          ochre: '#C87D28',
        },
      },
      fontFamily: {
        display: ['var(--font-cinzel)', 'serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      letterSpacing: {
        'ultra': '0.25em',
        'mega': '0.4em',
      },
      animation: {
        'ticker': 'ticker 35s linear infinite',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
