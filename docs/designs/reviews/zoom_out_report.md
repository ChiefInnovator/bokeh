# Goldfish Review Report

**Target:** `/Users/rich/.openclaw/projects/bokeh/docs/designs/bokeh_screensaver.md` (full file)

**Context files:** `index.html`, `js/app.js`, `css/style.css`

## Reviewer Status

| Reviewer | Status |
| --- | --- |
| `egm-zoom-out` (instances A and B) | completed |

**Severity counts (after deduplication):** Blocker 0 · Major 3 · Nit 7

## Prioritized Findings (Blockers -> Major -> Nits)

### Change 1 adds to the stale deep-link cache instead of removing it - Severity: Major
* **Reviewer Lens:** `egm-zoom-out` (A, B)
* **Affected Scope:** Lines 179-187 (Change 1); lines 317-320 (Detailed Implementation Plan, first `js/app.js` bullet); Problem item 1
* **Discrepancy Description**: Links go stale because the copy handler reads a cached value (`cachedDeepLink`, `deepLinkUpdateTimer`; `app.js` 42-43, 342-370) that a debounced timer refreshes. The plan keeps the cache and adds `scheduleDeepLinkUpdate()`, five or more new call sites, and a "pending" check in the copy handler. That check misses a second race: after the timer fires, `updateDeepLink()` is still waiting on `CompressionStream` (`app.js` 342-352), so the cache is stale but nothing counts as pending. Two of the listed call sites are already covered. Theme selection calls `init()` (`app.js` 589), which already debounces. `applyStatePayload` calls `init()` after `setBackgroundById` (`app.js` 794).
* **Rationale & Recommendation**: The code already has a synchronous builder, `encodeStateParamSync()` (`app.js` 420-424), which the copy handler uses as a fallback (`app.js` 431-445). Build the link synchronously on every click. Then delete `cachedDeepLink`, the timer, `updateDeepLink()`, and the debounce in `init()`. That removes the whole stale-cache bug class. Old links still decode because the decoder detects gzip vs. plain JSON (`app.js` ~722-724). Gzip saves little on a ~145-byte payload once its 18-byte header and trailer are counted (worth a quick measurement). If compression stays, the doc should say why, count an in-flight compression as "pending", and drop the redundant theme call site.

### Change 2 writes clamping code the range inputs already do - Severity: Major
* **Reviewer Lens:** `egm-zoom-out` (A, B)
* **Affected Scope:** Lines 189-199 (Change 2); lines 321-324 (`LIMITS` / `clampNumber()` bullet)
* **Discrepancy Description**: The plan adds a `LIMITS` table and a `clampNumber()` helper. Setting `<input type="range">.value` already clamps to `min`/`max`, snaps to `step`, and falls back on invalid input (HTML value sanitization). `applyStatePayload()` already writes each value into its input (`app.js` 758, 764, 770, 776). The section also contradicts itself: line 191 says `LIMITS` "mirrors" min/max/step, and line 198 says it is read from the DOM. `step` is only used for the separate integer rounding.
* **Rationale & Recommendation**: Reorder the code to assign `input.value = state.x`, then read back `input.valueAsNumber`. This covers CUJ 2 (5,000,000 becomes 1000, -50 becomes 20, integer rounding comes from `step`) with no new table or helper. It also covers non-finite input such as `1e999`. Keep only the theme and background ID checks.

### Change 4 (sprite caching) has no baseline measurement behind it - Severity: Major
* **Reviewer Lens:** `egm-zoom-out` (A, B)
* **Affected Scope:** Lines 51-55 (Problem item 4); lines 217-235 (Change 4); line 255 (Alternative A rejection); lines 291-292 (NFR Performance)
* **Discrepancy Description**: The cost is argued from arithmetic ("60,000 gradient objects ... per second"). No profile or fps number is given, yet line 255 calls it "the measured hot spot". Mobile defaults to 100 particles (`app.js` 49), and CUJ 4 targets 300. Change 4 is the largest and most rendering-sensitive change: offscreen canvases, the `color` to `colorIndex` switch, and a visual-parity requirement. With additive blending, pixel fill may cost more than creating gradients, so the gain is unproven. (Both reviewers agree that the alpha-scaling equivalence argument holds: `app.js` 327-333.)
* **Rationale & Recommendation**: Move the baseline profile step (the Verification Plan step at ~line 375) ahead of the change, at 300 and 1000 particles on a mid-range device. Make Change 4 conditional on missing the 60 fps / 300-particle target. Fix the word "measured" at line 255 unless data is added. If the change goes ahead, two simplifications are worth considering. Key the sprite cache by the existing `color` object in a `Map`, so `colorIndex` isn't needed. Or keep one origin-centered gradient per color, positioned with `setTransform` and scaled with `globalAlpha`.

