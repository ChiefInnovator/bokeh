// Copyright © 2025 Richard Crane
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const uiLayer = document.getElementById('ui-layer');
const settingsBtn = document.getElementById('settings-btn');
const themePanel = document.getElementById('theme-panel');
const closeBtn = document.getElementById('close-btn');
const themeList = document.getElementById('theme-list');
const backgroundList = document.getElementById('background-list');
const bgLayer = document.getElementById('bg-layer');
const particleCountInput = document.getElementById('particle-count');
const particleCountVal = document.getElementById('particle-count-val');
const particleSizeInput = document.getElementById('particle-size');
const particleSizeVal = document.getElementById('particle-size-val');
const animSpeedInput = document.getElementById('anim-speed');
const animSpeedVal = document.getElementById('anim-speed-val');
const brightnessInput = document.getElementById('brightness');
const brightnessVal = document.getElementById('brightness-val');
const driftInput = document.getElementById('drift');
const resetSettingsBtn = document.getElementById('reset-settings');
const copyDeepLinkBtn = document.getElementById('copy-deep-link');
const toastNotification = document.getElementById('toast-notification');
const toastMessage = document.getElementById('toast-message');
const versionFooter = document.getElementById('version-footer');
const panelCopyLinkBtn = document.getElementById('panel-copy-link');
const themeCurrent = document.getElementById('theme-current');
const backgroundCurrent = document.getElementById('background-current');

const APP_VERSION = 'v2026.11.02.0623';

const themeCategories = {
    Seasonal: ['fall', 'winter', 'spring', 'summer'],
    Holiday: ['christmas', 'hanukkah', 'halloween', 'valentine', 'easter', 'july4'],
    Nature: ['ocean', 'forest', 'desert', 'sunrise', 'sunset'],
    'Countries/Flags': ['american', 'brazil', 'china', 'england', 'france', 'russian', 'nordic'],
    Comics: ['superman', 'cheetah', 'wonderwoman', 'batman'],
    'Mood/Futuristic': ['cyberpunk', 'tron', 'warm']
};

let width, height;
let particles = [];
let inactivityTimer;
let currentTheme = 'christmas';
let currentBackground = 'none';
let reducedMotion = false;

const MAX_STATE_PARAM_LENGTH = 2048;
const INTERACTIVE_SELECTOR = 'button, input, select, textarea, a[href], [contenteditable]';

// Detect mobile device for performance optimization
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024;

// Configuration
let particleCount = isMobile ? 100 : 300; // Reduced for mobile, higher for desktop
let particleSizeScale = 1.0; // Multiplier for particle radius
let animSpeedScale = 1.0; // Multiplier for shimmer speed
let brightnessScale = 1.0; // Multiplier for particle brightness
let driftEnabled = false;

const DEFAULTS = {
    particleCount: isMobile ? 100 : 300,
    particleSizeScale: 1.0,
    animSpeedScale: 1.0,
    brightnessPercent: 100,
    driftEnabled: false
};

