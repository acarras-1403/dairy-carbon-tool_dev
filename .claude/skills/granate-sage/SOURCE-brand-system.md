# Brand system — Andrea Carrascosa

A portable version of the brand, ready to drop into another project. Everything
here was used and contrast-measured in the LCA Studio build (November 2026).

Two kinds of content are mixed below and they are marked, because they carry
different authority:

- **Approved** — from the brand guidelines. Do not change without asking.
- **Derived** — worked out during the LCA Studio build and approved by the
  builder for that tool. Reusable, but a new tool should confirm it rather than
  assume it.

Every colour pair marked with a ratio was measured against WCAG 2.1 relative
luminance. The script that does it is at the end, so another build can check its
own additions instead of guessing.

---

## 1. Palette

### Core — approved

| Token | Hex | Use | On `#F7F5F2` |
|---|---|---|---|
| Granate | `#7A1F2B` | **The only action colour.** Buttons, links, active states, headings | 9.4:1 |
| Granate dark | `#5C1520` | Hover and active | 12.2:1 |
| Sage | `#8A9A7B` | Decorative accents only: lines, icons, details. **Never text, never buttons** | 2.8:1 — fails text, by design |
| Sage dark | `#5E6E52` | Secondary text and labels | 5.0:1 |
| Sage light | `#E6EBE1` | Card and section backgrounds | — |
| Background | `#F7F5F2` | Warm off-white page ground | — |
| Ink | `#1F1D1B` | Main text | 15.4:1 |
| Warm grey | `#6B6560` | Auxiliary text, captions, metadata | 5.3:1 |

Primary button: granate background, white text — 10.2:1.

### Dark mode — derived

Not in the original guidelines. Built from the same palette: ink-based ground,
off-white text, granate lightened enough to stay an action colour. Every text
pair measures 4.5:1 or better.

| Role | Light | Dark | Dark contrast |
|---|---|---|---|
| Page ground | `#F7F5F2` | `#161513` | — |
| Card surface | `#FFFFFF` | `#221F1D` | — |
| Alt surface | `#E6EBE1` | `#2B2724` | — |
| Main text | `#1F1D1B` | `#F2EFEA` | 12.9–15.9:1 |
| Secondary text | `#5E6E52` | `#C3CDB6` | 9.0–11.1:1 |
| Metadata | `#6B6560` | `#ADA6A0` | 6.2–7.6:1 |
| Action | `#7A1F2B` | `#D4717F` | 4.6–5.6:1 |
| Action hover | `#5C1520` | `#E08A96` | — |
| Text on action | `#FFFFFF` | `#1F1D1B` | 5.2:1 |
| Hairline | `#D9D4CC` | `#3A3633` | — |
| Accent | `#8A9A7B` | `#8A9A7B` | unchanged |

### Categorical scale — derived

For anything with a handful of named categories: life cycle stages, processes,
phases, segments of a chart. The hue runs granate to sage, and **lightness
increases strictly across the five**, so they stay apart in greyscale, in
print, and for colour-blind viewers. Each has a foreground measured on its own
fill.

| # | Light fill | On it | Ratio | Dark fill | On it | Ratio |
|---|---|---|---|---|---|---|
| 1 | `#7A1F2B` | `#FFFFFF` | 10.2:1 | `#D4717F` | `#1F1D1B` | 5.2:1 |
| 2 | `#944229` | `#FFFFFF` | 6.8:1 | `#D08A5E` | `#1F1D1B` | 6.0:1 |
| 3 | `#9F5F2E` | `#FFFFFF` | 5.1:1 | `#C9A05A` | `#1F1D1B` | 6.9:1 |
| 4 | `#B59345` | `#1F1D1B` | 5.8:1 | `#B4BE72` | `#1F1D1B` | 8.4:1 |
| 5 | `#A7BF6F` | `#1F1D1B` | 8.3:1 | `#CBD6A5` | `#1F1D1B` | 11.0:1 |

Rules that came out of using it:

- One category keeps one colour **everywhere** — the chart, the bars, the table
  chip, the filter tab. Colour that means something is worth the ink; colour
  that decorates is not.
- Light fills 3, 4 and 5 are too light to use as *text* on the page ground
  (3.6:1, 2.4:1, 3.4:1). Use them as fills only; label them in ink or warm grey.
