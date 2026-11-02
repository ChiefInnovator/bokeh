# Consolidated Goldfish Review: Bokeh Screensaver Hardening Plan

*   **Target:** [../bokeh_screensaver.md](../bokeh_screensaver.md)
*   **Mode:** Consolidated report, all rubrics (Stages 5–9), then Elephant
    resolution
*   **Date:** 2026-11-02

## Stage reports

| Stage | Reviewers | Status | Blocker / Major / Nit | Report |
| --- | --- | --- | --- | --- |
| 5 Zoom Out | egm-zoom-out (×2) | completed | 0 / 3 / 7 | [zoom_out_report.md](zoom_out_report.md) |
| 6 Comprehension | egm-comprehension | completed | 0 / 4 / 7 | [comprehension_report.md](comprehension_report.md) |
| 7 Critic | egm-design, egm-structural, egm-style | completed | 0 / 10 / 21 | [critic_report.md](critic_report.md) |
| 8 Intermediate Zoom Out | egm-zoom-out (×2) | completed | 0 / 7 / 6 | [intermediate_zoom_out_report.md](intermediate_zoom_out_report.md) |
| 9 Implementation Readiness | egm-implementation-readiness, egm-codebase-details, egm-style | completed | 0 / 13 / 12 | [implementation_readiness_report.md](implementation_readiness_report.md) |

## Consolidated action items and resolution

Disposition: **Fixed** = design changed; **Contested** = kept with reason;
**Deferred** = moved out of scope.

| # | Priority | Action | Source findings | Disposition |
| --- | --- | --- | --- | --- |
| A1 | 🟡 Major | Stale link window during debounce and async gzip | S5 M1; S6 #1, #7; S7 M4, N2, N17; S8 M1; S9 M2, N11 | **Fixed**: cache removed, link built at click time with `encodeStateParamSync()` (Change 1) |
| A2 | 🟡 Major | `LIMITS`/`clampNumber` duplicates input ranges; step and fallbacks undefined | S5 M2; S6 #5; S7 N1; S8 M2; S9 M3 | **Fixed**: inputs clamp; read back `valueAsNumber`; non-finite skipped (Change 2) |
| A3 | 🟡 Major | Unbounded `s` decode (gzip bomb) | S7 M5; S8 M3; S9 N3 | **Fixed**: 2,048-char limit |
| A4 | 🟡 Major | Non-object payload blanks the scene | S9 M4 | **Fixed**: `applyStatePayload` returns `false`; bootstrap calls `init()` |
| A5 | 🟡 Major | Prototype keys accepted as theme IDs | S9 M5 | **Fixed**: `Object.hasOwn` |
| A6 | 🟡 Major | Sprite caching unmeasured; "same pixels" overstated; rebuild timing unclear | S5 M3; S6 #2, #3; S7 M2, M9, N12; S8 M6, M7; S9 M11 | **Deferred**: Alternative C; Future Improvements with a profile trigger |
| A7 | 🟡 Major | Perf target inconsistent/untestable; 120 Hz speed | S7 M3 | **Deferred** with A6; 120 Hz listed as Non-Goal |
| A8 | 🟡 Major | Collapsible markup breaks `nextElementSibling`; collapsed controls tabbable | S7 M6; S8 M4; S9 M6, M7; S7 N11 | **Fixed**: button inside `<h4>`, lookup by `aria-controls`, `inert` on collapsed content |
| A9 | 🟡 Major | Keyboard users lose UI in fullscreen | S6 #4; S7 M6; S8 M4; S9 M9 | **Fixed**: `keydown` resets idle timer |
| A10 | 🟡 Major | Enter guard removes keyboard fullscreen; selector undefined | S7 M7; S8 M5; S9 M13 | **Fixed**: `INTERACTIVE_SELECTOR` defined; `F` shortcut added |
| A11 | 🟡 Major | `setPanelOpen` steals focus on load and canvas click | S6 #10; S9 M8; S7 N4 | **Fixed**: `focus` option, only user-initiated open/close moves focus |
| A12 | 🟡 Major | Reduced motion undecided / would re-randomize | S7 M10; S9 M10, N10 | **Fixed**: owner chose 25% shimmer, no drift; applied in `update()` live |
| A13 | 🟡 Major | Back-compat goal conflicts with clamping | S7 M8 | **Fixed**: G6 scoped to in-range links |
| A14 | 🟡 Major | No Risks & Mitigations section | S7 M1, N6 | **Fixed**: section added incl. `inert` support |
| A15 | 🟡 Major | No phases; tests have no pass criteria | S9 M1, M12 | **Fixed**: 3 phases with checkpoints; CUJs carry expected values |
| A16 | 🟢 Nit | Resize rescale jumps; zero-size guard | S7 N5; S9 N2 | **Fixed**: keep absolute positions, respawn out-of-bounds, regenerate if area +25% or old size 0 |
| A17 | 🟢 Nit | Toast ARIA redundant / not traced | S5 nit; S9 N6 | **Fixed**: `role="status"` only, clear-then-set, listed under P3/G3 |
| A18 | 🟢 Nit | Settings button label vs `aria-expanded` | S9 N5; S7 N16 | **Fixed**: label "Settings" |
| A19 | 🟢 Nit | Duplicated theme/background handlers | S5 nit; S9 N7 | **Fixed**: Change 5 |
| A20 | 🟢 Nit | Focus ring unspecified; focus claim overstated | S9 N1; S7 N3 | **Fixed**: exact rule given |
| A21 | 🟢 Nit | `APP_VERSION` bump | S9 N4 | **Fixed**: note that the pre-commit hook bumps it |
| A22 | 🟢 Nit | Undefined terms (Impeccable, EGM), structure (H3 without H2, rules), wording | S6 #8, #9, #11; S7 N7–N10, N13–N15, N18–N21; S9 N8, N9, N12 | **Fixed** in rewrite |
| A23 | 🟢 Nit | Keep unused `movies/` | S5 nit | **Contested**: owner keeps it for a future video feature |
| A24 | 🟢 Nit | Single rollback bundles all changes | S5 nit | **Fixed** by deferring sprites (A6); remaining changes are low-risk |

## Rejected as scope creep (per Stage 8)

Multi-minute fps protocols, a lower mobile particle cap, a 120 Hz speed
correction, a pixel-diff harness, a visible fullscreen button, and `focusin`
tracking for the idle timer.
