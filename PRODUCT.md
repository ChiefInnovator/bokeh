# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three audiences, confirmed by the owner:

- **Ambient display:** people putting the page fullscreen on a TV, spare monitor, or kiosk as background ambiance for parties, holidays, or offices. They open the settings panel briefly, then hide it.
- **Personal screensaver:** individuals running it on their own laptop or desktop as a relaxing visual, adjusting settings more often.
- **Showcase visitors:** people arriving from a shared link or Richard Crane's portfolio, for whom the first few seconds are the whole impression.

## Product Purpose

A free, no-install bokeh screensaver that runs in any modern browser. Success is a calm, photographic-looking light field that someone leaves running, and a shared link that opens exactly the look the sender set up.

## Positioning

Photographic-looking bokeh (soft radial light, additive blending, shimmer) over blurred real scenes, configured in seconds and shared as a single URL that encodes every setting. No account, no download, no build step.

## Operating Context

- Usually viewed fullscreen; the UI auto-hides after 2 seconds idle in fullscreen.
- Opened from shared deep links (`?s=`), which start with the panel hidden.
- Used on desktop, tablets, and phones; mobile defaults to fewer particles.
- Served by GitHub Pages from `main` at https://chiefinnovator.github.io/bokeh/.

## Capabilities and Constraints

- Controls: particle count (50–1000), size (0.5–2.0x), speed (0.1–3.0x), brightness (20–200%), drift toggle, reset to defaults.
- 33 themes in six categories (Seasonal, Holiday, Nature, Countries/Flags, Comics, Mood/Futuristic); 21 backgrounds (none, seasonal gradients, dark solid colors, scenic photos; White and Yellow were removed because additive light washes out on light backgrounds).
- Deep link copies the full configuration to the clipboard.
- Technical constraints: plain HTML, CSS, and vanilla JavaScript; no framework, bundler, or dependencies; one page.
- `movies/` holds unused MP4s reserved for a future video-background feature; keep it.
- Engineering plan of record: [docs/designs/bokeh_screensaver.md](docs/designs/bokeh_screensaver.md).

## Brand Commitments

- Name: "Bokeh Screensaver". Author: Richard Crane.
- The scenic photos (Boston, Groton MA, Crane's General Store, Hanukkah menorahs, Christmas forest) are personal but replaceable; design work may swap or reduce them.

## Evidence on Hand

- Scenic and gradient backgrounds in `backgrounds/`.
- Link-preview image `og-image.jpg` (Valentine theme).
- No testimonials, usage numbers, or press exist; do not invent them.

## Product Principles

1. The light field is the product; the interface recedes until called.
2. A shared link must reproduce the sender's look exactly.
3. Calm over spectacle: motion stays slow and soft, and respects reduced-motion settings.
4. Zero friction: no install, no account, works on any modern browser.

## Accessibility & Inclusion

- Every panel control usable by keyboard with visible focus and accessible names.
- `prefers-reduced-motion`: shimmer at 25% speed, drift off, near-instant UI transitions (owner decision, 2026-11-02).
