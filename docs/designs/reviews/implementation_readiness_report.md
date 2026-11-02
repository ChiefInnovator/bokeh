# Goldfish Review Report — Stage 9: Implementation Readiness Test

**Target:** `/Users/rich/.openclaw/projects/bokeh/docs/designs/bokeh_screensaver.md` (`309-386`, "## Detailed Implementation Plan" to end of file)

**Context files:** `index.html`, `js/app.js`, `css/style.css`

**Verdict:** Not ready to implement. 0 Blockers, 13 Major, 12 Nits. Every factual claim the plan makes about the current code was verified as accurate (call sites, line refs, dead `.share-row`, range limits, 140 px max radius). The failures are Zero-Decision gaps (the implementer would still have to make design choices), missing phasing, and a verification plan that can't pass or fail as written.

## Reviewer Status

| Reviewer | Status |
| --- | --- |
| `egm-implementation-readiness` | completed |
| `egm-codebase-details` | completed |
| `egm-style` | completed |

## Severity Summary

| Severity | Count |
| --- | --- |
| Blocker | 0 |
| Major | 13 |
| Nit | 12 |

## Prioritized Findings (Blockers -> Major -> Nits)

### M1. No phases or checkpoints - Severity: Major
* **Reviewer Lens:** `egm-implementation-readiness`, `egm-codebase-details`
* **Affected Scope:** `309-386`
* **Discrepancy Description**: The plan is a flat list of per-file changes with one verification list at the end. The six changes overlap in `init()`, `Particle`, the `keydown` handler and the panel state, and some depend on others (`setPanelOpen` needs the `inert` markup; the header-button CSS needs the new markup). No order or checkpoint is given. The PR split proposed in `docs/designs/reviews/intermediate_zoom_out_report.md:193` isn't used.
* **Rationale & Recommendation**: Split into phases, each with its own edits and verification. For example: (1) deep-link refresh and validation, with CUJ 1 and 2 tests; (2) sprite cache and resize rescaling, with parity and performance tests; (3) accessibility markup, JS and CSS, with CUJ 3 tests; (4) reduced motion and dead CSS.

### M2. "If a debounced update is pending" is undefined, so a copied link can still be stale - Severity: Major
* **Reviewer Lens:** `egm-implementation-readiness`, `egm-codebase-details`, `egm-style`
* **Affected Scope:** `317-320`
* **Discrepancy Description**: Nothing marks an update as pending. `deepLinkUpdateTimer` (`app.js:43, 368-369`) is never cleared after it fires. After the timer fires, `updateDeepLink()` awaits `CompressionStream` (`app.js:342-348, 694-701`), and `cachedDeepLink` stays stale while that runs. A click in that window copies the old link, which is the Goal 1 bug. Overlapping `updateDeepLink()` calls (`bootstrap()` at `app.js:924` plus the one scheduled in `init()`) can also finish out of order. The plan doesn't say whether the synchronous link is written back to `cachedDeepLink`. The 300 ms debounce from line 182 isn't repeated here, and the code currently uses 500 ms.
* **Rationale & Recommendation**: Add a `deepLinkDirty` flag or generation counter that `scheduleDeepLinkUpdate()` sets. Clear it only when an `updateDeepLink()` run for the latest generation writes `cachedDeepLink`, and discard stale results. The copy handler builds with `encodeStateParamSync` whenever `deepLinkDirty || !cachedDeepLink`. State the cache-write rule, say whether to cancel the timer after a synchronous build, and write "(300 ms)" explicitly.

### M3. Validation fallbacks, step snapping and the background check location are open - Severity: Major
* **Reviewer Lens:** `egm-implementation-readiness`, `egm-codebase-details`
* **Affected Scope:** `321-324` (with line 191)
* **Discrepancy Description**: The plan doesn't specify:
  * The `fallback` for each field: `DEFAULTS` or the current value.
  * How the input attributes are parsed.
  * Whether values snap to `step`. Line 191 says `LIMITS` mirrors step, but lines 198 and 321 only read min and max. For example, `particleCount=333` shows 333 in the label (`app.js:759`) while the slider snaps to 330, and 333 propagates in the next shared link.
  * What happens when an optional input is missing (the code guards with `if (particleSizeInput)`, `app.js:380, 764`).
  * Where the background check goes. `setBackgroundById` assigns `currentBackground` before it looks up the ID.
