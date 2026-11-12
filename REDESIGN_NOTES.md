# Liquid Glass Redesign Notes & Architectural Documentation

## 1. Community Components Audit & Registry

All community-inspired effects are placed under `components/fx/` and `components/ui/`, adhering to the Impeccable craft rules:
- Clean MIT / Apache 2.0 license compliance.
- Zero external untrusted packages or tracking code.
- Hardcoded colors replaced with OKLCH theme tokens (`--primary`, `--glass-bg`, `--glow`, `--border-glass`).
- Zero Lucide icons (100% `@phosphor-icons/react`).
- Strict reduced-motion checks via `useReducedMotion()` from `motion/react`.

| Component | Location | Source / Inspiration | License | Customizations & Changes |
| :--- | :--- | :--- | :--- | :--- |
| **Animated Number Counter** | `components/fx/animated-counter.tsx` | Magic UI / 21st.dev | MIT | Formatted with `Intl.NumberFormat`, monospace tabular figures, spring interpolation with reduced motion jump. |
| **Spotlight / Glow Card** | `components/fx/spotlight-card.tsx` | Aceternity UI / 21st.dev | MIT | Tracks pointer fine coordinates (`--mouse-x`, `--mouse-y`) to render radial specular highlight, disabled on coarse touch. |
| **Border Beam** | `components/fx/border-beam.tsx` | Magic UI | MIT | Uses CSS conic-gradient rotation along SVG border path; respects user's motion preferences. |
| **Audio Waveform Visualizer** | `components/fx/audio-waveform.tsx` | React Bits / 21st.dev | MIT | Dual-state audio visualizer (synthesized animated bars during audio preview playback, resting bars on pause). |
| **Dock Navigation** | `components/fx/dock-nav.tsx` | Magic UI / macOS Dock | MIT | Responsive dual-mode: Top floating glass pill for desktop (`md:flex`), bottom thumb-zone dock for mobile (`md:hidden`). |
| **Confetti Celebration** | `components/fx/confetti.tsx` | Canvas Confetti | MIT | Multi-stage victory burst (side cannons, star burst) on round win and podium results; no-op if reduced motion is enabled. |

---

## 2. Technical Notes

### A. Safari Refraction Fallback (Chromium SVG feDisplacementMap vs. Standard Glass)
- **Chromium:** Supports `backdrop-filter: url(#liquid-glass-disp)` with SVG filters utilizing `<feDisplacementMap>` to physically bend and refract light at surface perimeters.
- **Safari / WebKit:** WebKit does not currently support SVG filter references in CSS `backdrop-filter`.
- **Implementation:** `components/glass/glass-surface.tsx` performs browser feature detection for SVG backdrop filter support via `CSS.supports('backdrop-filter', 'url(#test)')` or checks user-agent/engine capabilities.
- **Graceful Fallback:** On Safari, Firefox, and non-Chromium browsers, the component transparently falls back to **Tier 1 Glass**:
  - `backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-sat))`
  - Inset top specular highlight (`border-t border-white/25`)
  - Subtly blurred outer shadow and 4% overlay micro-noise SVG grain to prevent color banding.
  - Zero console warnings, zero layout shift, zero visual breakage.

### B. How to Add a 4th Theme in `styles/themes.css`
Any new theme can be added in a single location by appending a new `[data-theme="<name>"]` block in `apps/web/src/styles/themes.css`:

```css
/* Example: 4th Theme - Emerald Vinyl ("Lounge") */
[data-theme="emerald"] {
  --background: oklch(0.12 0.03 155);
  --raised: oklch(0.17 0.04 155);
  --foreground: oklch(0.97 0.01 155);
  --muted: oklch(0.72 0.02 155);
  --muted-foreground: oklch(0.65 0.02 155);
  --card: oklch(0.14 0.03 155 / 0.7);
  --card-foreground: oklch(0.97 0.01 155);
  --popover: oklch(0.16 0.04 155 / 0.9);
  --popover-foreground: oklch(0.97 0.01 155);
  --primary: oklch(0.80 0.18 150); /* Bright Emerald Mint */
  --primary-foreground: oklch(0.14 0.03 155);
  --secondary: oklch(0.20 0.04 155);
  --secondary-foreground: oklch(0.97 0.01 155);
  --accent: oklch(0.85 0.12 90); /* Gold-Lime counterpoint */
  --accent-foreground: oklch(0.14 0.03 155);
  --destructive: oklch(0.70 0.20 25);
  --destructive-foreground: oklch(0.98 0 0);
  --border: oklch(1 0 0 / 0.12);
  --input: oklch(1 0 0 / 0.10);
  --ring: oklch(0.80 0.18 150);

  /* Glass tokens */
  --glass-bg: oklch(1 0.02 155 / 0.07);
  --glass-border: oklch(1 0.03 155 / 0.16);
  --glass-highlight: oklch(1 0.05 155 / 0.35);
  --glass-shadow: 0 16px 40px oklch(0.08 0.02 155 / 0.5);
  --glass-blur: 24px;
  --glass-sat: 165%;
  --glow: oklch(0.80 0.18 150 / 0.25);

  /* Ambient orbs */
  --orb-1: oklch(0.80 0.18 150 / 0.22);
  --orb-2: oklch(0.85 0.12 90 / 0.18);
  --orb-3: oklch(0.70 0.14 190 / 0.20);
}
```
Then register the theme key in `components/glass/theme-switcher.tsx` (swatch definition array) and `THEMES` array. The inline head script in `layout.tsx` will automatically persist and hydrate it with zero flash.

### C. How to Toggle 3D Off
3D procedural rendering (`VinylHero` on landing, `CelebrationTrophy` on victory screen) can be disabled via 3 mechanisms:

1. **User Setting in Profile:**
   - Navigate to `/profile` -> Game Preferences -> **"3D & Ambient Visuals"** toggle.
   - Setting is persisted in `localStorage.getItem('setting_3d_enabled')`.
2. **System Accessibility Preference (`prefers-reduced-motion`):**
   - Automatically detected by `useReducedMotion()`.
   - When active, Three.js canvas creation is bypassed, rendering an ultra-fast, lightweight CSS vinyl/trophy badge.
3. **Low-Power / Mobile Fallback:**
   - Hardware concurrency and WebGL context creation are wrapped in try/catch.
   - If WebGL 2.0 context is unavailable or fails to initialize, the component renders the static glass vinyl illustration without interrupting gameplay.
   - When the user switches browser tabs (`document.hidden`), the Three.js `requestAnimationFrame` loop automatically pauses, preserving battery life and GPU resources.
