---
name: granate-sage
description: Granate/Sage brand system (Andrea Carrascosa's personal brand) for PurePastures tools. Invoke for any UI or visual work. Replaces the retired placeholder "C-MORE" brand.
---

# Granate/Sage Brand System

The full source file is `SOURCE-brand-system.md` in this folder — read it
for complete detail (palette, type, shape/space, voice, logo, drop-in
tokens, the contrast-check script). This file covers what's specific to
*this tool's* implementation: where the source file doesn't define
something this tool needs, and what was decided to fill the gap.

**Do not re-apply the old C-MORE brand** (Deep Blue `#141A32` / Lime
`#C0FA00` / Figtree) — it was never an official brand file, just a
stand-in, and has been fully replaced (see `DECISIONS.md`).

## Where it's implemented

- Color/font/radius tokens: `src/index.css` (`:root` / `:root[data-theme='dark']`
  CSS custom properties + the `@theme` block — Tailwind v4 CSS-first config,
  no `tailwind.config.js`)
- Theme toggle: `src/lib/theme.js` — sets `data-theme="light"|"dark"` on
  `<html>`, per the brand doc's own convention (not a `.dark` class)
- Fonts: self-hosted via `@fontsource/source-serif-4` (600, headings) and
  `@fontsource/source-sans-3` (400/600, body) — imported in `src/main.jsx`.
  Never a Google Fonts `<link>`.
- Reusable component classes (`.btn-primary`, `.btn-accent`, `.btn-ghost`,
  `.field-input`, `.card`, `.label`): `src/index.css`

## Gaps the source file doesn't cover, and what this tool decided

- **Secondary text tiers:** the source splits `text-muted` (sage-dark) from
  `text-meta` (warm-grey). This tool collapses both into one `slate` token
  (mapped to the sage-dark value) — confirmed by the builder, since every
  component here only ever had one secondary-text tier.
- **success/warning/danger:** not in the source file at all, but needed for
  confidence swatches and validation-status pills (ported from Tool B).
  Derived candidates, contrast-checked with the source file's own script —
  see `DECISIONS.md` for the exact values and ratios. **Pending final
  visual sign-off** — these are a confident proposal, not yet a confirmed
  brand addition the way the rest of this file is.
- **Corner radius:** the source specifies 7px everywhere; this tool's
  `.card` previously used 14px (from the old C-MORE brand) — confirmed
  changed to 7px.
- **A second button color:** the old brand had a lime-filled secondary
  button (`.btn-accent`). The new brand is explicit that Granate is "the
  only action colour" — no second filled color exists. `.btn-accent` now
  means a bordered/outlined treatment (granate text, no fill) instead, used
  for lower-emphasis actions like CSV exports.

## Hard rules that hold even if this skill isn't loaded

- Background: `#F7F5F2` (light) / `#161513` (dark) — never white or
  Tailwind gray defaults.
- Action/identification colour: Granate `#7A1F2B` in light mode, a
  lightened Granate `#D4717F` in dark mode — the **only** action colour;
  never a second filled-button colour, never Tailwind's default blue.
- Sage `#8A9A7B` is decorative only — lines, icons, section backgrounds.
  Never text, never a button fill.
- Fonts: Source Serif 4 (600, headings), Source Sans 3 (400/600, body) —
  both self-hosted via `@fontsource`, never a Google Fonts CDN link.
- One radius everywhere: 7px (pills/avatars excepted).
- A light/dark toggle in the top bar is required, not optional; dark mode
  applies via `data-theme="dark"` on `<html>`, not a class.
