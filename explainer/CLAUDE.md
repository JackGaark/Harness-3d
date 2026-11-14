# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`explainer/` generates a narrated-style video explainer of the paper "Harness Engineering: Anatomy, Architecture, and Evolution of Coding Agents". The output is `../harness-engineering-full-paper.mp4`. The whole video is a page-by-page animation of a LaTeX-looking paper, with words highlighted at reading pace and figures revealed as each passage is read. There are no tests and no linter.

## Commands

Run from `explainer/` with pnpm (`pnpm-lock.yaml`).

- `pnpm dev`: Vite dev server. Opened normally, the page plays in real time (click or Space to pause, Left/Right arrows skip 5s, `?t=<seconds>` starts at an offset).
- `pnpm render`: full render to `../harness-engineering-full-paper.mp4`. Needs `ffmpeg` on PATH and Google Chrome or Chromium in `/Applications`.
- `node render.mjs --stills 3,40`: PNG stills at those seconds into `frames/`. `--stills pages` writes one per page, taken just before its last passage ends. Use this to check layout instead of a full render.

## Architecture

The video is a pure function of time. `engine.js` builds every page into the DOM once, computes a timeline, and exposes `window.seek(t)`, which sets all styles/classes for time `t`. Nothing runs on its own clock except the live-preview `requestAnimationFrame` loop, so renders are deterministic. `render.mjs` serves the page with Vite, loads it with the `#render` hash (which disables the preview loop), then steps `seek(frame / 30)` and screenshots each frame across 5 parallel Chromium workers. Each worker pipes PNGs to its own ffmpeg segment, and the segments are concatenated without re-encoding.

The frame is a fixed 1920x1080 (`VW`/`VH` in `engine.js`, `W`/`H` in `render.mjs`, `#stage` in `style.css`), scaled to the window with a CSS transform. Inside it, each paper page is still laid out at 1200x1680 in `#cam`, and a camera pans and zooms over that page (up to `ZOOM`, 1.6x) so the text being read fills the frame. The header (the seven-subsystem map and section number) and the footer (progress ticks) are a fixed HUD outside the camera.

Camera framing is computed per passage from layout, not authored. A passage is framed together with whatever it reveals or marks that fits beside it at `MINZOOM` or better. Anything further away, typically the figure strip below the columns, gets a second framing: the camera stays on the passage for the highlight sweep, then pans, and those elements' reveals are delayed until it arrives (which lengthens the passage). So moving a figure between the right column and the strip changes both framing and timing.

### Content, timing, and figures

- `pages.js` is the content: an exported `PAGES` array of `{ n, title, paras, figs, band }` (plus `kind: 'title'|'end'` variants, `hold`, and a `RECS` const). `paras` are the left-column passages; a passage beginning `O<n>:` is typeset as the paper's framed "Observation" box. System names are auto small-capped in `engine.js` via the `SYSTEMS` regex, so add new system names there.
- `figures.js` holds string-returning helpers (`B` box, `A`/`PA` arrows, `T` text, `fig`, `bar`, `chips`, `table`, `code`, `ribbon`, `rider`, ...) that emit HTML/SVG markup. Figures are plain strings, not DOM.
- Passages drive the timeline. Each passage's duration is `max(3.6s, words / RATE + HOLD, last element's delay + 1.2)`, and a page's length is the sum of its passages plus intro/outro. There are no absolute timestamps: edit text and the timing follows.
- Reveal timing is declarative through attributes: `data-at="<passage index>"` reveals an element when that passage starts, `data-d` adds a delay in seconds, `data-dur` sets duration, `data-anim` selects `grow` / `draw` / `travel` (with `data-path` naming a path id) instead of the default fade. `data-stagger` on a parent spreads its children's reveals. The `at(i, d)` helper from `figures.js` produces the first two.
- `data-focus="0,2"` and `data-cur="1"` toggle `.focus` / `.cur` classes on an element while the listed passages are active, which is how captions and figure parts get marked as the text is read. `fig(..., { at, cur })` wires this up.
- `engine.js` post-processes the DOM after building: tables and figures without their own `data-at` inherit the reveal time of their earliest child, and figure numbers (`.fn`) are assigned sequentially across the whole document, so never hardcode "Fig. N".
- SVG markers `#ar` / `#arr` (black/red arrowheads) live in `index.html` and are referenced by the arrow helpers.

`frames/` and `dist/` are gitignored scratch output.
