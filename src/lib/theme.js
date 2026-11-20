// Light/dark theme — persisted to localStorage, falls back to the OS
// preference on first visit. Applies by setting `data-theme` on <html>
// (brand-system.md's convention); every color token in src/index.css reads
// a CSS variable that swaps off that attribute, so this is the single place
// theme state lives.
const STORAGE_KEY = 'purepastures-theme'

export function getInitialTheme() {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  window.localStorage.setItem(STORAGE_KEY, theme)
}
