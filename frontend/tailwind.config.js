/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f4f5f1',
        paper: '#ffffff',
        ink: '#17201d',
        muted: '#68716b',
        line: '#dde1dc',
        feature: '#123d35',
        'feature-soft': '#1b544a',
        forecast: '#14806f',
        actual: '#6d70e6',
        warning: '#d98b35',
        'warning-deep': '#9b5b17',
        'warning-wash': '#fff7e9',
        danger: '#c2564b',
        success: '#14705d',
        'success-wash': '#eaf6f1',
        'chart-forecast': '#14806f',
        'chart-actual': '#6d70e6',
        'chart-muted': '#7b847e',
      },
      boxShadow: {
        panel: '0 1px 2px rgba(23, 32, 29, 0.035), 0 8px 28px rgba(23, 32, 29, 0.025)',
        chart: '0 12px 36px rgba(23, 32, 29, 0.06)',
        tooltip: '0 14px 36px rgba(23, 32, 29, 0.16)',
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
}
