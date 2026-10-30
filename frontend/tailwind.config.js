/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f7f8fa',
        paper: '#ffffff',
        ink: '#102329',
        muted: '#64748b',
        line: '#e3e8ed',
        feature: '#102a30',
        'feature-soft': '#173941',
        forecast: '#0d9488',
        actual: '#4f6bff',
        warning: '#e59a42',
        'warning-deep': '#a86116',
        'warning-wash': '#fff7e9',
        danger: '#c2564b',
        success: '#137a5c',
        'success-wash': '#eef8f4',
        'chart-forecast': '#2dd4bf',
        'chart-actual': '#8fa0ff',
        'chart-muted': '#9db0b4',
      },
      boxShadow: {
        panel: '0 1px 2px rgba(15, 35, 41, 0.03)',
        chart: '0 10px 30px rgba(16, 42, 48, 0.09)',
        tooltip: '0 12px 30px rgba(4, 17, 20, 0.24)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
