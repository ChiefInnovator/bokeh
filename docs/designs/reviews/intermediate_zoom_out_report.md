# Goldfish Review Report — Stage 8, Intermediate Zoom Out

**Target:** `/Users/rich/.openclaw/projects/bokeh/docs/designs/bokeh_screensaver.md` (full file)

**Focus:** Would adopting the mitigations and additions requested by the Comprehension and Critic reports over-scope the design? Which ones should be rejected, and what is the simplest shape that still fixes the real problems? The doc has not been edited since those reports.

## Reviewer Status

| Reviewer | Status |
| --- | --- |
| `egm-zoom-out` (instance A) | completed |
| `egm-zoom-out` (instance B) | completed |

The synthesizer re-checked these code anchors before writing this report:

- `encodeStateParamSync` is at `app.js:420`.
- The gzip magic-byte check is at `app.js:706`.
- The idle listeners are mouse and touch only (`app.js:888-890`).
- `centerLightnessOffset` is fixed at 40 (`app.js:309`).

## Verdict

The Comprehension and Critic reports mostly find real problems. But if their fixes were adopted as written, the plan would roughly double in size for a three-file static page. The fixes that cause this are:

- a generation counter
- a cap on decompressed bytes
- a pixel-diff harness
- a 120 Hz / delta-time fix
- resize thresholds and debounce
- a six-row risk matrix
- a browser support matrix
- a visible fullscreen button

Nearly every real problem has a fix of one or two lines. Several problems disappear once the earlier Zoom Out simplifications (drop the deep-link cache; sanitize through the range inputs) are adopted. With those changes, the doc gets **shorter**:

- It gains about four one-line mechanisms.
- It loses `scheduleDeepLinkUpdate`, `LIMITS`, `clampNumber`, the pending-state logic, and `colorIndex`.

## Prioritized Findings (Blockers -> Major -> Nits)

Neither instance found a Blocker.

### Copy-vs-compression race: drop the cache, don't add a generation counter - Severity: Major
* **Reviewer Lens:** `egm-zoom-out` (A, B)
* **Affected Scope:** Lines 176-187, 317-320 (Change 1). Addresses Critic M4, N2, N17, the M1 debounce risk, and Comprehension #1 and #7.
* **Discrepancy Description:** The race is real. `updateDeepLink()` awaits `CompressionStream` (`app.js:342-352`), so a copy made while compression is running gets a stale `cachedDeepLink`. The Critic's fix (a generation counter plus an in-flight flag) adds state to a cache that doesn't need to exist.
* **Rationale & Recommendation:** **SIMPLIFY.**
  - Build the link on every click with the existing `encodeStateParamSync()` (`app.js:420-424`).
  - Delete `cachedDeepLink`, `deepLinkUpdateTimer`, `updateDeepLink()`, the debounce in `init()`, the bootstrap call, `encodeStateParam`, `compressString`, and the planned `scheduleDeepLinkUpdate()`.
  - Old gzip links still decode, because of the magic-byte check at `app.js:706`.
  - Line 176 should say that new links are uncompressed JSON and remain decodable.
  - This also settles the 300 vs 500 ms question.

### `LIMITS` / `clampNumber` inconsistency: let the range inputs sanitize - Severity: Major
* **Reviewer Lens:** `egm-zoom-out` (A, B)
* **Affected Scope:** Lines 189-199, 321-324. Addresses Critic N1 and the M1 "DOM-missing fallback", and Comprehension #5.
* **Discrepancy Description:** The requests to make `LIMITS` consistent and add a DOM-missing fallback polish a mechanism that isn't needed.
* **Rationale & Recommendation:** **SIMPLIFY.**
  - In `applyStatePayload` (`app.js:756-778`), assign `input.value = state.x`, then read `input.valueAsNumber` back into the global.
  - HTML value sanitization handles min/max clamping and `step` snapping (`index.html:170-182`).
  - Delete `LIMITS` and `clampNumber()`.
  - The inputs are static markup, so no DOM-missing fallback is needed.
  - Keep the theme allow-list, which already exists at `app.js:785`. Add a `find` guard to `setBackgroundById` (`app.js:817-818`).
  - Document one caveat: `1e999` parses to `Infinity`, which sanitizes to the range midpoint, not the app default. That still satisfies CUJ 2.

### Decompression bomb: cap input length, not decompressed bytes - Severity: Major
* **Reviewer Lens:** `egm-zoom-out` (A, B)
* **Affected Scope:** Lines 110-118, 189-199, 285-290. Addresses Critic M5.
* **Discrepancy Description:** The risk is real. It breaks CUJ 2's promise that "the tab stays responsive", because `fromBase64Url` plus `DecompressionStream` (`app.js:683-739`) run unbounded. A cap on decompressed bytes would need a streaming read loop.
* **Rationale & Recommendation:** **SIMPLIFY.**
  - In `applyDeepLinkFromUrl()`, ignore any `s` longer than a fixed limit.
  - The instances proposed 1024 and 2048 characters. Real payloads are about 200 characters. gzip expands at most about 1000:1, so either value bounds decompressed output to about 1-1.5 MB.
  - Pick 2048 for headroom.
  - Add one sentence under Security.