* **Rationale & Recommendation**: Define `LIMITS = { field: {min, max, step} }` from `parseFloat(input.*)`, with hardcoded values as a fallback. Use `DEFAULTS[field]` as the fallback. Snap with `Math.round((v-min)/step)*step+min`, then clamp, or state that only min and max are enforced. Move the ID check into `setBackgroundById` so it returns early when there's no match.

### M4. Non-object payloads render a blank scene - Severity: Major
* **Reviewer Lens:** `egm-codebase-details`
* **Affected Scope:** `321-324`, `370-371`
* **Discrepancy Description**: `applyStatePayload()` returns early when `state` isn't an object (`app.js:754`), before it calls `init()` (`app.js:794`). `applyDeepLinkFromUrl()` still returns true (`app.js:810`), so `bootstrap()` skips `init()` (`app.js:920-922`). A valid `s` that decodes to `null`, `0` or `"x"` renders zero particles. Arrays pass the `typeof` check, and `JSON.parse("1e400")` yields `Infinity`. CUJ 2 (lines 116-118) promises defaults for broken input.
* **Rationale & Recommendation**: Reject anything that isn't a plain object, including arrays. Make `applyStatePayload` always reach `init()`, or return a boolean that `applyDeepLinkFromUrl` passes up. Add these payloads to the verification list.

### M5. Theme lookup accepts inherited prototype keys - Severity: Major
* **Reviewer Lens:** `egm-style`
* **Affected Scope:** `322-324` (against the Security NFR at `286-290`)
* **Discrepancy Description**: "Only accept `state.theme` if `themes[state.theme]` exists" describes the current code (`app.js:785`), so it reads like a change but changes nothing. `themes` is a plain object literal (`app.js:91`), so `"constructor"` or `"__proto__"` pass the check and become `currentTheme`. That contradicts the "fixed table lookup" claim in the NFR.
* **Rationale & Recommendation**: Use `Object.hasOwn(themes, state.theme)`. For background, use `backgroundImages.some(b => b.id === state.background)`. Name all seven fields, including `driftEnabled` (boolean only).

### M6. The collapsible-header markup would break the existing toggle - Severity: Major
* **Reviewer Lens:** `egm-implementation-readiness`, `egm-codebase-details`, `egm-style`
* **Affected Scope:** `334-335`, `341-343`, `352-353`
* **Discrepancy Description**: Wrapping the label in `<button class="collapsible-header">` moves the class off the `<h4>` (`index.html:163, 195, 205`). `setupCollapsibles()` finds content with `header.nextElementSibling` (`app.js:902`), which becomes `null` or the svg, so the handler breaks. Other gaps:
  * The plan doesn't say whether the chevron `<svg>` goes inside the button. The `.collapsible-header` and `.collapsed .chevron` rules (`style.css:187-212`) depend on where it goes.
  * "Reset button chrome" doesn't list the reset properties.
  * The new Settings content `id` isn't named. `theme-list` and `background-list` already exist, so "give each an id" is partly redundant.
* **Rationale & Recommendation**: Give the exact markup, e.g. `<h4><button type="button" class="collapsible-header" aria-expanded="true" aria-controls="settings-content">Settings <svg class="chevron">...</svg></button></h4>`. Resolve content with `document.getElementById(btn.getAttribute('aria-controls'))`. List the resets (`background:none; border:0; padding:0; width:100%; font:inherit; color:inherit; text-align:left`) and move the flex rules onto the button. Consider `[aria-expanded="false"] .chevron` instead of a duplicate `.collapsed` class.

### M7. Collapsed sections stay in the Tab order - Severity: Major
* **Reviewer Lens:** `egm-implementation-readiness`
* **Affected Scope:** `334-335`, `372-374`
* **Discrepancy Description**: A collapsed `.section-content` is hidden only with `max-height:0; opacity:0`. Its controls stay focusable but can't be seen. This is the same defect the plan fixes for the whole panel with `inert`, and it violates the goal at lines 71-73.
* **Rationale & Recommendation**: Have the toggle set `inert` on the content, or add `visibility:hidden` to `.collapsed`. Add a CUJ 3 check that Tab skips collapsed controls.

