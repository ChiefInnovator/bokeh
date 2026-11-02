# Goldfish Review Report

**Stage:** 7, Critic Review
**Target:** `/Users/rich/.openclaw/projects/bokeh/docs/designs/bokeh_screensaver.md` (`Lines 1-308`, everything before "## Detailed Implementation Plan")
**Goldfish context:** `index.html`, `js/app.js`, `css/style.css`

## Reviewer Status

| Reviewer | Standard | Status |
| --- | --- | --- |
| `egm-design` | feature-spec-standard | completed |
| `egm-structural` | feature-spec-standard | completed |
| `egm-style` | none | completed |

**Severity totals (after deduplication):** 0 Blocker, 10 Major, 21 Nit.

## Prioritized Findings (Blockers -> Major -> Nits)

### Blockers

None.

### Major

### M1. No Risks & Mitigations section - Severity: Major
* **Reviewer Lens:** `egm-design`, `egm-structural`
* **Affected Scope:** `Lines 248-296` (security notes scattered at 283-295)
* **Discrepancy Description**: The feature-spec standard requires a Risks & Mitigations section. The doc has none. Its Security bullets describe risks the change fixes, not risks the change introduces. Unaddressed new risks include:
  * Sprite rendering may differ from today's output (256 px resampling, 8-bit alpha times `globalAlpha` under `'lighter'`).
  * Browser support for `inert` and `matchMedia` change events.
  * Clamping and ID filtering change how some existing links render (see M8).
  * `LIMITS` read from the DOM gives wrong bounds if inputs are missing.
  * Resize rescaling makes particles jump (rotation, mobile address bar).
  * The 300 ms debounce racing the copy action.
* **Rationale & Recommendation**: Add `## Risks & Mitigations` between Alternatives Considered and Non-Functional Requirements, one entry per risk with impact, mitigation and how it is verified. Move or cross-reference the Security bullets.

### M2. Performance fix rests on an unmeasured hot spot - Severity: Major
* **Reviewer Lens:** `egm-design`, `egm-style`
* **Affected Scope:** `Lines 51-55, 217-235, 255-257, 291-292`
* **Discrepancy Description**: Line 255 calls gradient/string creation "the measured hot spot", and line 55 says it "drops frames", but no profile, device or frame-time data is given; lines 53-54 are arithmetic (60,000 gradients/s), not measurement. With up to 1000 particles of radius up to 140 px in additive mode, phones are likely fill-bound, and `drawImage` fills the same pixels as `arc` + `fill`. Alternative C (line 271) concedes fill cost dominates on phones, undercutting the claim.
* **Rationale & Recommendation**: Add a baseline profile (named device, 300 and 1000 particles, scripting vs paint/GPU split), or reword to "identified hot spot" / "is expected to drop frames". If fill dominates, consider a lower mobile particle cap or render resolution.

### M3. Target device and performance target are inconsistent and untestable - Severity: Major
* **Reviewer Lens:** `egm-style`, `egm-design`
* **Affected Scope:** `Lines 21, 55, 130-135, 291-292`
* **Discrepancy Description**: The device is called "low-end devices" (21), "phones and older laptops" (55), "low-end device" vs "mid-range phone" in CUJ 4 (130-132), and "mid-range phone" (292). CUJ 4 says "near display refresh rate"; the NFR says "steady 60 fps". Neither "mid-range" nor "steady" is defined. Animation advances per frame (`app.js` 287, 291-292), so on 120 Hz displays shimmer/drift run twice as fast and do twice the work.
* **Rationale & Recommendation**: Pick one device class with a reference device, one numeric target (e.g. median fps over N minutes at 300 particles), and a measurement method. Align the CUJ 4 heading with its Given. Note the frame-rate dependence as a known limit.

### M4. Change 1 does not close the stale-link window - Severity: Major
* **Reviewer Lens:** `egm-design`
* **Affected Scope:** `Lines 179-187`
* **Discrepancy Description**: `updateDeepLink()` (`app.js` 342-352) is async because gzip is awaited. "A debounced update is still pending" covers only the timer, not compression in flight, so a copy during compression still returns the old `cachedDeepLink`. Overlapping calls can finish out of order and overwrite newer state with older.
* **Rationale & Recommendation**: Add a generation counter (discard non-latest results) and treat "compression running" as pending, or build the uncompressed link synchronously on every click. List "always build on click" as a considered alternative with its rejection reason.

