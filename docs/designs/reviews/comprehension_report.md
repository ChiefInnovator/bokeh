## Comprehension Review: Bokeh Screensaver Architecture and Hardening Plan

### What this proposes

The plan fixes and hardens a one-page canvas screensaver without adding features or dependencies. Six changes: (1) deep link stays current via a shared 300 ms debounce, copy builds synchronously if pending; (2) deep-link numerics clamped to slider ranges, unknown IDs fall back; (3) accessibility — header buttons with aria-expanded, close label, inert hidden panel, focus management, Enter guard, focus rings, reduced motion; (4) per-theme-color sprites drawn with globalAlpha; (5) resize rescales positions; (6) dead CSS removed. Deep-link format unchanged.

### How the existing system works, per this document

Static GitHub Pages site (`index.html`, `js/app.js`, `css/style.css`). Canvas with additive blending over a blurred CSS background. Global script with theme/background tables and global state; `animate()` draws each particle as a fresh radial gradient per frame. Settings shared via `?s=` (base64url JSON, gzip when supported). Copy uses a cached link rebuilt only in `init()`, which also runs on every resize. Panel hidden via transform; headers are clickable `<h4>`; global Enter toggles fullscreen.

### Findings

1. **Major — Change 1 / app.js plan:** "synchronous fallback" unexplained; doc only describes async gzip. Name `encodeStateParamSync()` (uncompressed JSON, still decodable) and define "pending".
2. **Major — Change 4:** when sprites rebuild is unclear (pseudocode says theme change or init; plan says init only; doc never says theme selection calls `init()`).
3. **Major — Change 4:** "same pixels" argument omits the +40 center lightness offset and the 0.7 background alpha factor.
4. **Major — CUJ 3:** keyboard users in fullscreen: auto-hide timer only resets on mouse/touch, so UI stays hidden while tabbing.
5. **Nit — Change 2:** `LIMITS` described as min/max/step then min/max only.
6. **Nit — CUJ 2:** brightness 20–200 range never stated; `brightnessPercent` vs `brightnessScale` unexplained.
7. **Nit — Change 1:** 300 ms vs current 500 ms not explained.
8. **Nit — Non-Goals:** "Impeccable design review" undefined.
9. **Nit — Provenance:** "EGM" undefined.
10. **Nit — app.js plan:** why `applyDeepLinkFromUrl` touches the panel is unexplained.
11. **Nit — Rollout:** branch flow not linked.
