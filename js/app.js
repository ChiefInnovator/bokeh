const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const themeSelector = document.getElementById('theme-selector');
const uiLayer = document.getElementById('ui-layer');

let width, height;
let particles = [];
let inactivityTimer;

// Configuration
const PARTICLE_COUNT = 300; // Increased for denser bokeh

// Color Palettes (H, S, L objects for dynamic alpha)
const themes = {
    warm: [
        { h: 40, s: 100, l: 50 },   // Amber
        { h: 30, s: 100, l: 50 },   // Orange
        { h: 50, s: 100, l: 60 },   // Yellow-Gold
        { h: 40, s: 60, l: 90 }     // Warm White
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
    july4: [
        { h: 0, s: 100, l: 50 },    // Red
        { h: 0, s: 0, l: 100 },     // White
        { h: 240, s: 100, l: 50 }   // Blue
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
    ]
};

let currentTheme = 'christmas';

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        // Random position (Fixed in place)
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        
        // Larger radius for soft, photorealistic bokeh
        this.radius = Math.random() * 50 + 20; 
        
        // Pick a random color from the current theme
        const theme = themes[currentTheme];
        this.color = theme[Math.floor(Math.random() * theme.length)];
        
        // Shimmer properties
        this.phase = Math.random() * Math.PI * 2; // Random starting point in sine wave
        this.speed = 0.01 + Math.random() * 0.02; // Speed of the shimmer
        this.baseAlpha = 0.3 + Math.random() * 0.4; // Even brighter base transparency
        this.shimmerRange = 0.15; // Increased shimmer range
    }

    update() {
        // No x/y movement. Only update the shimmer phase.
        this.phase += this.speed;
    }

    draw() {
        // Calculate oscillating alpha for shimmer effect
        // Math.sin creates a smooth wave between -1 and 1
        let alpha = this.baseAlpha + Math.sin(this.phase) * this.shimmerRange;
        
        // Clamp alpha to valid range [0, 1]
        if (alpha < 0) alpha = 0;
        if (alpha > 1) alpha = 1;

        // Create a radial gradient for a photorealistic "soft light" look
        // Inner circle is brighter/whiter, fading out to the color, then to transparent
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        
        // Center: Brighter version of the color (higher lightness)
        gradient.addColorStop(0, `hsla(${this.color.h}, ${this.color.s}%, ${Math.min(100, this.color.l + 40)}%, ${alpha})`);
        
        // Mid: The actual color
        gradient.addColorStop(0.5, `hsla(${this.color.h}, ${this.color.s}%, ${this.color.l}%, ${alpha * 0.9})`);
        
        // Edge: Fade to transparent
        gradient.addColorStop(1, `hsla(${this.color.h}, ${this.color.s}%, ${this.color.l}%, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    // Re-distribute particles when screen size changes
    init(); 
}

function init() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new Particle());
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // 'lighter' (additive blending) is key for the glowing light effect
    ctx.globalCompositeOperation = 'lighter';

    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });

    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
}

// Event Listeners
window.addEventListener('resize', resize);

themeSelector.addEventListener('change', (e) => {
    currentTheme = e.target.value;
    init();
});

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

canvas.addEventListener('click', toggleFullscreen);

window.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        toggleFullscreen();
    }
});

// Fullscreen UI Logic
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    uiLayer.classList.remove('hidden');
    
    if (document.fullscreenElement) {
        inactivityTimer = setTimeout(() => {
            uiLayer.classList.add('hidden');
        }, 2000); // Hide after 2 seconds of inactivity
    }
}

document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        resetInactivityTimer();
    } else {
        clearTimeout(inactivityTimer);
        uiLayer.classList.remove('hidden');
    }
});

window.addEventListener('mousemove', resetInactivityTimer);
window.addEventListener('mousedown', resetInactivityTimer);
window.addEventListener('touchstart', resetInactivityTimer);

// Initial setup
width = canvas.width = window.innerWidth;
height = canvas.height = window.innerHeight;
init();
animate();