### M5. Unbounded decode before validation (decompression bomb) - Severity: Major
* **Reviewer Lens:** `egm-design`
* **Affected Scope:** `Lines 110-118, 189-199, 285-290`
* **Discrepancy Description**: The `s` parameter is base64-decoded and gunzipped with no size limit (`app.js` 683-739) before any clamping. A short URL can expand to hundreds of MB and freeze the tab, breaking CUJ 2's "the tab stays responsive". Per-byte base64 loops are also slow on very long input.
* **Rationale & Recommendation**: Reject `s` above a fixed length (e.g. 4 KB) and cap decompressed bytes (e.g. 16 KB), aborting past it. Record this under Security.

### M6. Keyboard focus can land on invisible controls - Severity: Major
* **Reviewer Lens:** `egm-design`
* **Affected Scope:** `Lines 37-50, 120-128, 201-215`
* **Discrepancy Description**: Change 3 makes only the hidden panel `inert`. Collapsed sections are hidden with `max-height: 0; opacity: 0` (`style.css` 221-224) and stay tabbable. `#ui-layer.hidden` is only `opacity: 0` (`style.css` 63-65), applied after deep-link load (`app.js` 806-809) and on fullscreen idle; the idle timer resets on mouse/touch but not keydown (`app.js` 888-890).
* **Rationale & Recommendation**: Make collapsed `.section-content` `inert` or `hidden` with `aria-expanded` in sync. Reset the idle timer on `keydown`/`focusin` and show the UI whenever it contains focus.

### M7. Keyboard users lose fullscreen - Severity: Major
* **Reviewer Lens:** `egm-design`
* **Affected Scope:** `Lines 120-128, 209-210`
* **Discrepancy Description**: After the change, Enter toggles fullscreen only from a non-interactive element. Once a keyboard user is in the UI, no non-interactive element takes focus, and Escape returns focus to `#settings-btn`. Fullscreen, the app's primary mode, becomes unreachable by keyboard. CUJ 3 does not cover entering fullscreen.
* **Rationale & Recommendation**: Add a visible labelled fullscreen button or a global shortcut (e.g. `F`, ignored in inputs). Add fullscreen entry to CUJ 3.

### M8. Backward-compatibility goal conflicts with clamping - Severity: Major
* **Reviewer Lens:** `egm-design`
* **Affected Scope:** `Lines 68-70, 78-79, 295`
* **Discrepancy Description**: "Every link created before this change still opens with the same settings" is absolute, but clamping and ID filtering intentionally change links with out-of-range values, unknown backgrounds (which today still dim particles by 0.7, lines 287-289), or values from older slider ranges. The spec does not verify historical ranges.
* **Rationale & Recommendation**: Narrow the goal to "every link the shipped UI could create". Confirm from git history that slider `min`/`max` and background IDs never changed, or list exceptions.

### M9. "Same pixels" / "visually the same" is overstated and unverifiable - Severity: Major
* **Reviewer Lens:** `egm-design`, `egm-style`
* **Affected Scope:** `Lines 76-77, 219-235`
* **Discrepancy Description**: Line 221 claims the sprite "gives the same pixels" (exact equality); line 77 says "visually the same"; line 234 claims no visible artifacts. The math is equivalent before resampling, but 8-bit sprite alpha times `globalAlpha` will band differently at low alpha (20% brightness x 0.7 dim), and at radius 140 (280 px diameter) a 256 px sprite is upscaled, so "Downscaling" is wrong. No acceptance method is given.
* **Rationale & Recommendation**: Reword to "mathematically equivalent before resampling" and "Resampling". Use a 512 px sprite or size to max diameter. Define a pixel-diff or side-by-side screenshot check at min/max brightness and size, with and without a background.

### M10. Reduced-motion goal is vaguer than the plan and underspecified - Severity: Major
* **Reviewer Lens:** `egm-style`, `egm-design`
* **Affected Scope:** `Lines 74-75, 95-97, 213-215`
* **Discrepancy Description**: The goal says shimmer/drift "are slowed or stopped" and transitions "shortened", while lines 95-96 and 214 already specify drift off and shimmer x0.25; "shortened" has no value. `speed` is fixed per particle in `reset()` (`app.js` 280), so applying the factor there would require `init()` on each media-query change and re-randomize the scene. The spec does not say whether the factor affects `animSpeedScale`/`driftEnabled` (and thus shared links and the drift checkbox).
* **Rationale & Recommendation**: Restate the goal concretely (drift off, shimmer x0.25, transition duration or none). Apply the factor in `update()`, and state it never alters `animSpeedScale` or `driftEnabled`.