### Four unrelated changes ship with one rollback path - Severity: Nit
* **Reviewer Lens:** `egm-zoom-out` (A)
* **Affected Scope:** Lines 18-21 (Overview); lines 293-295 (NFR Rollout & Rollback)
* **Discrepancy Description**: The link-staleness fix, input bounding, accessibility work and rendering performance change don't depend on each other. With one revert path, a visual regression from Change 4 would also undo the security and accessibility fixes.
* **Rationale & Recommendation**: Ship them as separate PRs, or at least isolate Change 4, so each can be reverted on its own. (Reviewer A rated this "Nit bordering on Major".)

### Sprites are rebuilt on every `init()` - Severity: Nit
* **Reviewer Lens:** `egm-zoom-out` (A)
* **Affected Scope:** Line 224 (Change 4 pseudocode); line 325 (`buildSprites()` called from `init()`)
* **Discrepancy Description**: `init()` runs on every `input` event from the count, size and speed sliders (`app.js` 376, 384, 393). Sprites depend only on the theme palette, so dragging a slider rebuilds them repeatedly for nothing.
* **Rationale & Recommendation**: Rebuild sprites only when the theme changes.

### Detailed Implementation Plan repeats the Technical Plan, and the copies have drifted - Severity: Nit
* **Reviewer Lens:** `egm-zoom-out` (A, B)
* **Affected Scope:** Lines 179-246 (Technical Plan Changes) compared with lines 313-336 (Detailed Implementation Plan)
* **Discrepancy Description**: Function names and constants appear in both sections. They have already drifted. `setPanelOpen()` appears only in the implementation list, not in Change 3. The doc says 300 ms while the code uses 500 ms (`app.js` 369), and the doc doesn't say this value is changing.
* **Rationale & Recommendation**: Keep the Technical Plan about behavior (what triggers a rebuild, where validation happens). Make the implementation section a per-file checklist that points back to the Change numbers. If the debounce stays, give a reason for moving from 500 ms to 300 ms.

### Toast ARIA change has no matching problem or goal - Severity: Nit
* **Reviewer Lens:** `egm-zoom-out` (A, B)
* **Affected Scope:** Lines 346-347 (`index.html` changes)
* **Discrepancy Description**: Adding `role="status"` / `aria-live="polite"` to the toast is reasonable, but no Problem or Goal item calls for it.
* **Rationale & Recommendation**: Add it to the Problem 3 list, or drop it.

### Keeping `movies/` for a possible future feature - Severity: Nit
* **Reviewer Lens:** `egm-zoom-out` (A)
* **Affected Scope:** Line 62 (Problem 5); lines 93-94 (Open Questions); lines 245-246 (Change 6)
* **Discrepancy Description**: The plan keeps 7.4 MB of unused files for a feature that exists only under Future Improvements.
* **Rationale & Recommendation**: Default to deleting them, since git history keeps them if the video feature is built later. Keep the open question only if there is a concrete plan.

### Design doc lists itself as a file to create - Severity: Nit
* **Reviewer Lens:** `egm-zoom-out` (B)
* **Affected Scope:** Lines 358-360 (Target Files to Create/Modify)
* **Discrepancy Description**: The document appears in its own target-file list.
* **Rationale & Recommendation**: Remove the entry.

### Redundant theme-selection call site in Change 1 - Severity: Nit
* **Reviewer Lens:** `egm-zoom-out` (A, B)
* **Affected Scope:** Lines 181-184
* **Discrepancy Description**: The plan lists theme selection as a new `scheduleDeepLinkUpdate` call site, but theme clicks already go through `init()` (`app.js` 589).
* **Rationale & Recommendation**: Drop that call site. This only matters if the first Major finding is not adopted.

## Checked and Found Sound

* `inert` plus a single `setPanelOpen()` replaces the scattered `classList` toggles (`app.js` 540, 805, 844, 856).
* Using a button inside `<h4>` instead of `<details>` keeps the `max-height` collapse animation (`style.css` 215-221).
* Change 5 (rescaling positions on resize) and Change 6 (removing dead CSS) are minimal and fix the root cause.
* The rejected alternatives (WebGL, a schema library, `devicePixelRatio` rendering) and the Non-Goals are good YAGNI calls.
