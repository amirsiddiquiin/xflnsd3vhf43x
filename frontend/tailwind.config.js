/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f2f0ea',
        paper: '#fffdfa',
        ink: '#17201e',
        muted: '#6c726d',
        line: '#dedbd3',
        forest: '#123c34',
        mint: '#cde9df',
        forecast: '#16846f',
        actual: '#315fda',
        bias: '#c7902f',
        danger: '#b74e43',
        success: '#236f5d',
        'success-wash': '#edf6f2',
      },
      boxShadow: {
        fine: '0 1px 2px rgba(25, 31, 29, 0.035)',
        tooltip: '0 14px 34px rgba(27, 34, 31, 0.12)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