### M8. `setPanelOpen` focus rules are wrong for some callers - Severity: Major
* **Reviewer Lens:** `egm-implementation-readiness`, `egm-codebase-details`
* **Affected Scope:** `330-333`
* **Discrepancy Description**: `setPanelOpen(open)` always moves focus. When it's called from `applyDeepLinkFromUrl` (`app.js:805`) during bootstrap, it would focus `#settings-btn` on page load. A canvas mouse click (`app.js:843-844`) doesn't need focus moved either. The plan also doesn't say how `toggleMenu`'s toggle maps onto `setPanelOpen`.
* **Rationale & Recommendation**: Use `setPanelOpen(open, { moveFocus = true } = {})` and pass `false` from bootstrap and the canvas click. Make it a no-op when the state doesn't change. Set `toggleMenu = () => setPanelOpen(themePanel.classList.contains('panel-hidden'))`.

### M9. Keyboard users lose the UI in fullscreen - Severity: Major
* **Reviewer Lens:** `egm-implementation-readiness`, `egm-codebase-details`
* **Affected Scope:** `336`, `372-374`
* **Discrepancy Description**: In fullscreen, `#ui-layer` fades to opacity 0 after 2 s (`app.js:868-874`, `style.css:63-65`), and the bootstrap timer does the same after a deep link (`app.js:806-809`). Only `mousemove`, `mousedown` and `touchstart` bring it back (`app.js:888-890`). A keyboard-only user (CUJ 3) ends up tabbing through invisible controls.
* **Rationale & Recommendation**: Add `keydown` and `focusin` listeners that call `resetInactivityTimer()`. Add a fullscreen keyboard pass to the CUJ 3 test.

### M10. Reduced-motion behavior is undecided - Severity: Major
* **Reviewer Lens:** `egm-implementation-readiness`, `egm-codebase-details`, `egm-style`
* **Affected Scope:** `327-328`, `354-356` (Open Question at `95-97`)
* **Discrepancy Description**: The plan leaves these open:
  * Open Question 2 (static frame or slowed motion) is unresolved.
  * `this.speed` is computed in `reset()` (`app.js:280`). It's unclear whether the 0.25 factor goes there (which needs `init()` when the media query changes) or in `update()` (`app.js:287`).
  * The listener's behavior isn't defined.
  * It doesn't say whether `driftEnabled` stays checked and shared in links while drift is suppressed.
  * "Shortens or removes transitions" is still a choice, and the affected rules aren't listed (`style.css:32, 59, 127, 206, 217, 238, 377`, plus the hover rotate and translate).
* **Rationale & Recommendation**: Resolve the Open Question first. Then:
  * Declare `let reducedMotion = mq.matches;` and have the `change` listener only update it.
  * In `update()`, use `phase += speed * (reducedMotion ? 0.25 : 1)` and skip drift when reduced.
  * Leave the link payload unchanged.
  * For CSS, use one rule (`transition-duration: 0.01ms !important`) on a named selector list, plus `transform:none` on hover states.

### M11. Sprite-cache details are open - Severity: Major
* **Reviewer Lens:** `egm-implementation-readiness`, `egm-codebase-details`
* **Affected Scope:** `325-326` (with `223-234`)
* **Discrepancy Description**: The plan doesn't specify:
  * The canvas type (`OffscreenCanvas` or a DOM canvas, which matters for Safari).
  * The data structure (`sprites[colorIndex]` is implied but not stated).
  * The gradient stops (`app.js:309-333`).
  * That the 0.7 background dimming (`app.js:312-313`) stays in the alpha calculation.
  * The `globalAlpha = 1` reset next to `app.js:509`.

  Because `buildSprites()` runs from `init()`, every slider drag tick (`app.js:376, 384, 393`) rebuilds up to five 256x256 canvases. Line 233 says sprites scale down, but at the 140 px max radius the 128 px sprite is scaled up.