// Background Images
const backgroundImages = [
    { id: 'none', name: 'No Background', file: '' },
    { id: 'fall_gradient', name: 'Fall Gradient', file: 'backgrounds/fall.svg' },
    { id: 'spring_gradient', name: 'Spring Gradient', file: 'backgrounds/spring.svg' },
    { id: 'summer_gradient', name: 'Summer Gradient', file: 'backgrounds/summer.svg' },
    { id: 'winter_gradient', name: 'Winter Gradient', file: 'backgrounds/winter.svg' },
    { id: 'black', name: 'Black', file: 'backgrounds/black.svg' },
    { id: 'red', name: 'Red', file: 'backgrounds/red.svg' },
    { id: 'orange', name: 'Orange', file: 'backgrounds/orange.svg' },
    { id: 'green', name: 'Green', file: 'backgrounds/green.svg' },
    { id: 'blue', name: 'Blue', file: 'backgrounds/blue.svg' },
    { id: 'indigo', name: 'Indigo', file: 'backgrounds/indigo.svg' },
    { id: 'violet', name: 'Violet', file: 'backgrounds/violet.svg' },
    { id: 'christmas_forest', name: 'Christmas Forest', file: 'backgrounds/christmas_forest.jpg', thumb: 'backgrounds/thumbs/christmas_forest.jpg' },
    { id: 'boston_commons', name: 'Boston Commons', file: 'backgrounds/boston_commons_christmas_lights.jpg', thumb: 'backgrounds/thumbs/boston_commons_christmas_lights.jpg' },
    { id: 'boston_gazebo', name: 'Boston Gazebo', file: 'backgrounds/boston_charles_river_gazebo_winter.jpg', thumb: 'backgrounds/thumbs/boston_charles_river_gazebo_winter.jpg' },
    { id: 'boston_winter', name: 'Boston Winter', file: 'backgrounds/boston_winter.jpg', thumb: 'backgrounds/thumbs/boston_winter.jpg' },
    { id: 'boston_state_house_night', name: 'Old State House 2', file: 'backgrounds/boston_old_state_house_2.jpg', thumb: 'backgrounds/thumbs/boston_old_state_house_2.jpg' },
    { id: 'boston_state_house', name: 'Old State House', file: 'backgrounds/boston_old_state_house.jpg', thumb: 'backgrounds/thumbs/boston_old_state_house.jpg' },
    { id: 'groton', name: 'Groton, MA', file: 'backgrounds/groton_massachusetts.jpg', thumb: 'backgrounds/thumbs/groton_massachusetts.jpg' },
    { id: 'cranes_store', name: 'Crane\'s General Store', file: 'backgrounds/norman_rockwell_cranes_general_store.jpg', thumb: 'backgrounds/thumbs/norman_rockwell_cranes_general_store.jpg' },
    { id: 'hanukkah_menorahs', name: 'Hanukkah Menorahs', file: 'backgrounds/hanukkah_menorahs_eighth_night.jpg', thumb: 'backgrounds/thumbs/hanukkah_menorahs_eighth_night.jpg' }
];

