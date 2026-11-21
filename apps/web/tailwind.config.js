/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', '"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        serif: ['var(--font-serif)', 'Merriweather', 'Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
        mono: ['var(--font-mono)', '"JetBrains Mono"', '"SFMono-Regular"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        ink: {
          950: '#070A0F',
          900: '#0B0F17',
          800: '#151D2C',
          700: '#233044',
          500: '#64748B',
          400: '#94A3B8',
        },
      },
    },
  },
  plugins: [],
}
