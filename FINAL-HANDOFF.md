# Michael Birthday 2026 — Final Refinement Handoff

This package is a refinement of the existing birthday master, not a rebuild from scratch.

## Locked experience

- Preserve the existing cake artwork/design.
- Cake entrance is viewport-focused, with a stronger physical arrival, subtle impact/pop sound, settle, then candle-by-candle ignition.
- `MAKE A WISH.` appears only after all candles have ignited.
- If the user leaves before completing the wish, returning to the focused cake section restarts the entrance and candle-lighting sequence.
- After all candles are blown out, the completed cake state persists for the page session. Returning to the section does not relight it. Refreshing the page resets it.
- During a blow, all surviving flames react to the same directional breeze. Wind-facing candles are affected more strongly and may extinguish first; candles behind them still bend/flicker even when they survive.
- Extinguished candles receive individual, varied smoke trails.
- Final state displays `WISH MADE.`.

## Music

- First playlist track attempts delayed automatic playback after the site opens.
- Browser autoplay restrictions are handled gracefully; a manual play action remains available when needed.
- Tracks advance automatically when a song ends.
- Users can pause/play and change tracks at any time.
- Current song title and saved filename remain visible.
- Playlist can be opened and explicitly hidden.
- No user song-upload feature.
- Compact player includes a restrained music-reactive visualizer while playing.

## Navigation and viewport behavior

- Navigation includes Birthday, Chapter, Me, My People, and Wish with restrained outline icons.
- Navigation uses a measured fixed-header offset so section jumps land correctly.
- Chapter code-writing starts only after the section is genuinely focused in the viewport.
- Leaving and returning to Chapter starts the code-writing sequence again.
- Important story-card reveals also reset when they leave/re-enter the meaningful viewport.

## Typography and CSS

- Mature editorial typography uses DM Serif Display with Manrope support text.
- Text effects are restrained so words do not collide or create accidental visual extensions.
- CSS is spaced and grouped by purpose; no compressed one-line rule blocks were intentionally added.
- Cake, music, navigation, Chapter, photography/My People, typography, global animation, and responsive styling remain in clear files.

## Images

Expected image extension is `.jpeg` for toddler, current portrait, graduation, parents, Derek, and Fabian images.

## Dependency note

`node_modules` is intentionally excluded. The source package contains the project lockfile; run `npm install` before `npm run dev` on the target machine. The build could not be re-verified in the generation environment because the dependency registry/cache was unavailable, so this handoff does not claim a successful production build.

### October 8 correction pass
- Restored the reliable cake reveal trigger so the existing cake artwork is visible and can perform its heavier pop/arrival animation when the cake experience enters the viewport.
- Preserved the existing cake artwork and candle interaction; this pass does not redesign the cake.
- My People now targets the actual family heading rather than the padded container, so navigation lands on the content itself.
- Family cards use a lighter viewport threshold so they begin their reveal without requiring an extra manual scroll.
- Navigation icons were simplified to familiar, restrained symbols: cake, graduation cap, person, people, and heart.