* **Rationale & Recommendation**: Specify `let sprites = []` built with `document.createElement('canvas')` and the exact current stops (center lightness `min(100,l+40)` at alpha 1, `l` at 0.9, edge at 0). Keep the alpha math in `draw()`, then call `drawImage(sprites[this.colorIndex], x-r, y-r, 2r, 2r)` and reset `globalAlpha`. Rebuild sprites only when the theme changes. Fix the scaling wording.

### M12. The verification plan can't pass or fail as written - Severity: Major
* **Reviewer Lens:** `egm-implementation-readiness`, `egm-codebase-details`, `egm-style`
* **Affected Scope:** `362-380`
* **Discrepancy Description**:
  * Visual parity (`377-378`) compares screenshots of a `Math.random()` scene, so the screenshots always differ. There's no pass criterion and no background-on case.
  * CUJ 2 (`370-371`) gives no crafted URLs or expected values.
  * CUJ 4 (`375-376`) checks "higher fps" at 1000 particles in desktop DevTools. The NFR target (`291-292`) is a steady 60 fps at 300 particles on a mid-range phone. There's no threshold, and the resize "no re-randomize" behavior isn't tested.
  * There are no tests for reduced motion, `aria-expanded`, the close-button name, the toast announcement, or the copy-during-debounce race.
* **Rationale & Recommendation**:
  * Parity: seed `Math.random` or compare a single particle drawn both ways on a test canvas, with a stated tolerance.
  * CUJ 2: give a console recipe (e.g. `encodeStateParamSync({particleCount:5e6, theme:'nope', brightnessPercent:-50})`), with expected results of 1000 particles, the default theme and brightness 20. Also add `?s=!!!` and the M4 payloads.
  * Performance: add an fps check against the NFR target, and a Performance-panel check that `animate()` makes no `createRadialGradient` calls.
  * Resize: rotate or resize and confirm the scene scales.
  * Add one case with an expected result for each untested change.

### M13. "Interactive element" in the Enter handler is undefined - Severity: Major
* **Reviewer Lens:** `egm-implementation-readiness` (Major), `egm-codebase-details` (Nit)
* **Affected Scope:** `336`
* **Discrepancy Description**: The implementer has to choose the selector. Once focus is on a control, keyboard users can no longer reach fullscreen with Enter.
* **Rationale & Recommendation**: Use `!e.target.closest('button, input, select, textarea, a[href], [contenteditable]')`. Either accept the Enter limitation explicitly or add a dedicated key such as `f`.

### N1. Focus-ring style unspecified - Severity: Nit
* **Reviewer Lens:** `egm-implementation-readiness`
* **Affected Scope:** `353-355`
* **Discrepancy Description**: The outline color, width and offset are left open.
* **Rationale & Recommendation**: Use a placeholder such as `:is(button, input[type=range], input[type=checkbox]):focus-visible { outline: 2px solid rgba(255,255,255,0.9); outline-offset: 2px; }`.

### N2. Resize rescale has no zero-size guard - Severity: Nit
* **Reviewer Lens:** `egm-implementation-readiness`, `egm-codebase-details`
* **Affected Scope:** `329`
* **Discrepancy Description**: If the old `width` or `height` is 0 (for example, the page loaded hidden or minimized), the rescale produces `NaN` or `Infinity`. The plan also doesn't say to capture the old size before reassigning the canvas size.
* **Rationale & Recommendation**: Capture `const ow = width, oh = height` first. Call `init()` if either is 0.

### N3. Decompressed payload size is unbounded - Severity: Nit
* **Reviewer Lens:** `egm-implementation-readiness`
* **Affected Scope:** `321-324` (Security NFR)
* **Discrepancy Description**: A small gzip bomb in `s` can expand to hundreds of MB before clamping runs, which conflicts with "tab stays responsive" in CUJ 2.
* **Rationale & Recommendation**: Cap the length of `s` (e.g. 2,048 chars) and/or stop reading decompressed bytes at a limit (e.g. 4 KB).

### N4. `APP_VERSION` bump not mentioned - Severity: Nit
* **Reviewer Lens:** `egm-implementation-readiness`, `egm-codebase-details`
* **Affected Scope:** `313-336`
* **Discrepancy Description**: `APP_VERSION` (`app.js:26`, shown in the footer) appears to be bumped per release. The plan doesn't say whether to update it.
* **Rationale & Recommendation**: Add an explicit step.

