export default function InfoIcon({ text }) {
  return (
    <span className="relative inline-flex group/info align-middle">
      <button
        type="button"
        tabIndex={0}
        aria-label="More information"
        className="inline-flex items-center justify-center h-4 w-4 rounded-full text-slate hover:text-ink focus:text-ink outline-none"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path
            fillRule="evenodd"
            d="M18 10A8 8 0 11 2 10a8 8 0 0116 0zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm.5 3a.75.75 0 000 1.5h1a.75.75 0 000-1.5h-.25v-2a.75.75 0 00-.75-.75h-.5a.75.75 0 000 1.5v1.25h.5z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 bottom-full z-20 mb-1.5 w-56 -translate-x-1/2 rounded-lg bg-surface-strong px-2.5 py-1.5 text-xs leading-snug text-on-surface-strong opacity-0 shadow-lg transition-opacity duration-100 group-hover/info:opacity-100 group-focus-within/info:opacity-100"
      >
        {text}
      </span>
    </span>
  )
}