// Color Palettes (H, S, L objects for dynamic alpha)
const themes = {
    fall: [
        { h: 24, s: 82, l: 48 },   // Rust orange
        { h: 32, s: 90, l: 58 },   // Amber
        { h: 18, s: 65, l: 34 },   // Cedar brown
        { h: 40, s: 25, l: 86 }    // Warm cream
    ],
    warm: [
        { h: 40, s: 100, l: 50 },   // Amber
        { h: 30, s: 100, l: 50 },   // Orange
        { h: 50, s: 100, l: 60 },   // Yellow-Gold
        { h: 40, s: 60, l: 90 }     // Warm White
    ],
    wonderwoman: [
        { h: 350, s: 100, l: 45 },  // Red
        { h: 220, s: 100, l: 40 },  // Blue
        { h: 45, s: 100, l: 50 },   // Gold
        { h: 0, s: 0, l: 100 }      // White
    ],
    american: [
        { h: 350, s: 100, l: 40 },  // Dark Red
        { h: 0, s: 0, l: 100 },     // White
        { h: 240, s: 100, l: 30 }   // Navy Blue
    ],
    batman: [
        { h: 0, s: 0, l: 20 },      // Dark Grey
        { h: 50, s: 100, l: 50 },   // Signal Yellow
        { h: 240, s: 30, l: 30 }    // Midnight Blue
    ],
    brazil: [
        { h: 120, s: 100, l: 35 },  // Green
        { h: 50, s: 100, l: 50 },   // Yellow
        { h: 230, s: 100, l: 40 },  // Blue
        { h: 0, s: 0, l: 100 }      // White
    ],
    cheetah: [
        { h: 45, s: 100, l: 50 },   // Gold
        { h: 30, s: 80, l: 40 },    // Tan/Orange
        { h: 20, s: 80, l: 20 },    // Dark Brown
        { h: 0, s: 0, l: 10 }       // Black
    ],
    china: [
        { h: 355, s: 100, l: 45 },  // Red
        { h: 45, s: 100, l: 50 }    // Yellow/Gold
    ],
    christmas: [
        { h: 0, s: 100, l: 50 },    // Pure Red
        { h: 120, s: 100, l: 40 },  // Pure Green
        { h: 50, s: 100, l: 50 },   // Gold
        { h: 0, s: 0, l: 100 }      // White
    ],
    hanukkah: [
        { h: 210, s: 100, l: 50 },  // Blue
        { h: 195, s: 100, l: 60 },  // Cyan/Light Blue
        { h: 240, s: 60, l: 70 },   // Soft Indigo
        { h: 0, s: 0, l: 90 }       // Silver/White
    ],
    cyberpunk: [
        { h: 180, s: 100, l: 50 },  // Cyan
        { h: 320, s: 100, l: 50 },  // Hot Pink
        { h: 280, s: 100, l: 50 },  // Purple
        { h: 120, s: 100, l: 50 }   // Neon Green
    ],
    ocean: [
        { h: 220, s: 100, l: 30 },  // Deep Blue
        { h: 180, s: 100, l: 40 },  // Teal
        { h: 190, s: 100, l: 60 },  // Aqua
        { h: 200, s: 20, l: 90 }    // White foam
    ],
    sunset: [
        { h: 270, s: 60, l: 40 },   // Violet
        { h: 320, s: 80, l: 50 },   // Magenta
        { h: 30, s: 100, l: 50 },   // Orange
        { h: 45, s: 100, l: 60 }    // Gold
    ],
    superman: [
        { h: 220, s: 100, l: 50 },  // Blue
        { h: 350, s: 100, l: 50 },  // Red
        { h: 50, s: 100, l: 50 }    // Yellow
    ],
    forest: [
        { h: 150, s: 100, l: 30 },  // Emerald
        { h: 90, s: 100, l: 50 },   // Lime
        { h: 50, s: 100, l: 50 },   // Gold
        { h: 60, s: 20, l: 90 }     // Soft White
    ],
    valentine: [
        { h: 340, s: 100, l: 70 },  // Pink
        { h: 350, s: 100, l: 50 },  // Red
        { h: 290, s: 60, l: 40 },   // Purple
        { h: 0, s: 0, l: 100 }      // White
    ],
    halloween: [
        { h: 30, s: 100, l: 50 },   // Orange
        { h: 270, s: 100, l: 40 },  // Purple
        { h: 100, s: 100, l: 50 },  // Slime Green
        { h: 0, s: 0, l: 80 }       // Ghostly White
    ],
    nordic: [
        { h: 200, s: 80, l: 80 },   // Ice Blue
        { h: 210, s: 20, l: 60 },   // Slate
        { h: 0, s: 0, l: 95 },      // Snow White
        { h: 30, s: 30, l: 80 }     // Pale Wood
    ],
    russian: [
        { h: 0, s: 0, l: 100 },     // White
        { h: 220, s: 100, l: 40 },  // Medium Blue
        { h: 355, s: 100, l: 45 }   // Red
    ],
    tron: [
        { h: 190, s: 100, l: 50 },  // Neon Cyan
        { h: 30, s: 100, l: 50 },   // Neon Orange
        { h: 0, s: 0, l: 100 },     // Pure White
        { h: 210, s: 100, l: 40 }   // Darker Blue
    ],
    easter: [
        { h: 330, s: 100, l: 80 },  // Pastel Pink
        { h: 190, s: 100, l: 80 },  // Pastel Blue
        { h: 120, s: 60, l: 80 },   // Pastel Green
        { h: 60, s: 100, l: 80 },   // Pastel Yellow
        { h: 260, s: 100, l: 85 }   // Lavender
    ],
    england: [
        { h: 355, s: 100, l: 45 },  // Red
        { h: 0, s: 0, l: 100 }      // White
    ],
    july4: [
        { h: 0, s: 100, l: 50 },    // Red
        { h: 0, s: 0, l: 100 },     // White
        { h: 240, s: 100, l: 50 }   // Blue
    ],
    france: [
        { h: 230, s: 90, l: 35 },   // Cobalt Blue
        { h: 0, s: 0, l: 100 },     // White
        { h: 350, s: 90, l: 50 }    // Red
    ],
    desert: [
        { h: 30, s: 60, l: 60 },    // Sand
        { h: 15, s: 70, l: 50 },    // Terracotta
        { h: 45, s: 80, l: 70 },    // Pale Gold
        { h: 190, s: 50, l: 70 }    // Pale Sky
    ],
    sunrise: [
        { h: 340, s: 80, l: 70 },   // Soft Pink
        { h: 20, s: 100, l: 70 },   // Peach
        { h: 50, s: 100, l: 80 },   // Pale Yellow
        { h: 260, s: 60, l: 70 }    // Morning Lavender
    ],
    spring: [
        { h: 140, s: 45, l: 72 },   // Mint
        { h: 295, s: 50, l: 78 },   // Soft lilac
        { h: 10, s: 55, l: 76 },    // Blush peach
        { h: 55, s: 90, l: 82 }     // Pale yellow
    ],
    winter: [
        { h: 195, s: 100, l: 85 },  // Icy Cyan
        { h: 210, s: 100, l: 75 },  // Frost Blue
        { h: 230, s: 80, l: 90 },   // Pale Lavender Blue
        { h: 0, s: 0, l: 100 }      // Snow White
    ],
    summer: [
        { h: 200, s: 90, l: 55 },   // Sky blue
        { h: 185, s: 95, l: 50 },   // Turquoise
        { h: 30, s: 95, l: 60 },    // Sunlight yellow
        { h: 12, s: 80, l: 60 }     // Coral
    ]
};

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        // Random position (Fixed in place)
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        
        // Larger radius for soft, photorealistic bokeh
        this.radius = (Math.random() * 50 + 20) * particleSizeScale; 
        this.driftSpeedX = (Math.random() - 0.5) * 0.1; // Gentle horizontal drift
        this.driftSpeedY = (Math.random() - 0.5) * 0.1; // Gentle vertical drift
        
        // Pick a random color from the current theme
        const theme = themes[currentTheme];
        this.color = theme[Math.floor(Math.random() * theme.length)];
        
        // Shimmer properties
        this.phase = Math.random() * Math.PI * 2; // Random starting point in sine wave
        this.speed = (0.01 + Math.random() * 0.02) * animSpeedScale; // Speed of the shimmer
        this.baseAlpha = 0.3 + Math.random() * 0.4; // Even brighter base transparency
        this.shimmerRange = 0.15; // Increased shimmer range
    }

    update() {
        // No x/y movement. Only update the shimmer phase.
        this.phase += this.speed * (reducedMotion ? 0.25 : 1);

        // Gentle drift if enabled (off when the OS asks for reduced motion)
        if (driftEnabled && !reducedMotion) {
            this.x += this.driftSpeedX;
            this.y += this.driftSpeedY;

            // Wrap around edges for continuous flow
            if (this.x < 0) this.x += width;
            if (this.x > width) this.x -= width;
            if (this.y < 0) this.y += height;
            if (this.y > height) this.y -= height;
        }
    }

    draw() {
        // Calculate oscillating alpha for shimmer effect
        // Math.sin creates a smooth wave between -1 and 1
        let alpha = this.baseAlpha + Math.sin(this.phase) * this.shimmerRange;
        alpha *= brightnessScale;
        
        // Adjust for background visibility
        let centerLightnessOffset = 40;
        let midLightnessOffset = 0;

        if (currentBackground !== 'none') {
            alpha *= 0.7; // Increased from 0.3 to 0.7 for better visibility
            // centerLightnessOffset = 10; // Kept high for glow
            // midLightnessOffset = -10; 
        }

        // Clamp alpha to valid range [0, 1]
        if (alpha < 0) alpha = 0;
        if (alpha > 1) alpha = 1;

        // Create a radial gradient for a photorealistic "soft light" look
        // Inner circle is brighter/whiter, fading out to the color, then to transparent
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        
        // Center: Brighter version of the color (higher lightness)
        gradient.addColorStop(0, `hsla(${this.color.h}, ${this.color.s}%, ${Math.min(100, this.color.l + centerLightnessOffset)}%, ${alpha})`);
        
        // Mid: The actual color
        gradient.addColorStop(0.5, `hsla(${this.color.h}, ${this.color.s}%, ${Math.max(0, this.color.l + midLightnessOffset)}%, ${alpha * 0.9})`);
        
        // Edge: Fade to transparent
        gradient.addColorStop(1, `hsla(${this.color.h}, ${this.color.s}%, ${Math.max(0, this.color.l + midLightnessOffset)}%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function buildDeepLink() {
    try {
        const encoded = encodeStateParamSync(buildStatePayload());
        const url = new URL(window.location.href);
        url.searchParams.set('s', encoded);
        return url.toString();
    } catch (err) {
        console.error('Failed to build deep link', err);
        return window.location.href;
    }
}

function resize() {
    const oldWidth = width;
    const oldHeight = height;
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    // Regenerate only when there was no previous size or the area grew a lot;
    // otherwise keep the scene (e.g. mobile address bar showing/hiding)
    if (!oldWidth || !oldHeight || width * height > oldWidth * oldHeight * 1.25) {
        init();
        return;
    }
    particles.forEach(p => {
        if (p.x > width) p.x = Math.random() * width;
        if (p.y > height) p.y = Math.random() * height;
    });
}

function init() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

// Particle Count Slider Logic
particleCountInput.addEventListener('input', (e) => {
    particleCount = parseInt(e.target.value);
    particleCountVal.textContent = particleCount;
    init();
});

// Particle Size Slider Logic
if (particleSizeInput) {
    particleSizeInput.addEventListener('input', (e) => {
        particleSizeScale = parseFloat(e.target.value);
        particleSizeVal.textContent = particleSizeScale.toFixed(1);
        init();
    });
}

// Animation Speed Slider Logic
if (animSpeedInput) {
    animSpeedInput.addEventListener('input', (e) => {
        animSpeedScale = parseFloat(e.target.value);
        animSpeedVal.textContent = animSpeedScale.toFixed(1);
        init();
    });
}

// Brightness Slider Logic
if (brightnessInput) {
    brightnessInput.addEventListener('input', (e) => {
        brightnessScale = parseInt(e.target.value, 10) / 100;
        brightnessVal.textContent = Math.round(brightnessScale * 100);
    });
}

// Drift Toggle Logic
if (driftInput) {
    driftInput.addEventListener('change', (e) => {
        driftEnabled = e.target.checked;
    });
}

// Reset Settings Button
if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetSettings();
    });
}

function encodeStateParamSync(state) {
    const json = JSON.stringify(state);
    const data = new TextEncoder().encode(json);
    return toBase64Url(data);
}

// Copy Deep Link
function onCopyDeepLinkClick(e) {
    e.stopPropagation();

    // Build at click time so the link always matches the visible state
    const linkStr = buildDeepLink();

    // Try async clipboard first, fallback to legacy execCommand
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(linkStr)
            .then(() => showCopyStatus(true))
            .catch(() => fallbackCopy(linkStr));
    } else {
        fallbackCopy(linkStr);
    }
}

[copyDeepLinkBtn, panelCopyLinkBtn].forEach(btn => {
    if (btn) btn.addEventListener('click', onCopyDeepLinkClick);
});

function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    let success = false;
    try {
        success = document.execCommand('copy');
    } catch (err) {
        success = false;
    }
    document.body.removeChild(ta);
    showCopyStatus(success);
}

function showCopyStatus(success) {
    // On failure, put the link in the address bar so it can be copied by hand
    if (!success) {
        history.replaceState(null, '', buildDeepLink());
    }
    if (toastNotification && toastMessage) {
        // Clear first so screen readers re-announce a repeated message
        toastMessage.textContent = '';
        requestAnimationFrame(() => {
            toastMessage.textContent = success
                ? 'Link copied to clipboard'
                : 'Couldn\'t copy. The link is now in the address bar.';
        });
        toastNotification.classList.remove('hidden');
        
        // Clear any existing timer to prevent early hiding if clicked rapidly
        if (toastNotification.dataset.timer) {
            clearTimeout(parseInt(toastNotification.dataset.timer));
        }
        
        const timer = setTimeout(() => {
            toastNotification.classList.add('hidden');
        }, 3000);
        
        toastNotification.dataset.timer = timer;
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // 'lighter' (additive blending) is key for the glowing light effect
    // Always use 'lighter' to ensure visibility against bright backgrounds
    ctx.globalCompositeOperation = 'lighter';

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
}

function resetSettings() {
    particleCount = DEFAULTS.particleCount;
    particleCountInput.value = DEFAULTS.particleCount;
    particleCountVal.textContent = DEFAULTS.particleCount;

    particleSizeScale = DEFAULTS.particleSizeScale;
    if (particleSizeInput) particleSizeInput.value = DEFAULTS.particleSizeScale;
    if (particleSizeVal) particleSizeVal.textContent = DEFAULTS.particleSizeScale.toFixed(1);

    animSpeedScale = DEFAULTS.animSpeedScale;
    if (animSpeedInput) animSpeedInput.value = DEFAULTS.animSpeedScale;
    if (animSpeedVal) animSpeedVal.textContent = DEFAULTS.animSpeedScale.toFixed(1);

    brightnessScale = DEFAULTS.brightnessPercent / 100;
    if (brightnessInput) brightnessInput.value = DEFAULTS.brightnessPercent;
    if (brightnessVal) brightnessVal.textContent = DEFAULTS.brightnessPercent;

    driftEnabled = DEFAULTS.driftEnabled;
    if (driftInput) driftInput.checked = DEFAULTS.driftEnabled;

    init();
}

// Event Listeners
window.addEventListener('resize', resize);

// UI Logic
function isPanelOpen() {
    return !themePanel.classList.contains('panel-hidden');
}

function setPanelOpen(open, { focus = false } = {}) {
    themePanel.classList.toggle('panel-hidden', !open);
    themePanel.inert = !open;
    settingsBtn.setAttribute('aria-expanded', String(open));
    if (focus) {
        (open ? closeBtn : settingsBtn).focus();
    }
}

settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent canvas click
    // e.detail is 0 for keyboard activation; only then move focus into the panel
    setPanelOpen(!isPanelOpen(), { focus: e.detail === 0 });
});

closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setPanelOpen(false, { focus: true });
});

const THEME_NAMES = {
    warm: 'Warm City Lights',
    july4: 'Fourth of July',
    wonderwoman: 'Wonder Woman',
    fall: 'Fall Harvest',
    spring: 'Spring Bloom',
    summer: 'Summer Sky',
    winter: 'Winter Frost',
    nordic: 'Norway'
};

function themeDisplayName(key) {
    return THEME_NAMES[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

// Generate Theme List
function renderThemeCategory(title, keys) {
    if (!keys.length) return;

    const category = document.createElement('div');
    category.className = 'theme-category';

    const heading = document.createElement('h5');
    heading.className = 'theme-category-title';
    heading.textContent = title;
    category.appendChild(heading);

    keys.forEach(key => {
        if (!themes[key]) return;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'theme-btn';
        btn.dataset.key = key;
        btn.setAttribute('aria-pressed', String(key === currentTheme));
        if (key === currentTheme) btn.classList.add('active');

        const label = document.createElement('span');
        label.textContent = themeDisplayName(key);
        btn.appendChild(label);

        // Palette preview: one dot per theme color
        const swatches = document.createElement('span');
        swatches.className = 'swatches';
        swatches.setAttribute('aria-hidden', 'true');
        themes[key].forEach(c => {
            const dot = document.createElement('span');
            dot.className = 'swatch';
            dot.style.background = `hsl(${c.h}, ${c.s}%, ${c.l}%)`;
            swatches.appendChild(dot);
        });
        btn.appendChild(swatches);
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            setThemeById(key);
        });
        
        category.appendChild(btn);
    });

    themeList.appendChild(category);
}

function generateThemeList() {
    themeList.innerHTML = '';

    const categorized = new Set();
    Object.values(themeCategories).forEach(arr => arr.forEach(key => categorized.add(key)));

    // Render defined categories in order
    Object.entries(themeCategories).forEach(([title, keys]) => {
        renderThemeCategory(title, keys);
    });

    // Render any remaining themes under Other
    const remaining = Object.keys(themes)
        .sort()
        .filter(key => !categorized.has(key));
    if (remaining.length) {
        renderThemeCategory('Other', remaining);
    }
}

function setThemeById(themeId) {
    if (!themes[themeId]) return;
    currentTheme = themeId;
    init();
    markActiveTheme(themeId);
}

// Generate Background List
function generateBackgroundList() {
    backgroundImages.forEach(bg => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'theme-btn'; // Reuse theme button styling
        btn.dataset.id = bg.id;
        btn.setAttribute('aria-pressed', String(bg.id === currentBackground));
        if (bg.id === currentBackground) btn.classList.add('active');

        const label = document.createElement('span');
        label.textContent = bg.name;
        btn.appendChild(label);

        // Small preview; photos use pre-sized thumbnails, not the multi-MB originals
        const thumb = document.createElement('span');
        thumb.className = 'bg-thumb';
        thumb.setAttribute('aria-hidden', 'true');
        const src = bg.thumb || bg.file;
        if (src) thumb.style.backgroundImage = `url('${src}')`;
        btn.appendChild(thumb);
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            setBackgroundById(bg.id);
        });
        
        backgroundList.appendChild(btn);
    });
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

function toBase64Url(uint8arr) {
    let binary = '';
    uint8arr.forEach(byte => { binary += String.fromCharCode(byte); });
    const b64 = btoa(binary);
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str) {
    let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

async function decompressToString(uint8arr) {
    // Check for GZIP magic bytes (0x1F 0x8B)
    if (uint8arr.length > 2 && uint8arr[0] === 0x1f && uint8arr[1] === 0x8b) {
        if (typeof DecompressionStream === 'undefined') {
            console.warn('DecompressionStream not supported, cannot decompress state.');
            return '{}';
        }
        try {
            // Pipe instead of awaiting writer.write(), which waits on the unread readable side
            const stream = new Blob([uint8arr]).stream().pipeThrough(new DecompressionStream('gzip'));
            return await new Response(stream).text();
        } catch (err) {
            console.error('Decompression failed', err);
            return '{}';
        }
    } else {
        // Not gzip, assume plain text
        return new TextDecoder().decode(uint8arr);
    }
}

async function decodeStateParam(param) {
    const bytes = fromBase64Url(param);
    const text = await decompressToString(bytes);
    return JSON.parse(text);
}

function buildStatePayload() {
    return {
        theme: currentTheme,
        background: currentBackground,
        particleCount,
        particleSizeScale,
        animSpeedScale,
        brightnessPercent: Math.round(brightnessScale * 100),
        driftEnabled
    };
}

// Let the range input clamp to min/max and snap to step; null if not a finite number
function setRangeFromState(input, value) {
    if (!input || typeof value !== 'number' || !Number.isFinite(value)) return null;
    input.value = value;
    return input.valueAsNumber;
}

function applyStatePayload(state) {
    if (!state || typeof state !== 'object' || Array.isArray(state)) return false;

    const count = setRangeFromState(particleCountInput, state.particleCount);
    if (count !== null) {
        particleCount = count;
        particleCountVal.textContent = particleCount;
    }

    const size = setRangeFromState(particleSizeInput, state.particleSizeScale);
    if (size !== null) {
        particleSizeScale = size;
        particleSizeVal.textContent = particleSizeScale.toFixed(1);
    }

    const speed = setRangeFromState(animSpeedInput, state.animSpeedScale);
    if (speed !== null) {
        animSpeedScale = speed;
        animSpeedVal.textContent = animSpeedScale.toFixed(1);
    }

    const brightness = setRangeFromState(brightnessInput, state.brightnessPercent);
    if (brightness !== null) {
        brightnessScale = brightness / 100;
        brightnessVal.textContent = brightness;
    }

    if (typeof state.driftEnabled === 'boolean') {
        driftEnabled = state.driftEnabled;
        if (driftInput) driftInput.checked = driftEnabled;
    }

    if (typeof state.theme === 'string' && Object.hasOwn(themes, state.theme)) {
        currentTheme = state.theme;
        markActiveTheme(currentTheme);
    }

    if (typeof state.background === 'string' && backgroundImages.some(b => b.id === state.background)) {
        setBackgroundById(state.background);
    }

    init();
    return true;
}

async function applyDeepLinkFromUrl() {
    const url = new URL(window.location.href);
    const encoded = url.searchParams.get('s');
    if (!encoded || encoded.length > MAX_STATE_PARAM_LENGTH) return false;
    try {
        const state = await decodeStateParam(encoded);
        if (!applyStatePayload(state)) return false;
        // Hide panel for an immersive start
        setPanelOpen(false);
        setTimeout(() => {
            uiLayer.classList.add('hidden');
        }, 2200);
        return true;
    } catch (err) {
        console.log('Failed to apply deep link', err);
        return false;
    }
}

function setBackgroundById(bgId) {
    currentBackground = bgId;
    const bg = backgroundImages.find(b => b.id === bgId);
    if (bg) {
        if (bg.id === 'none') {
            bgLayer.style.backgroundImage = 'none';
        } else {
            bgLayer.style.backgroundImage = `url('${bg.file}')`;
        }
    }

    backgroundList.querySelectorAll('.theme-btn').forEach(b => {
        const active = b.dataset.id === bgId;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
    });
    if (backgroundCurrent && bg) backgroundCurrent.textContent = bg.name;
}

function markActiveTheme(themeId) {
    themeList.querySelectorAll('.theme-btn').forEach(b => {
        const active = b.dataset.key === themeId;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', String(active));
    });
    if (themeCurrent) themeCurrent.textContent = themeDisplayName(themeId);
}

canvas.addEventListener('click', (e) => {
    // Close menu if open, otherwise toggle fullscreen
    if (isPanelOpen()) {
        setPanelOpen(false);
    } else {
        toggleFullscreen();
    }
});

window.addEventListener('keydown', (e) => {
    const onControl = e.target instanceof Element && e.target.closest(INTERACTIVE_SELECTOR);
    if ((e.key === 'Enter' || e.key === 'f' || e.key === 'F') && !onControl) {
        toggleFullscreen();
    }
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !onControl) {
        const keys = Object.values(themeCategories).flat();
        const step = e.key === 'ArrowRight' ? 1 : -1;
        const next = keys[(keys.indexOf(currentTheme) + step + keys.length) % keys.length];
        setThemeById(next);
    }
    if (e.key === 'Escape' && isPanelOpen()) {
        setPanelOpen(false, { focus: true });
    }
});

// Fullscreen UI Logic
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    uiLayer.classList.remove('hidden');
    document.body.style.cursor = 'default';
    
    if (document.fullscreenElement) {
        inactivityTimer = setTimeout(() => {
            // Only hide if menu is closed
            if (themePanel.classList.contains('panel-hidden')) {
                uiLayer.classList.add('hidden');
                document.body.style.cursor = 'none';
            }
        }, 2000); // Hide after 2 seconds of inactivity
    }
}

document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        resetInactivityTimer();
    } else {
        clearTimeout(inactivityTimer);
        uiLayer.classList.remove('hidden');
        document.body.style.cursor = 'default';
    }
});

window.addEventListener('mousemove', resetInactivityTimer);
window.addEventListener('mousedown', resetInactivityTimer);
window.addEventListener('touchstart', resetInactivityTimer);
window.addEventListener('keydown', resetInactivityTimer);

// Collapsible Sections
function setupCollapsibles() {
    const headers = document.querySelectorAll('.collapsible-header');
    
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const content = document.getElementById(header.getAttribute('aria-controls'));
            const collapsed = header.classList.toggle('collapsed');
            header.setAttribute('aria-expanded', String(!collapsed));
            content.classList.toggle('collapsed', collapsed);
            // Keep collapsed controls out of the Tab order
            content.inert = collapsed;
        });
    });
}

function setupReducedMotion() {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = (matches) => {
        reducedMotion = matches;
        // Drift has no effect under reduced motion, so say so instead of a dead toggle
        if (driftInput) driftInput.disabled = matches;
        const note = document.getElementById('drift-note');
        if (note) note.hidden = !matches;
    };
    apply(query.matches);
    query.addEventListener('change', (e) => apply(e.matches));
}

async function bootstrap() {
    setupReducedMotion();
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    // The HTML default is the desktop value; match the slider to this device's default
    particleCountInput.value = particleCount;
    particleCountVal.textContent = particleCount;
    generateThemeList();
    generateBackgroundList();
    markActiveTheme(currentTheme);
    setBackgroundById(currentBackground);
    setupCollapsibles();
    
    if (versionFooter) {
        versionFooter.textContent = `Version ${APP_VERSION}`;
    }

    const applied = await applyDeepLinkFromUrl();
    if (!applied) {
        init();
    }
    animate();
}

bootstrap();