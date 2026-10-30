/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#102421',
        mist: '#f3f7f5',
        teal: { 500: '#18a889', 600: '#118570', 700: '#0d695b' },
        coral: '#eb765a',
      },
      boxShadow: {
        card: '0 12px 40px rgba(13, 46, 40, 0.07)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
