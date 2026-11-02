# Bokeh Screensaver: Architecture and Hardening Plan

*   **Author:** Richard Crane (ChiefInnovator)
*   **Status:** Approved (revised after EGM Goldfish review, see
    [reviews/consolidated_review_report.md](reviews/consolidated_review_report.md))
*   **Date:** 2026-11-02

--------------------------------------------------------------------------------

## Overview

Bokeh Screensaver is a single static web page that draws soft, shimmering
circles of light ("bokeh") on an HTML5 canvas over an optional blurred
background photo. GitHub Pages serves it from the `main` branch at
<https://chiefinnovator.github.io/bokeh/>. There is no build step, no framework,
and no server code. All behavior lives in `index.html`, `js/app.js`, and
`css/style.css`. Static assets live in `backgrounds/`, and SEO files
(`robots.txt`, `sitemap.xml`, `llms.txt`, `og-image.jpg`) sit at the root.

This document records how the app works today and specifies four fixes: wrong
shared links, unchecked shared-link input, keyboard and screen-reader gaps, and
a scene reset on every window resize.

## The Problem

1.  **Shared links can be wrong (P1).** The "Copy Deep Link" button copies a
    cached URL. `init()` schedules a cache rebuild 500 ms later. Changing the
    background, brightness, or drift does not call `init()`, so the copied link
    carries old values for those settings. Even when `init()` runs, a click
    inside the 500 ms window, or while gzip compression is still running,
    copies the previous link.
2.  **Shared-link input is not checked (P2).** `applyStatePayload()` assigns
    numeric fields from the link directly to state. A link with
    `particleCount: 1000000` allocates a million particles and stalls the tab.
    `themes[state.theme]` also accepts inherited keys such as `constructor`.
    A payload that is not an object (`null`, `0`, `"x"`) returns early without
    calling `init()`, so the page shows no particles. The `s` parameter has no
    length limit, so a small gzip payload can expand to a very large string.
3.  **Keyboard and screen-reader gaps (P3).**
    *   Section headers ("Settings", "Theme", "Background") are `<h4>` elements
        with click handlers. Keyboard users cannot toggle them, and screen
        readers do not announce them as controls.
    *   The panel close button (`×`) has no accessible name.
    *   The hidden panel is only moved off-screen with a CSS transform. Its
        controls stay in the Tab order. The same is true for collapsed
        sections.
    *   The global `Enter` handler toggles fullscreen even when focus is on a
        button, so Enter on a theme button selects it and toggles fullscreen.
    *   In fullscreen the UI fades after 2 seconds and only mouse or touch
        input brings it back. Keyboard users tab through invisible controls.
    *   Range inputs set `outline: none` on focus. Other controls rely on the
        browser default ring, which is hard to see on the dark glass panel.
    *   The copy-result toast is not announced to screen readers.
    *   The app ignores `prefers-reduced-motion`.
4.  **Gzip links fail to open (P5, found during implementation).**
    `decompressToString()` awaits `writer.write()` before reading the
    `DecompressionStream` output. The write waits on the unread side, so
    decoding hangs or throws and every gzip link created by the current
    `main` build opens with defaults. Fix: pipe a `Blob` stream through the
    decompressor and read it with `Response.text()`.
5.  **Resize resets the scene (P4).** Every `resize` event calls `init()`,
    which re-randomizes all particles. On phones the address bar showing and
    hiding fires `resize`, so the scene jumps while the user scrolls or
    rotates.

## Goals

*   **G1 (P1):** The copied link always encodes the state visible at the moment
    of the click: theme, background, particle count, size, speed, brightness,
    and drift.
*   **G2 (P2):** Link values are clamped to the slider ranges (count 50–1000
    step 10, size 0.5–2.0 step 0.1, speed 0.1–3.0 step 0.1, brightness
    20–200 step 10). Unknown theme or background IDs are ignored. Malformed or
    oversized (`s` longer than 2,048 characters) links load the defaults. The
    page always renders particles.
*   **G3 (P3):** Every panel control can be reached and operated by keyboard,
    has an accessible name, and shows a visible focus ring. Hidden or collapsed
    controls are not in the Tab order. Any key press shows the faded UI. The
    copy result is announced.
