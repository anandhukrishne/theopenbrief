/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SFMono-Regular"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        ink: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          500: '#64748B',
          400: '#94A3B8',
        },
      },
    },
  },
  plugins: [],
}