### Nits

### N1. `LIMITS` and `step` described inconsistently - Severity: Nit
* **Reviewer Lens:** `egm-structural`, `egm-style`, `egm-design`
* **Affected Scope:** `Lines 191-199`
* **Discrepancy Description**: Line 191 says `LIMITS` mirrors `min`, `max`, `step`; lines 198-199 read only `min`/`max`, and `clampNumber` takes no step. No DOM-missing fallback for `LIMITS`; `particleCount` integer rounding unstated.
* **Rationale & Recommendation**: State whether `step` is read and applied (snap/round), use one field list, and define hard-coded fallbacks.

### N2. "Cache rebuilt only inside init()" is inaccurate - Severity: Nit
* **Reviewer Lens:** `egm-design`
* **Affected Scope:** `Lines 28-31`
* **Discrepancy Description**: `bootstrap()` also calls `updateDeepLink()` (`app.js` 924).
* **Rationale & Recommendation**: Fix the wording; the conclusion stands.

### N3. Focus-cue claim overstated - Severity: Nit
* **Reviewer Lens:** `egm-design`
* **Affected Scope:** `Lines 48-49`
* **Discrepancy Description**: WebKit already lightens the slider track on focus (`style.css` 298-300); the cue is weak and browser-specific, not absent.
* **Rationale & Recommendation**: Reword; fix unchanged.

### N4. Panel hide/show scattered across four paths - Severity: Nit
* **Reviewer Lens:** `egm-design`
* **Affected Scope:** `Lines 206-208`
* **Discrepancy Description**: `panel-hidden` is set in `toggleMenu`, canvas click, Escape and deep-link apply.
* **Rationale & Recommendation**: Specify a single `setPanelOpen(bool)` owning `inert`, `aria-expanded` and focus moves.

### N5. Resize rescaling may cause the jump it aims to prevent - Severity: Nit
* **Reviewer Lens:** `egm-design`
* **Affected Scope:** `Lines 237-241`
* **Discrepancy Description**: Mobile address-bar toggles change height by ~5-10%, shifting all particles at once; each `canvas.width` assignment clears the canvas.
* **Rationale & Recommendation**: Ignore small height-only changes or keep absolute positions; debounce resize.

### N6. `inert` browser support not stated - Severity: Nit
* **Reviewer Lens:** `egm-design`
* **Affected Scope:** `Line 206`
* **Discrepancy Description**: No minimum browser versions or fallback behavior.
* **Rationale & Recommendation**: State minimums (Safari 15.5+, Firefox 112+) and older-browser behavior.

### N7. Future Improvements is an H3 with no parent H2 - Severity: Nit
* **Reviewer Lens:** `egm-structural`
* **Affected Scope:** `Lines 297-299`
* **Discrepancy Description**: It nests under Non-Functional Requirements by level; line 84 treats it as a peer section.
* **Rationale & Recommendation**: Promote to `## Future Improvements`.

### N8. Horizontal rules used inconsistently - Severity: Nit
* **Reviewer Lens:** `egm-structural`
* **Affected Scope:** `Lines 7, 281, 297, 307`
* **Discrepancy Description**: Rules imply part groupings the headings do not show.
* **Rationale & Recommendation**: Use rules only at labelled part boundaries, or remove 281 and 297.

### N9. Section names differ from the standard - Severity: Nit
* **Reviewer Lens:** `egm-structural`
* **Affected Scope:** `Lines 23, 65, 81, 137`
* **Discrepancy Description**: "The Problem", split Goals/Non-Goals, "Technical Plan (Architecture)" vs the standard's "Problem Statement", "Goals & Non-Goals", "Proposed Architecture".
* **Rationale & Recommendation**: Rename to the standard's headings for audit matching.

### N10. Problems, Goals and Changes do not map one-to-one - Severity: Nit
* **Reviewer Lens:** `egm-structural`
* **Affected Scope:** `Lines 26, 56-63, 65-79, 237-246`
* **Discrepancy Description**: Problem 5 (resize, dead CSS) has no Goal; Problem 5 lists `devicePixelRatio`, which the doc keeps intentionally, contradicting "these defects".
* **Rationale & Recommendation**: Add a resize-stability Goal and a dead-code Goal/Non-Goal; move the DPR item out of the defects list; optionally tag Changes with Problem numbers.