### N5. `#settings-btn` label conflicts with `aria-expanded` - Severity: Nit
* **Reviewer Lens:** `egm-codebase-details`, `egm-style`, `egm-implementation-readiness`
* **Affected Scope:** `344`
* **Discrepancy Description**: The label `aria-label="Open Theme Settings"` (`index.html:144`) is kept while `aria-expanded` is added. A screen reader would announce "Open Theme Settings, expanded".
* **Rationale & Recommendation**: Rename the label to "Theme settings", or flip it between open and close.

### N6. Toast ARIA: redundant attribute, repeat announcements, and no traceability - Severity: Nit
* **Reviewer Lens:** `egm-codebase-details`, `egm-implementation-readiness`, `egm-style`
* **Affected Scope:** `346-347`
* **Discrepancy Description**: `role="status"` already implies `aria-live="polite"`. Setting the same text twice may not be re-announced. The change also doesn't appear in Change 3 (`201-215`) or the Goals.
* **Rationale & Recommendation**: Drop the redundant attribute, clear `textContent` before setting it, and add a bullet to Change 3.

### N7. Duplicated theme and background handlers - Severity: Nit
* **Reviewer Lens:** `egm-codebase-details`
* **Affected Scope:** `317-320`
* **Discrepancy Description**: The background click handler (`app.js:640-658`) duplicates `setBackgroundById()` (`app.js:817-832`). The theme click handler (`app.js:586-595`) duplicates `setThemeById()` and `markActiveTheme()`. The new `scheduleDeepLinkUpdate` call would land in both copies, and it's redundant where `init()` is already called.
* **Rationale & Recommendation**: Have the click handlers call the `set*ById` helpers so the call lives in one place.

### N8. Inaccurate reason for the local server - Severity: Nit
* **Reviewer Lens:** `egm-style`
* **Affected Scope:** `364-365`
* **Discrepancy Description**: `CompressionStream` doesn't need a secure context. The async Clipboard API does, and `localhost` qualifies.
* **Rationale & Recommendation**: Reword to "so the page runs in a secure context (`localhost`), which the async Clipboard API requires."

### N9. The design-doc entry in the file list is filler - Severity: Nit
* **Reviewer Lens:** `egm-style`
* **Affected Scope:** `358-360`
* **Discrepancy Description**: "Type / Scope: This document." gives the implementer nothing to act on.
* **Rationale & Recommendation**: Remove the entry or reduce it to one line.

### N10. Reduced-motion bullet wording - Severity: Nit
* **Reviewer Lens:** `egm-style`
* **Affected Scope:** `327-328`
* **Discrepancy Description**: "Apply in `Particle.update()` and shimmer speed" lists a location and a quantity as if they were two places. Shimmer is updated inside `update()`. This is subsumed by M10 once M10 is resolved.
* **Rationale & Recommendation**: "In `Particle.update()`, when reduced motion is active, multiply shimmer speed by 0.25 and skip drift; update on the `matchMedia` `change` event."

### N11. Debounce interval not restated - Severity: Nit
* **Reviewer Lens:** `egm-style`, `egm-implementation-readiness`
* **Affected Scope:** `317-320`
* **Discrepancy Description**: Line 182 specifies 300 ms, but the code uses 500 ms (`app.js:369`), and the implementation bullet doesn't restate the value.
* **Rationale & Recommendation**: Add "(300 ms)" after `scheduleDeepLinkUpdate()`. This is covered by the M2 fix.

### N12. Section-content ids partly redundant - Severity: Nit
* **Reviewer Lens:** `egm-style`, `egm-codebase-details`
* **Affected Scope:** `343`
* **Discrepancy Description**: `#theme-list` and `#background-list` already exist. Only the Settings content lacks an id.
* **Rationale & Recommendation**: "Add `id="settings-content"` to the Settings `.section-content`. Point each header button's `aria-controls` at `settings-content`, `theme-list` and `background-list`." This is covered by the M6 fix.