*   **G4 (P3):** With `prefers-reduced-motion: reduce`, shimmer runs at 25%
    speed, drift is off, and UI transitions are near-instant. The setting is
    applied live without re-randomizing the scene.
*   **G5 (P4):** Resizing keeps every particle's position, color, and phase,
    unless the canvas area grows by more than 25% or the orientation flips, in
    which case the scene is regenerated to fill the new space.
*   **G6:** Every link whose values are inside the slider ranges and whose IDs
    exist opens with the same settings as before this change, including
    gzip-compressed links.

## Non-Goals

*   New themes, backgrounds, or features such as video backgrounds, a Screen
    Wake Lock toggle, or a fullscreen button.
*   Rendering-performance work (sprite caching, WebGL, `devicePixelRatio`).
    See Future Improvements.
*   Correcting animation speed for 120 Hz displays.
*   Framework, bundler, TypeScript, or dependency changes.
*   Hosting changes, or changes to SEO and structured-data metadata.
*   A visual redesign of the panel. The Impeccable design pass (a separate
    critique of visual design using the `impeccable` skill, recorded in
    `PRODUCT.md` and `DESIGN.md`) handles that.
*   Deleting `movies/`. The owner keeps it for a future video-background
    feature.

## Open Questions

None. Decisions taken during review:

*   Reduced motion means 25% shimmer speed with drift off, not a static frame.
*   `movies/` stays.
*   Sprite caching is deferred until a profile shows a missed frame-rate target.

## Critical User Journeys (CUJs)

### CUJ 1: Share the current look

*   **Given**: The page is open with the default theme.
*   **When**: The user picks the "Hanukkah" theme and the "Hanukkah Menorahs"
    background, sets brightness to 150%, turns drift on, and clicks the link
    button within one second of the last change. The user opens the copied URL
    in a new tab.
*   **Then**: The new tab shows theme Hanukkah, background Hanukkah Menorahs,
    brightness 150%, and drift on.

### CUJ 2: Open a hostile or broken link

*   **Given**: A URL whose `s` decodes to
    `{"particleCount": 5000000, "theme": "constructor", "brightnessPercent": -50, "particleSizeScale": 0.73}`.
*   **When**: The user opens it.
*   **Then**: The count slider shows 1000, theme stays Christmas, brightness
    shows 20%, size shows 0.7, and the tab stays responsive.
*   **And**: For `s=null` (base64url of `null`), `s=!!!`, or an `s` of 3,000
    characters, the page loads with defaults and renders particles.

### CUJ 3: Keyboard-only use

*   **Given**: A user with no mouse, page loaded without a link.
*   **When**: The user presses Tab from page load.
*   **Then**: Focus reaches the link button, then the settings button. Enter
    opens the panel and focus moves to the close button. Tab moves through the
    section toggles, sliders, drift checkbox, reset, theme buttons, and
    background buttons. Each shows a visible ring. Collapsing a section removes
    its controls from the Tab order. Escape closes the panel and focus returns
    to the settings button. Enter on any focused control activates only that
    control. With focus on the page body, Enter or `F` toggles fullscreen. In
    fullscreen, any key shows the UI again.

### CUJ 4: Rotate or scroll on a phone

*   **Given**: A phone with drift off.
*   **When**: The address bar hides and shows, or the phone rotates.
*   **Then**: Address-bar changes do not move or recolor particles. A rotation
    (orientation flip) or a resize that grows the canvas area by more than 25%
    regenerates the scene once.

## Technical Plan (Architecture)

### Current structure

```text
index.html
 ├─ #bg-layer      CSS background-image, blur(2px), vignette ::after
 ├─ #canvas        2D canvas, full window, additive blending ('lighter')
 └─ #ui-layer      pointer-events: none wrapper, fades in fullscreen when idle
     ├─ #copy-deep-link, #settings-btn
     ├─ #toast-notification
     └─ #theme-panel  (Lights / Theme / Background collapsible sections)

js/app.js  (global script, no modules)
 ├─ Static data:   themeCategories, themes (HSL palettes), backgroundImages
 ├─ State (globals): currentTheme, currentBackground, particleCount,
 │                   particleSizeScale, animSpeedScale, brightnessScale,
 │                   driftEnabled
 ├─ Particle       reset() / update() / draw()
 ├─ init()         rebuild particles
 ├─ animate()      requestAnimationFrame loop: clear, update and draw
 ├─ Deep link      on click: buildStatePayload → JSON → base64url → ?s=
 │                 applyDeepLinkFromUrl ← JSON ← optional gunzip (old
 │                 links, output capped) ← base64url (≤ 2,048 chars)
 └─ UI wiring      sliders, theme and background buttons, collapsibles,
                   fullscreen, inactivity auto-hide (2 s, fullscreen only)
```

