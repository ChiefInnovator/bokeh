---
name: Bokeh Screensaver
description: Photographic bokeh light in the browser; the interface is smoked glass that stays out of focus until called.
colors:
  void: "#050505"
  smoked-glass: "rgba(20, 20, 20, 0.75)"
  toast-glass: "rgba(20, 20, 20, 0.85)"
  lens-cap: "rgba(0, 0, 0, 0.3)"
  light-full: "#ffffff"
  light-primary: "rgba(255, 255, 255, 0.8)"
  light-secondary: "rgba(255, 255, 255, 0.5)"
  light-faint: "rgba(255, 255, 255, 0.3)"
  hairline: "rgba(255, 255, 255, 0.1)"
  rim: "rgba(255, 255, 255, 0.2)"
  rim-active: "rgba(255, 255, 255, 0.4)"
  fill-rest: "rgba(255, 255, 255, 0.05)"
  fill-hover: "rgba(255, 255, 255, 0.15)"
  fill-active: "rgba(255, 255, 255, 0.2)"
typography:
  title:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 300
    letterSpacing: "1px"
  label:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.8rem"
    letterSpacing: "1px"
  body:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.95rem"
  control:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "0.9rem"
  meta:
    fontFamily: "ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "0.75rem"
    letterSpacing: "0.5px"
rounded:
  hairline: "2px"
  sm: "4px"
  md: "8px"
  sheet: "16px"
  pill: "50px"
  circle: "50%"
spacing:
  xs: "8px"
  sm: "10px"
  md: "15px"
  lg: "20px"
  xl: "25px"
components:
  icon-button:
    backgroundColor: "{colors.lens-cap}"
    textColor: "{colors.light-full}"
    rounded: "{rounded.circle}"
    padding: "10px"
  icon-button-hover:
    backgroundColor: "{colors.fill-rest}"
  list-button:
    backgroundColor: "{colors.fill-rest}"
    textColor: "{colors.light-primary}"
    rounded: "{rounded.md}"
    padding: "12px 15px"
  list-button-hover:
    backgroundColor: "{colors.fill-hover}"
    textColor: "{colors.light-full}"
  list-button-active:
    backgroundColor: "{colors.fill-active}"
    textColor: "{colors.light-full}"
  side-panel:
    backgroundColor: "{colors.smoked-glass}"
    width: "300px"
    padding: "20px"
  panel-icon-button:
    textColor: "{colors.light-secondary}"
    rounded: "{rounded.circle}"
    size: "32px"
  toast:
    backgroundColor: "{colors.toast-glass}"
    textColor: "{colors.light-full}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
---

# Design System: Bokeh Screensaver

## Overview

**Creative North Star: "The Open Aperture"**

The screen is a lens wide open on a field of light. The bokeh canvas is the subject and owns every pixel of color; the interface is the lens housing: dark, smoked glass that sits at the edge of the frame and stays out of focus until someone reaches for it. When the panel is open it reads like a camera's settings screen: monochrome, precise, labeled values, no ornament.

Color in the UI is forbidden. All chrome is white light at measured opacities over near-black glass, so whatever theme is running (Christmas reds, Cyberpunk neons, pastel Easter) is never fought by the controls. Depth comes from blur and translucency, the same optics as the bokeh itself, not from color or heavy shadow.

The interface earns its presence only on demand: it fades in fullscreen after two seconds idle, deep links open with the panel closed, and every control is a quiet white-on-smoke element that brightens on hover or selection.

**Key Characteristics:**
- Monochrome white-alpha UI over translucent near-black glass.
- Backdrop blur as the depth language (5px buttons, 10px toast, 15px panel).
- Uppercase tracked labels for structure; sentence-case values.
- One right-edge panel (300px), two circular icon buttons top-right, one pill toast bottom-center.
- Motion is slow and soft: 0.2–0.5s eases, one springy curve (`cubic-bezier(0.2, 0.8, 0.2, 1)`) for panel and toast.

## Colors

A strictly achromatic interface: near-black glass and white light at stepped opacities. All hue belongs to the bokeh themes.

### Neutral

- **Void** (`void`): page and background-layer fill behind the canvas; the "no background" state.
- **Smoked Glass** (`smoked-glass`): the settings panel surface, always paired with 15px backdrop blur.
- **Toast Glass** (`toast-glass`): denser glass for the transient toast so it reads over bright themes.
- **Lens Cap** (`lens-cap`): resting fill of the floating circular icon buttons.
- **Full Light** (`light-full`): icons, active and hovered text, slider thumbs.
- **Primary Light** (`light-primary`): control labels and resting list-button text.
- **Secondary Light** (`light-secondary`): section headers and close icon at rest.
- **Faint Light** (`light-faint`): borders on keyboard hints and thumbnails only; never text (fails contrast on the panel).
- **Hairline** (`hairline`): dividers, panel left edge, toast border.
- **Rim** (`rim`): icon-button borders, slider tracks.
- **Active Rim** (`rim-active`): border of the selected theme or background.

### Named Rules

**The No-Hue Rule.** UI chrome never uses a chromatic color. If a control needs emphasis, raise its white opacity; never tint it.

**The Opacity Ladder Rule.** Text and fills move only along the existing steps (0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.8, 1.0). Do not introduce in-between values.

## Typography

**Body Font:** the platform UI face (`system-ui`: SF Pro on Apple, Segoe UI on Windows, Roboto on Android)
**Label/Mono Font:** `ui-monospace` (version footer only)

**Character:** The device's own interface type, kept light and tracked so it recedes like engraving on a lens barrel. No webfont download; the bokeh is the display voice, not the type.

### Hierarchy

