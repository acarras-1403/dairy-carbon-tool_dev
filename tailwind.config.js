/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // C-MORE brand tokens
        offwhite: '#FAFAFA',
        deepblue: '#141A32',
        lime: '#C0FA00',
        ink: '#1F2333',
        slate: '#5B6072',
        line: '#E6E7EC',
      },
      fontFamily: {
        sans: ['Figtree', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '14px',
      },
    },
  },
  plugins: [],
}