### Deep-link format

The `s` query parameter holds base64url of either gzip-compressed JSON or plain
JSON. The decoder detects gzip by its first two bytes `1F 8B`. The JSON shape:

```text
{ theme: string, background: string, particleCount: number,
  particleSizeScale: number, animSpeedScale: number,
  brightnessPercent: number (20–200), driftEnabled: boolean }
```

The reader stays unchanged, so old gzip links still open. The writer changes
to plain JSON (Change 1). Plain links are about 260 characters, which is
acceptable for a shared URL.

### Change 1: Build the link at click time (G1)

Delete `cachedDeepLink`, `deepLinkUpdateTimer`, `updateDeepLink()`,
`encodeStateParam()`, and `compressString()`. The copy handler calls a new
`buildDeepLink()`, which runs `buildStatePayload()` and the existing
synchronous `encodeStateParamSync()` and sets `s` on a copy of the current
URL. No cache means no stale window and no race with compression.

### Change 2: Check link input (G2, G6)

*   `applyDeepLinkFromUrl()` ignores `s` when it is longer than 2,048
    characters.
*   `applyStatePayload()` returns `false` unless the payload is a non-null,
    non-array object. `applyDeepLinkFromUrl()` treats `false` as "not applied",
    so `bootstrap()` calls `init()` and particles render.
*   Numeric fields use the range inputs as the clamp. For each field, if the
    value is a finite number, assign it to `input.value`, then read the result
    back with `input.valueAsNumber`. The browser clamps to `min` and `max`
    and snaps to `step`. Non-finite values are skipped, so the default stays.
*   Theme IDs are accepted only if `Object.hasOwn(themes, id)`. Background IDs
    are accepted only if `backgroundImages.some(b => b.id === id)`.

### Change 3: Accessibility (G3, G4)

*   **Section headers:** keep the `<h4>`. Put a
    `<button type="button" class="collapsible-header" aria-expanded="true" aria-controls="…">`
    inside it, holding the label and chevron. The toggle handler finds the
    content by `aria-controls`, flips `aria-expanded`, toggles `collapsed`, and
    sets `inert` on collapsed content.
*   **Panel open and close:** one function `setPanelOpen(open, { focus })`
    toggles `panel-hidden` and `inert` on `#theme-panel`, and `aria-expanded`
    on `#settings-btn`. Focus moves only when `focus` is `true`: to the close
    button on open, to the settings button on close. The settings button,
    close button, and Escape key pass `focus: true`. Canvas clicks and
    deep-link load pass `false`. `#theme-panel` starts with `inert` in the
    HTML.
*   **Names:** `#close-btn` gets `aria-label="Close settings"`.
    `#settings-btn` changes its label to "Settings", with `aria-expanded` and
    `aria-controls="theme-panel"`.
*   **Enter key:** the global handler ignores events whose target matches
    `button, input, select, textarea, a[href], [contenteditable]`. It also
    toggles fullscreen on `f` or `F` under the same rule.
*   **Idle fade:** `keydown` also resets the inactivity timer.
*   **Focus ring:**
    `:is(button, input):focus-visible { outline: 2px solid rgba(255,255,255,0.9); outline-offset: 2px; }`.
    Remove `outline: none` from range inputs.
*   **Toast:** add `role="status"`. `showCopyStatus()` clears the text before
    setting it, so a repeat message is announced again.
*   **Reduced motion:** a module-level `reducedMotion` flag reads
    `matchMedia('(prefers-reduced-motion: reduce)')` and updates on its
    `change` event. `Particle.update()` advances phase by
    `this.speed * (reducedMotion ? 0.25 : 1)` and skips drift movement when
    `reducedMotion` is true. Nothing is re-randomized. CSS adds a
    `@media (prefers-reduced-motion: reduce)` block setting
    `transition-duration: 0.01ms` on all elements.

