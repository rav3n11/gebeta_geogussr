/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        white: '#ffffff',
        gray: {
          100: '#f7f7f7',
          200: '#e1e1e1',
          300: '#cfcfcf',
          400: '#b1b1b1',
          500: '#9e9e9e',
          600: '#7e7e7e',
          700: '#626262',
          800: '#515151',
          900: '#3b3b3b',
        },
      },
    },
  },
  plugins: [],
}
