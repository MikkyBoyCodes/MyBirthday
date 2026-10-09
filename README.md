# Michael Birthday 2026

A mature, cinematic birthday experience for Michael, built around his 2026 Software Engineering graduation, his story from childhood to now, his people, music, and an interactive candle wish.

## Stack
- React 19
- Vite 7
- Tailwind CSS 4 (CSS-first via `@tailwindcss/vite`)
- Lucide React icons
- CSS animation system with separate, readable component style files

## Run
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```

## Images
Place the following `.jpeg` files in `public/images/`:
- `toddler.jpeg`
- `michael.jpeg`
- `graduation.jpeg`
- `parents.jpeg`
- `derek.jpeg`
- `fabian.jpeg`

The UI keeps graceful placeholders when a photo has not been supplied.

## Music
The first playlist track attempts to start automatically after a deliberate opening delay. Modern browsers may block audible autoplay until the visitor interacts with the page; if that happens, the player remains ready and the user can press play once.

Tracks advance automatically when one ends, and the user can pause, resume, or switch tracks at any time. The current title and saved filename remain visible in the player/playlist. The playlist has no upload feature.

Put the matching local MP3 files in `public/music/` and edit `src/data/playlist.js` when the actual filenames/titles are known.

## Experience
Navigation: **Birthday · Chapter · Me · My People · Wish**, using restrained outline icons. Navigation uses measured viewport offsets so a selected section is positioned below the fixed header instead of landing too high.

Chapter's code-writing sequence starts only after the Chapter section is genuinely in view. Leaving and returning to Chapter runs the sequence again. The same intentional viewport-triggered reveal behavior is used for important story cards.

The Wish experience preserves the existing cake artwork. The cake only performs its entrance sequence after the cake experience is genuinely focused in the viewport. If the user leaves before completing the wish and returns, the entrance/candle-lighting sequence starts again. After all candles have been blown out, that completed state remains for the page session; returning to the section does not relight the candles. A page refresh resets it.

The cake arrives with a stronger physical entrance and a short synthesized pop/impact sound, then lights its candles one by one before showing `MAKE A WISH.`. During each blow, every surviving flame reacts to the same directional airflow. Wind-facing candles are affected most strongly and can extinguish first, while candles behind them bend and flicker in the same airflow even when they survive. Extinguished candles produce separate, varied smoke trails. The sequence ends with `WISH MADE.`

## Styling organization
CSS is intentionally spaced and grouped by purpose. Cake entrance/candles/smoke, navigation, Chapter, My People, photography, music, global animation, typography, and responsive rules are kept readable and easy to locate. Google Fonts are loaded in `index.html` rather than from a CSS `@import` placed after other statements.

## Responsive targets
The layout is written around viewport behavior rather than a single device. It includes small phones, iPhone-class 390px and 428px widths, common Android/Redmi/Tecno widths, tablets, short-height viewports, safe-area insets, and desktop widths. Sections recompose instead of simply shrinking the desktop layout.

### October 8 correction pass
- Restored the reliable cake reveal trigger so the existing cake artwork is visible and can perform its heavier pop/arrival animation when the cake experience enters the viewport.
- Preserved the existing cake artwork and candle interaction; this pass does not redesign the cake.
- My People now targets the actual family heading rather than the padded container, so navigation lands on the content itself.
- Family cards use a lighter viewport threshold so they begin their reveal without requiring an extra manual scroll.
- Navigation icons were simplified to familiar, restrained symbols: cake, graduation cap, person, people, and heart.