### Change 4: Keep the scene on resize (G5)

`resize()` saves the old width and height, then sets the new canvas size. If
the old size was 0, the orientation flipped (landscape to portrait or back), or
the new area is more than 1.25 times the old area, it calls `init()`. Otherwise
every particle keeps its position unchanged; particles now outside the canvas
are clipped until the canvas grows back. Setting the canvas
size clears it, but the next animation frame redraws everything, so the user
does not see a blank frame.

### Change 5: Small cleanups

*   Theme and background click handlers call `setThemeById()` and
    `setBackgroundById()` instead of duplicating their logic.
*   Delete the unused `.share-row` CSS rule.

## Alternatives Considered

### Alternative A: Keep the cached link and add a generation counter

*   **Pros**: Keeps gzip-compressed, shorter links.
*   **Cons**: Needs a pending flag, a generation counter, and calls from every
    state change. A click during compression still needs a fallback.
*   **Reason for Rejection**: Building at click time is simpler and cannot be
    stale. Plain links are about 260 characters, which is short enough.

### Alternative B: A `LIMITS` table and `clampNumber()` helper

*   **Pros**: Validation does not depend on the DOM.
*   **Cons**: Duplicates ranges already declared on the inputs. The two can
    drift.
*   **Reason for Rejection**: The inputs already clamp and snap. Reading back
    `valueAsNumber` keeps one source of truth.

### Alternative C: Sprite-cached rendering now

*   **Pros**: Removes per-frame gradient and string creation.
*   **Cons**: No profile shows that this is the bottleneck. On phones, pixel
    fill of large translucent circles may dominate, which sprites do not
    reduce. Pixel output changes slightly from resampling.
*   **Reason for Rejection**: Deferred until a profile shows a missed target.

### Alternative D: Store settings in `localStorage` instead of the URL

*   **Pros**: Short URLs; settings survive reloads.
*   **Cons**: Settings could not be shared, which is a listed feature.
*   **Reason for Rejection**: Sharing is the point of the deep link.

## Risks & Mitigations

| Risk | Impact | Mitigation | Verified by |
| --- | --- | --- | --- |
| `inert` unsupported (Safari < 15.5, Firefox < 112) | Hidden panel stays tabbable on old browsers, the same as today | None needed: no worse than current behavior | Manual check in current Chrome and Safari |
| Clamping changes how out-of-range old links render | A hand-edited link with count 2000 now shows 1000 | G6 limits the promise to in-range links; the UI could never create out-of-range values | CUJ 2 |
| Plain-JSON links are longer than gzip links | Links grow from about 150 to about 260 characters | Acceptable for sharing; reader still accepts gzip | CUJ 1 |
| Rotation regenerates the scene | One visible reshuffle per rotation | Only on an orientation flip or when area grows by more than 25% | CUJ 4 |
| `F` key conflicts with typing | None today: the panel has no text fields | Shortcut ignored when focus is in an input | CUJ 3 |

## Non-Functional Requirements

*   **Security & Privacy**: Link input is untrusted. Change 2 bounds its size,
    type, numeric range, and IDs. IDs are only used as lookup keys. No data
    leaves the browser.
*   **Rollout & Rollback**: Ship on a `feature/*` branch, PR into `develop`
    (Copilot reviews automatically), then PR `develop` into `main`, which
    GitHub Pages deploys. Rollback is a revert PR through the same flow.

## Future Improvements

*   **Sprite-cached rendering** (Alternative C), if a Chrome DevTools profile
    at 300 particles on a mid-range Android phone shows under 55 fps.
*   **Screen Wake Lock** while fullscreen, so displays do not sleep.
*   **Smaller backgrounds**: several JPEGs are 2.7–3.6 MB; WebP or AVIF
    variants would cut mobile load time.
*   **Video backgrounds** using `movies/`.

--------------------------------------------------------------------------------

## Detailed Implementation Plan

Phases are ordered so each can be verified on its own. All work lands in one
`feature/*` branch.

### Phase 1: Deep link (Changes 1, 2)