- **Title** (300, 1.1rem, 1px tracking, uppercase): panel header "Settings".
- **Label** (0.8rem, 1px tracking, uppercase): collapsible section headers ("Lights", "Theme", "Background"); when collapsed they show the current choice in sentence case at 0.8 opacity. Theme category titles use 0.85rem, 0.02em, 0.5 opacity.
- **Body** (0.95rem, capitalized): theme and background list buttons; toast text.
- **Control** (0.9rem): slider and checkbox labels with live values.
- **Meta** (monospace, 0.75rem, 0.5px tracking): version footer.

### Named Rules

**The Engraving Rule.** Structural text (titles, section headers, categories) is uppercase and letter-spaced; anything the user reads as a value or choice is not.

## Layout

Full-bleed canvas fills the viewport with no scroll. At 480px and below the panel becomes a bottom sheet (full width, 55vh, 16px top corners) so the top of the scene stays visible while adjusting. Chrome is absolutely positioned on a pass-through layer: icon buttons at 20px from the top-right (settings at right 20px, link at right 70px), the side panel docked full-height to the right edge (300px wide, 20px padding), and the toast centered 30px above the bottom. Panel content scrolls internally with a thin 4px scrollbar at 0.2 white, so its length stays visible. Lights starts open; Theme and Background start collapsed. Spacing steps are 8, 10, 15, 20, and 25px; sections are separated by 25px, controls by 10px vertical padding.

## Elevation & Depth

Depth is optical, not structural: translucency plus backdrop blur, with one soft shadow per floating surface. The background photo itself is blurred 4px, scaled 1.04, and vignetted so the scene sits further out of focus than the lights.

### Shadow Vocabulary

- **Panel cast** (`box-shadow: -5px 0 25px rgba(0,0,0,0.5)`): the side panel's left-edge shadow over the canvas.
- **Toast lift** (`box-shadow: 0 5px 15px rgba(0,0,0,0.3)`): toast separation from bright scenes.
- **Selection glow** (`box-shadow: 0 0 15px rgba(255,255,255,0.1)`): selected list button.
- **Thumb glow** (`box-shadow: 0 0 10px rgba(255,255,255,0.5)`): slider thumb, echoing a point of light.

### Named Rules

**The Blur-Is-Depth Rule.** A new floating surface gets glass (translucent dark fill plus backdrop blur) before it gets a shadow.

## Shapes

Circles and soft rectangles only, echoing bokeh discs. Floating icon buttons are full circles; list buttons have gently rounded corners (8px); the toast is a pill (50px); slider tracks are 4px tall with 2px rounding and 16px circular thumbs. Borders are 1px white hairlines or none.

## Components

### Buttons

Quiet until touched; selection is shown by more light, not color.

- **Icon button (link, settings):** circle, Lens Cap fill, 1px Rim border, 10px padding, 5px backdrop blur. Hover: fill steps to 0.1 white; the link button scales to 1.05, the settings gear rotates 90°.
- **List button (themes, backgrounds, reset):** full width, 8px corners, 12px × 15px padding, 0.05 white fill, transparent border; label left, preview right. Hover: 0.15 fill, full-white text, no movement. Active: 0.2 fill, Active Rim border, bold, selection glow, `aria-pressed="true"`.
- **Panel icon button (copy link, close):** 32px circle, no fill, Secondary Light stroke icons at 18px; hover adds 0.1 white fill and full-white icon. Copy link lives in the panel header so sharing never requires closing the panel.
- **Focus:** a 2px white outline at 2px offset on `:focus-visible` for every button and input (added by the hardening plan).

### Inputs / Fields

- **Range slider:** 4px Rim track, 16px white circular thumb with thumb glow; label above shows the live value.
- **Checkbox:** native 18px box with white accent color, label left, control right.

### Previews

- **Theme palette dots:** one 12px circle per theme color, overlapping by 3px, ringed in Smoked Glass. The only place hue appears in the chrome, because it describes content, not UI.
- **Background thumbnail:** 36 × 24px, 4px corners, Rim border; photos use 96px pre-sized thumbnails in `backgrounds/thumbs/`, never the full images.

### Side Panel (signature component)

Full-height right drawer of Smoked Glass with 15px blur, hairline left border, and the panel cast shadow. It slides in from the right over 0.4s on the springy curve. Three collapsible sections (Lights, Theme, Background) with uppercase headers and a chevron that rotates -90° when collapsed; a keyboard hint ("Click the scene or press F for fullscreen. ← → change theme.") and the version footer sit under a hairline at the bottom.

### Toast

Pill of Toast Glass with 10px blur and hairline border, centered near the bottom, rising 20px as it fades in, auto-hiding after 3 seconds.

## Do's and Don'ts

### Do:

- **Do** keep every UI surface achromatic (The No-Hue Rule) so all 29 themes read cleanly. Content previews (palette dots, thumbnails) are the one exception.
- **Do** build new floating surfaces as glass: dark translucent fill plus backdrop blur (The Blur-Is-Depth Rule).
- **Do** show state with white opacity steps: rest 0.05, hover 0.15, active 0.2 with a 0.4 rim.
- **Do** keep chrome at the screen edges; the center of the canvas belongs to the light field.
- **Do** honor reduced motion: transitions near-instant, shimmer slowed, drift off.

### Don't:

- **Don't** tint controls with theme colors or add brand accent colors.
- **Don't** place persistent UI over the center of the canvas or add chrome that stays visible in idle fullscreen.
- **Don't** use hard, opaque panels or heavy drop shadows; they break the out-of-focus optics.
- **Don't** remove focus outlines without a visible `:focus-visible` replacement.
- **Don't** offer light backgrounds (white, pale yellow); additive light disappears into them.
- **Don't** use `text-transform: capitalize` on names; write the proper case in data.