### Keyboard focus on hidden controls; idle timer ignores keys - Severity: Major
* **Reviewer Lens:** `egm-zoom-out` (A, B)
* **Affected Scope:** Lines 37-50, 120-128, 201-215, 334-336. Addresses Critic M6 and Comprehension #4.
* **Discrepancy Description:**
  - Collapsed `.section-content` uses only `max-height: 0; opacity: 0` (`style.css:221-224`), so it stays tabbable.
  - `#ui-layer.hidden` is just `opacity: 0` (`style.css:63`).
  - The idle timer listens only to mouse and touch (`app.js:888-890`).
* **Rationale & Recommendation:** **ADOPT, minimal form.**
  - Set `content.inert` in the existing collapsible toggle (`app.js:897-904`).
  - Add `window.addEventListener('keydown', resetInactivityTimer)`.
  - **REJECT** the extra "show the UI when it contains focus" / `focusin` logic. A `keydown` before Tab already reveals the UI.

### Keyboard users lose fullscreen: use an `f` key, not a new button - Severity: Major
* **Reviewer Lens:** `egm-zoom-out` (A, B)
* **Affected Scope:** Lines 88-89, 120-128, 209-210. Addresses Critic M7.
* **Discrepancy Description:** The plan's own Enter guard plus Escape-returns-focus means focus is always on a control, so keyboard users can never reach fullscreen. The Critic's visible labelled button is new UI and conflicts with the "no visual redesign" Non-Goal.
* **Rationale & Recommendation:** **SIMPLIFY.**
  - Toggle fullscreen on `f` in the existing global `keydown` handler, ignoring events from form inputs.
  - Add this step to CUJ 3.

### Performance: measure once against one target; reject the extra rigor - Severity: Major
* **Reviewer Lens:** `egm-zoom-out` (A, B)
* **Affected Scope:** Lines 51-55, 130-135, 217-235, 255, 291-292. Addresses Critic M2 and M3; repeats the earlier Zoom Out Major.
* **Discrepancy Description:** The hot spot is asserted but not measured, and the device and fps target differ between CUJ 4 and the NFR. The mobile default is already 100 particles (`app.js:49`), so 300 is a user choice.
* **Rationale & Recommendation:** **ADOPT the measurement, REJECT the extras.**
  - Use one named device and one target (for example, at least 55-60 fps at 300 particles), the same in CUJ 4 and the NFR.
  - Profile before Change 4, and make Change 4 conditional on missing the target.
  - Change "measured" to "identified" at line 255.
  - **REJECT** the following:
    - median-over-N-minutes protocols
    - a speculative "lower mobile cap or render resolution" option
    - a delta-time fix for 120 Hz, which changes behavior and is out of scope; at most, add one line under known limits.

### "Same pixels" claim and sprite size - Severity: Major (A) / Nit (B), reported as Major
* **Reviewer Lens:** `egm-zoom-out` (A, B)
* **Affected Scope:** Lines 76-77, 219-235, 325. Addresses Critic M9, Comprehension #2 and #3, and the earlier Zoom Out Nit.
* **Discrepancy Description:**
  - The equivalence argument holds but is not explained:
    - `centerLightnessOffset` is always 40 (`app.js:309-315`), so it can be baked into the sprite.
    - The 0.7 background factor is a uniform alpha, so it can move into `globalAlpha`.
  - The doc's "downscaling" claim is wrong. The maximum particle diameter is about 280 px, so a 256 px sprite would be **upscaled**. This is a real correctness slip, which is why the finding is reported as Major.
* **Rationale & Recommendation:** **SIMPLIFY.**
  - Add one sentence for each equivalence point.
  - Size the sprite to at least the maximum diameter (288 px or 512 px).
  - Say "equivalent before resampling".
  - Build sprites lazily in a `Map` keyed by the theme color object, and clear the map on theme change. Do not build them in `init()`, which runs on every slider `input` (`app.js:376, 384, 393`). This removes `colorIndex`.
  - **REJECT** a pixel-diff harness and an 8-bit banding analysis. Extend the existing screenshot check (line 377) to cover min/max brightness with a background.