- Beyond five categories, cycle. Do not invent a sixth hue.

### Three-level ramp — derived

For an ordered scale with few steps, such as data quality
(measured / calculated / estimated). One hue, three strengths — never three
hues, because the order is the message.

| Level | Light fill | On it | Dark fill | On it |
|---|---|---|---|---|
| Strongest | `#7A1F2B` | `#FFFFFF` | `#D4717F` | `#1F1D1B` |
| Middle | `#B7C0A6` | `#1F1D1B` | `#9AAB84` | `#1F1D1B` |
| Weakest | `#F3F5EF` (line `#C6CDBC`) | `#1F1D1B` | `#3A3633` (line `#4A4540`) | `#F2EFEA` |

### Continuous ramp and "no data" — derived

| Role | Light | Dark |
|---|---|---|
| Ramp low | `#E6EBE1` | `#343F2E` |
| Ramp high | `#7A1F2B` | `#D4717F` |
| No data fill | `#CFCAC2` | `#3A3633` |
| No data text | `#4A4540` | `#C8C2BA` |

**A legibility caveat worth carrying over.** A straight linear interpolation
across that ramp puts some mid values at a luminance where neither white nor
ink reaches 4.5:1 — roughly 0.18 to 0.25 relative luminance. Either bend the
ramp (`t ** 0.8` pushes mid-tones darker and clears the gap) or put the label
outside the fill. Do not ship a label that sits in the dead band.

---

## 2. Type

**Approved.** Headings Source Serif 4, weight 600. Body Source Sans 3, weights
400 and 600. Both **self-hosted** — never the Google Fonts CDN. Base body
17–18px, line height 1.6, text columns capped near 70 characters.

Derived, from building with it:

- Install through `@fontsource/source-serif-4` and `@fontsource/source-sans-3`
  and import the exact weights. That is self-hosting; a `<link>` to
  fonts.googleapis.com is not.
- Both fonts ship superscript glyphs for 1, 2 and 3 only. If you print
  scientific notation (`3.34 × 10⁻⁵`), the rest are missing and the exponent
  silently disappears in an embedded PDF. Synthesise them as scaled, raised
  copies of the normal digits when subsetting. There is a fontTools script that
  does it in this repo at `scripts/build-pdf-fonts.py`.
- Headings in granate, body in ink, metadata in warm grey.

---

## 3. Shape, space and interaction

**Approved.** Corners 6–8px on cards and buttons. Generous white space. No
gradients, no strong shadows, no flashy animation. Simple line icons in granate
or sage dark. No stock "sustainability" imagery.

**Derived.**

- One radius everywhere: **7px**. Pills and avatars are the exception.
- Hairline borders carry structure instead of shadow: 1px in `--line`.
- Touch targets **44px minimum** on anything tappable.
- Focus is always visible: 2px granate outline, 2px offset.
- Tables scroll inside their own box on narrow screens; they never widen the
  page. Below the medium breakpoint, a table becomes a list of cards.
- Data visuals carry a text label as well as colour. Colour alone is never the
  only way to read a value.

---

## 4. Voice

**Approved.** Direct and concrete: data, standards and results before
adjectives. British English and Spain Spanish with *tú*. Figures always state
their basis. No marketing filler.

**One conflict that will come up again.** The guidelines ban the middle dot
`·` as a separator in interface copy, but specs often ask for
`sheet · row · column · reason` style strings. Resolve it with structure, not
punctuation: a four-column table beats a delimited string. Where a single line
is unavoidable, use an em dash.

---

## 5. Logo

**Approved.** The name "Andrea Carrascosa" in granate, as a PNG. Tree-ring icon
in granate and sage, used as favicon and small graphic element. Clear space
equal to the height of the "A". Granate on light grounds, white on granate.
Never distort, recolour outside the palette, or add effects.

If the files are not in the repo, set the name as a text wordmark in Source
Serif 4 600, granate. **Do not recreate or imitate the icon.**

---

## 6. Drop-in tokens