### N11. Change 3 misdescribes `.collapsible-header` location - Severity: Nit
* **Reviewer Lens:** `egm-structural`
* **Affected Scope:** `Lines 203-204`
* **Discrepancy Description**: The class is on the `<h4>` itself (`index.html` 163, 195, 205), not inside it; unclear where class and click handler (`app.js` 894) end up.
* **Rationale & Recommendation**: Spell out target markup, e.g. `<h4><button class="collapsible-header" aria-expanded aria-controls>...</button></h4>`, and note whether `style.css` 187-210 rules move.

### N12. "Allocation drops to zero" broader than the goal - Severity: Nit
* **Reviewer Lens:** `egm-style`
* **Affected Scope:** `Lines 76, 291`
* **Discrepancy Description**: NFR claims zero per-frame drawing allocation; the goal only covers gradients and color strings.
* **Rationale & Recommendation**: Reuse the goal's wording in the NFR.

### N13. "Everything lives in three files" too broad - Severity: Nit
* **Reviewer Lens:** `egm-style`
* **Affected Scope:** `Lines 15-16`
* **Discrepancy Description**: Repo also holds background JPEGs and `movies/`.
* **Rationale & Recommendation**: "All code lives in three files."

### N14. Judgmental defect headings - Severity: Nit
* **Reviewer Lens:** `egm-style`
* **Affected Scope:** `Lines 37, 51`
* **Discrepancy Description**: "Access is weak" and "Each frame is expensive" are judgments, unlike the other factual headings.
* **Rationale & Recommendation**: "Keyboard and screen-reader access has gaps"; "Each frame allocates per particle".

### N15. "Impeccable design review" undefined - Severity: Nit
* **Reviewer Lens:** `egm-style`
* **Affected Scope:** `Lines 88-89`
* **Discrepancy Description**: New readers cannot tell what "Impeccable" is.
* **Rationale & Recommendation**: Define or link it, or say "a separate design review".

### N16. Link button has two names - Severity: Nit
* **Reviewer Lens:** `egm-style`
* **Affected Scope:** `Lines 28, 105, 124`
* **Discrepancy Description**: "Copy Deep Link" button vs "the link button".
* **Rationale & Recommendation**: Use one name matching the visible label or `#copy-deep-link`.

### N17. Copy-handler sentence repeats and contradicts itself - Severity: Nit
* **Reviewer Lens:** `egm-style`
* **Affected Scope:** `Lines 184-187`
* **Discrepancy Description**: "synchronous" twice; "always ... if" is contradictory.
* **Rationale & Recommendation**: "If a debounced update is pending, the copy handler builds the link synchronously before copying." (See also M4.)

### N18. Unsupported comparatives in Alternatives - Severity: Nit
* **Reviewer Lens:** `egm-style`
* **Affected Scope:** `Lines 254, 256, 270-272`
* **Discrepancy Description**: "Much larger change", "a few dozen lines" lack basis; "4-9x" does not cite DPR 2-3 squared; "hard to see" vs "without visible benefit" conflict.
* **Rationale & Recommendation**: Give the basis for figures; change line 272 to "Cost outweighs the small visible benefit for this content."

### N19. Self-restating sentence - Severity: Nit
* **Reviewer Lens:** `egm-style`
* **Affected Scope:** `Line 264`
* **Discrepancy Description**: "Sharing is the point of the deep link" repeats the Cons line.
* **Rationale & Recommendation**: Delete it.

### N20. Security bullet sentence too long - Severity: Nit
* **Reviewer Lens:** `egm-style`
* **Affected Scope:** `Lines 287-290`
* **Discrepancy Description**: One sentence carries four clauses.
* **Rationale & Recommendation**: Split into separate sentences: never reaches `url('...')`; stored in `currentBackground`, dims by 0.7, echoed into next link; Change 2 rejects unknown IDs.

### N21. "Small" as filler - Severity: Nit
* **Reviewer Lens:** `egm-style`
* **Affected Scope:** `Line 18`
* **Discrepancy Description**: "a small set of fixes" carries no information.
* **Rationale & Recommendation**: "proposes six changes in four areas."