### Reduced motion underspecified - Severity: Major (A) / Nit (B), reported as Nit
* **Reviewer Lens:** `egm-zoom-out` (A, B)
* **Affected Scope:** Lines 74-75, 95-97, 213-215, 327-328. Addresses Critic M10.
* **Rationale & Recommendation:** **SIMPLIFY, as a clarification only.**
  - `speed` is fixed in `reset()` (`app.js:280`), so apply the factor in `update()` (`app.js:287`): `phase += speed * factor`, and skip drift there.
  - State that this never changes `animSpeedScale`, `driftEnabled`, or the shared link.
  - The Goal should state the concrete values.
  - It is reported as a Nit because no new mechanism is needed.

### Backward-compatibility goal vs clamping - Severity: Nit
* **Reviewer Lens:** `egm-zoom-out` (A, B)
* **Affected Scope:** Lines 78-79, 295. Addresses Critic M8.
* **Rationale & Recommendation:** **ADOPT the wording, SIMPLIFY the audit.**
  - Narrow the goal to "every link the shipped UI could create opens unchanged".
  - Run one `git log -p index.html` check that the slider ranges never changed.
  - Don't add an exceptions table.

### Risks & Mitigations section: short, not a matrix - Severity: Nit
* **Reviewer Lens:** `egm-zoom-out` (A, B)
* **Affected Scope:** Lines 248-296. Addresses Critic M1 and N6.
* **Rationale & Recommendation:** **SIMPLIFY.** The standard requires the section, but the simplifications above remove most of the Critic's six risks. Write three or four one-line bullets:
  - sprite visual parity (screenshot check)
  - `inert` support (baseline since 2023; older browsers fall back to today's behavior), which also covers N6
  - clamping changes out-of-range hand-edited links
  - optionally, the resize rescale shift

  **REJECT** the browser-version support matrix.

### Resize jump thresholds - Severity: Nit
* **Reviewer Lens:** `egm-zoom-out` (A, B)
* **Affected Scope:** Change 5. Addresses Critic N5.
* **Rationale & Recommendation:** **REJECT.**
  - A proportional shift of about 7% on a soft blur is far better than today's full re-randomize.
  - `animate()` clears every frame (`app.js:497`), so the canvas clear on resize doesn't matter.

### Cheap doc and wording fixes - Severity: Nit
* **Reviewer Lens:** `egm-zoom-out` (A, B)
* **Affected Scope:** Various. Addresses Critic N3, N4, N7-N21 and Comprehension #6, #8-#11.
* **Rationale & Recommendation:** **ADOPT** as one wording pass with no design impact:
  - Move `setPanelOpen()` into Change 3 (N4).
  - Fix the header markup: the class is on the `<h4>` at `index.html:163, 195, 205` and should move to the inner `<button>` (N11).
  - Rename headings to match the standard (N9).
  - Fix heading levels and horizontal rules (N7, N8).
  - Partial N10: add a resize goal and move `devicePixelRatio` out of "defects". Skip per-change problem tags.
  - Add toast ARIA (`index.html:151`) to Problem 3.
  - Define "Impeccable" and "EGM", and name the 20-200 brightness range.

### Earlier Zoom Out Nits still open - Severity: Nit
* **Reviewer Lens:** `egm-zoom-out` (A, B)
* **Rationale & Recommendation:** Still recommended:
  - Ship Change 4 as its own revertible PR.
  - Delete `movies/` by default; git history keeps it.
  - Remove the doc from its own target list.

## Simplest overall shape that fixes the real problems

1. **PR 1, deep link:**
   - Build the link synchronously on copy; delete the cache, debounce, and compression-on-write.
   - Ignore `s` longer than 2048 characters.
   - Sanitize numbers through the range inputs.
   - Allow-list the theme and background IDs.
   - Net code goes down.
2. **PR 2, accessibility:**
   - Change 3 as written, with `setPanelOpen()` moved into it.
   - `inert` on collapsed sections.
   - `keydown` resets the idle timer.
   - `f` key toggles fullscreen.
   - Toast ARIA.
   - Reduced-motion factor applied only in `update()`, plus a CSS media query.
3. **PR 3, resize rescale and dead-code removal:** remove `.share-row`, and `movies/` by default.
4. **PR 4, conditional:** sprite caching, only if the one profile misses the one target. If it ships: a lazy `Map` keyed by color, sprites at least 288 px, and the existing screenshot parity check.

**Doc edits:**
- a short Risks section
- the narrowed backward-compatibility goal
- a concrete reduced-motion goal
- one performance target
- the wording pass
- an Implementation section that lists only files per change

## Rejected as scope creep

- generation counter or in-flight flag
- decompressed-byte cap
- DOM-missing `LIMITS` fallback
- `focusin` / show-on-focus logic
- visible fullscreen button
- multi-minute fps protocols and a device matrix
- lower mobile cap or render-resolution option
- 120 Hz / delta-time fix
- pixel-diff harness and banding analysis
- resize thresholds and debounce
- six-row risk matrix
- browser support matrix
- per-change problem tagging
