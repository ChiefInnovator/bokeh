# Bokeh Screensaver Web App

A beautiful, photorealistic animated bokeh screensaver that runs directly in your web browser.

## Features

*   **Photorealistic Effect**: Uses HTML5 Canvas and radial gradients to create soft, glowing, out-of-focus light effects.
*   **Animated Shimmer**: Particles gently pulse and shimmer in place, creating a calming atmosphere.
*   **Background Selection**: Choose from scenic backgrounds (Boston Winter, Old State House, Boston Commons, Gazebo, Groton MA, Crane's General Store, Christmas Forest, Hanukkah Menorahs), seasonal gradients (Fall, Winter, Spring, Summer), or solid colors (White, Black, and ROYGBIV). Backgrounds feature a cinematic depth-of-field blur and vignette effect.
*   **Modern UI**: A sleek, glassmorphism-style side panel with collapsible sections for easy customization.
*   **Customizable Bokeh**: Fine-tune the look with sliders for particle count, size, shimmer speed, brightness, and a drift toggle, plus a reset-to-defaults button.
*   **Deep Linking**: Share your custom configuration with a single click. The "Copy Deep Link" button generates a URL containing all your current settings (theme, background, sliders).
*   **Multiple Themes**: Choose from a variety of color palettes, including the four seasons (Fall Harvest, Winter, Spring Bloom, Summer Sky) alongside holiday and vibe sets (Christmas, Hanukkah, Halloween, Cyberpunk, Warm City Lights, Valentine, Tron, Desert, Sunrise/Sunset, and more).
*   **Fullscreen Mode**: Click anywhere on the screen or press **Enter** to toggle fullscreen. The UI automatically hides after 2 seconds of inactivity for an immersive experience.
*   **Responsive & Mobile Optimized**: Automatically adjusts to fit any screen size. Detects mobile devices (including large phones like iPhone Pro Max) and optimizes particle count for smooth performance.
*   **Version Tracking**: Displays the current build version (date/time) in the settings panel.

## Controls

- **Particle Count**: 50–1000
- **Particle Size**: 0.5x–2.0x
- **Shimmer Speed**: 0.1x–3.0x
- **Brightness**: 20%–200%
- **Drift**: toggle on/off gentle movement
- **Reset**: one click to restore defaults
- **Share**: Copy a unique link to your current setup

## Themes (by category)

- **Seasonal**: Fall Harvest, Winter Frost, Spring Bloom, Summer Sky
- **Holiday**: Christmas, Hanukkah, Halloween, Valentine, Easter, Fourth of July
- **Nature**: Ocean, Forest, Desert, Sunrise, Sunset
- **Countries/Flags**: American, Brazil, China, England, France, Russian, Norway
- **Comics**: Superman, Cheetah, Wonder Woman, Batman
- **Mood/Futuristic**: Cyberpunk, Tron, Warm City Lights

## Usage

1.  Clone the repository or download the files.
2.  Open `index.html` in any modern web browser.
3.  Click the **settings button** (gear icon) in the top right to open the side panel and select a theme.
4.  Click the **link icon** to copy a shareable URL of your current design.
5.  Click the screen (outside the menu) to enter fullscreen mode.

## Technologies

*   HTML5
*   CSS3
*   Vanilla JavaScript (No external libraries required)

## Development

This project uses a **Git Pre-Commit Hook** to automatically update the version number in `js/app.js` before every commit.
- The version format is `vYYYY.MM.DD.HHMM` (Calendar Versioning).
- The hook is located in `.git/hooks/pre-commit`.

## Copyright & Attribution

Copyright © 2025 Richard Crane

This project was vibe coded with GitHub Copilot for Visual Studio Code using GPT-5.1-Codex-Max (Preview) and Gemini 3 Pro (Preview).
