// Light/dark theme (spec v7.0 Section 8/10) — persisted to localStorage,
// falls back to the OS preference on first visit. Applies by toggling the
// `dark` class on <html>; every color token in tailwind.config.js/index.css
// reads a CSS variable that swaps off that class, so this is the single
// place theme state lives.
const STORAGE_KEY = 'purepastures-theme'

export function getInitialTheme() {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  window.localStorage.setItem(STORAGE_KEY, theme)
}