```css
:root {
  --body: #F7F5F2;
  --surface: #FFFFFF;
  --surface-alt: #E6EBE1;
  --text-main: #1F1D1B;
  --text-muted: #5E6E52;
  --text-meta: #6B6560;
  --action: #7A1F2B;
  --action-hover: #5C1520;
  --action-fg: #FFFFFF;
  --line: #D9D4CC;
  --accent: #8A9A7B;
  --heat-low: #E6EBE1;
  --heat-high: #7A1F2B;
  --nodata: #CFCAC2;
  --nodata-fg: #4A4540;
  --stage-1: #7A1F2B; --stage-fg-1: #FFFFFF;
  --stage-2: #944229; --stage-fg-2: #FFFFFF;
  --stage-3: #9F5F2E; --stage-fg-3: #FFFFFF;
  --stage-4: #B59345; --stage-fg-4: #1F1D1B;
  --stage-5: #A7BF6F; --stage-fg-5: #1F1D1B;
  --q-measured: #7A1F2B;   --q-measured-fg: #FFFFFF;
  --q-calculated: #B7C0A6; --q-calculated-fg: #1F1D1B;
  --q-estimated: #F3F5EF;  --q-estimated-fg: #1F1D1B;
  --q-estimated-line: #C6CDBC;
}

[data-theme='dark'] {
  --body: #161513;
  --surface: #221F1D;
  --surface-alt: #2B2724;
  --text-main: #F2EFEA;
  --text-muted: #C3CDB6;
  --text-meta: #ADA6A0;
  --action: #D4717F;
  --action-hover: #E08A96;
  --action-fg: #1F1D1B;
  --line: #3A3633;
  --accent: #8A9A7B;
  --heat-low: #343F2E;
  --heat-high: #D4717F;
  --nodata: #3A3633;
  --nodata-fg: #C8C2BA;
  --stage-1: #D4717F; --stage-fg-1: #1F1D1B;
  --stage-2: #D08A5E; --stage-fg-2: #1F1D1B;
  --stage-3: #C9A05A; --stage-fg-3: #1F1D1B;
  --stage-4: #B4BE72; --stage-fg-4: #1F1D1B;
  --stage-5: #CBD6A5; --stage-fg-5: #1F1D1B;
  --q-measured: #D4717F;   --q-measured-fg: #1F1D1B;
  --q-calculated: #9AAB84; --q-calculated-fg: #1F1D1B;
  --q-estimated: #3A3633;  --q-estimated-fg: #F2EFEA;
  --q-estimated-line: #4A4540;
}
```

Tailwind, if the next project uses it:

```js
// tailwind.config.js
darkMode: ['class', '[data-theme="dark"]'],
theme: { extend: { colors: {
  granate: { DEFAULT: '#7A1F2B', dark: '#5C1520' },
  sage: { DEFAULT: '#8A9A7B', dark: '#5E6E52', light: '#E6EBE1' },
  canvas: '#F7F5F2', ink: '#1F1D1B', warmgrey: '#6B6560',
  surface: 'var(--surface)', 'surface-alt': 'var(--surface-alt)',
  body: 'var(--body)', 'text-main': 'var(--text-main)',
  'text-muted': 'var(--text-muted)', 'text-meta': 'var(--text-meta)',
  action: 'var(--action)', 'action-hover': 'var(--action-hover)',
  'action-fg': 'var(--action-fg)', line: 'var(--line)', accent: 'var(--accent)',
},
fontFamily: {
  serif: ['"Source Serif 4"', 'Georgia', 'serif'],
  sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
},
borderRadius: { brand: '7px' },
maxWidth: { prose: '70ch' } } }
```

Never use Tailwind's default blue or gray.

---

## 7. Checking a new colour

Any colour added to this system has to pass before it ships. Text and its
background need 4.5:1; a categorical set also needs its lightness to keep
increasing, so it survives greyscale.

```python
def lin(c):
    c = c / 255
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

def luminance(hexcolour):
    h = hexcolour.lstrip('#')
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)

def contrast(a, b):
    la, lb = luminance(a), luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)

# contrast('#7A1F2B', '#F7F5F2') -> 9.38
```

A fill between roughly 0.18 and 0.25 luminance has no passing label in either
white or ink. Move the fill rather than accept 4.3:1.

---

**Last updated:** 20 November 2026, from the LCA Studio build
(`acarras-1403/LCA-Studio`). The approved sections come from the builder's brand
guidelines; the derived sections were approved for that tool on 18 November 2026.