#### `js/app.js` (Modify)

*   Delete `cachedDeepLink`, `deepLinkUpdateTimer`, `updateDeepLink()`,
    `encodeStateParam()`, `compressString()`, the debounce in `init()`, and
    the `updateDeepLink()` call in `bootstrap()`.
*   Add `buildDeepLink()`; the copy handler uses it. On error it falls back to
    `window.location.href`, as today.
*   Add `MAX_STATE_PARAM_LENGTH = 2048`; check it in `applyDeepLinkFromUrl()`
    before decoding.
*   Add `setRangeFromState(input, value)`: returns `input.valueAsNumber` after
    assignment, or `null` when `value` is not a finite number.
*   `applyStatePayload()` returns `false` for non-objects, uses
    `setRangeFromState` for the four numeric fields, `Object.hasOwn` for
    themes, and the `backgroundImages` check for backgrounds. It returns
    `true` after `init()`.
*   `applyDeepLinkFromUrl()` returns the result of `applyStatePayload()`.
*   `decompressToString()` pipes a `Blob` stream through
    `DecompressionStream` instead of awaiting `writer.write()` (P5).

**Checkpoint:** CUJ 1 and CUJ 2 pass; a gzip link created by the current
`main` build opens with identical settings.

### Phase 2: Accessibility (Change 3)

#### `index.html` (Modify)

*   Each `<h4 class="collapsible-header">` becomes `<h4 class="panel-heading">`
    containing
    `<button type="button" class="collapsible-header" aria-expanded="true" aria-controls="…">`
    pointing at `section-settings`, `theme-list`, and `background-list`.
*   The Settings content `div` gets `id="section-settings"`. The other two
    already have ids.
*   `#theme-panel` gets `inert`. `#close-btn` gets `type="button"` and
    `aria-label="Close settings"`. `#settings-btn` gets
    `aria-label="Settings"`, `aria-expanded="false"`, and
    `aria-controls="theme-panel"`. `#toast-notification` gets `role="status"`.

#### `js/app.js` (Modify)

*   Add `setPanelOpen()` and `isPanelOpen()`; replace every direct
    `panel-hidden` toggle (settings button, close button, canvas click,
    Escape, deep-link load).
*   Rewrite `setupCollapsibles()` to use `aria-controls` and set `inert`.
*   Add `INTERACTIVE_SELECTOR` and the Enter/`F` guard. Add `keydown` to the
    inactivity-timer listeners.
*   Add `reducedMotion` with its `change` listener; use it in
    `Particle.update()`.
*   `showCopyStatus()` clears the message first, then sets it on the next
    animation frame.

#### `css/style.css` (Modify)

*   Add `.panel-heading` (reset margins) and button resets for
    `.collapsible-header` (no background, no border, full width, inherit font
    and color) so it looks unchanged.
*   Add the `:focus-visible` rule; remove `input[type=range]:focus { outline:
    none; }`.
*   Add the reduced-motion media block.

**Checkpoint:** CUJ 3 passes; reduced-motion emulation in DevTools slows
shimmer and stops drift without reshuffling.

### Phase 3: Resize and cleanups (Changes 4, 5)

#### `js/app.js` (Modify)

*   Rewrite `resize()` per Change 4.
*   Theme and background click handlers call `setThemeById()` and
    `setBackgroundById()`.

#### `css/style.css` (Modify)

*   Delete `.share-row`.

**Checkpoint:** CUJ 4 passes in DevTools device emulation (toggle height by
60 px; rotate).

### Notes

*   `APP_VERSION` is bumped by the repository's pre-commit hook; do not edit it
    by hand.

### Verification Plan

*   **Static checks**: `node --check js/app.js`.
*   **Local server**: `python3 -m http.server` from the repo root, so the page
    runs over `http://` like production and the clipboard API is available.
*   **Browser**: run CUJ 1–4 as written in current Chrome and Safari. Expected
    values are listed in each CUJ.
*   **Regression**: theme switching, background switching, reset to defaults,
    and fullscreen by click still work.

--------------------------------------------------------------------------------

<!-- Provenance: Drafted and reviewed with EGM (Elephant-Goldfish Model). -->

*Drafted with EGM*
