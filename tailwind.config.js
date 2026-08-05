/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // C-MORE brand tokens. offwhite/surface/ink/slate/line/accent read
        // CSS custom properties (src/index.css) so the same class names
        // swap value per theme — including the accent role swap (Deep Blue
        // in light mode, Lime in dark mode) — without dark: duplication.
        offwhite: 'var(--bg)',
        surface: 'var(--surface)',
        ink: 'var(--ink)',
        slate: 'var(--slate)',
        line: 'var(--border)',
        accent: 'rgb(var(--accent-rgb) / <alpha-value>)',
        accentContrast: 'var(--accent-contrast)',
        // Static tokens for spots that need the literal brand color
        // regardless of theme (e.g. the brand mark).
        deepblue: '#141A32',
        lime: '#C0FA00',
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
