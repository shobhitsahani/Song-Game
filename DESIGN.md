---
name: Music Trivia - Liquid Glass
description: A tactile late-night listening room for competitive and solo music trivia
colors:
  primary: "oklch(0.82 0.17 75)"
  primary-rose: "oklch(0.72 0.21 355)"
  primary-light: "oklch(0.55 0.22 262)"
  neutral-bg: "oklch(0.10 0.005 270)"
  neutral-bg-rose: "oklch(0.16 0.045 350)"
  neutral-bg-light: "oklch(0.975 0.006 265)"
  surface-raised: "oklch(0.15 0.008 270)"
  surface-glass: "oklch(1 0 0 / 0.06)"
  border-glass: "oklch(1 0 0 / 0.14)"
  text-foreground: "oklch(0.97 0.004 270)"
  text-muted: "oklch(0.72 0.015 270)"
  accent-cyan: "oklch(0.78 0.13 210)"
  status-success: "oklch(0.80 0.18 155)"
  status-danger: "oklch(0.70 0.20 25)"
typography:
  display:
    fontFamily: "var(--font-display), 'Unbounded', sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "var(--font-display), 'Unbounded', sans-serif"
    fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "var(--font-sans), 'Inter', sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "var(--font-sans), 'Inter', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "var(--font-mono), 'JetBrains Mono', monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.05em"
rounded:
  sm: "12px"
  md: "20px"
  lg: "28px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "oklch(0.18 0.03 75)"
    rounded: "{rounded.md}"
    padding: "14px 28px"
    height: "48px"
  button-glass:
    backgroundColor: "{colors.surface-glass}"
    textColor: "{colors.text-foreground}"
    rounded: "{rounded.md}"
    padding: "14px 28px"
    height: "48px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
    height: "44px"
---

# Design System: Music Trivia - Liquid Glass

## Overview

**Creative North Star: "The Late-Night Listening Lounge"**

Music Trivia treats music as the hero in a warm, tactile, dimly lit listening lounge. The interface lives on an ambient field of soft drifting color orbs and fine microscopic grain. The chrome—floating navigation dock, countdown timer ring, answer cards, and dialogs—is rendered in floating liquid glass with specular sheens, subtle edge highlights, and Chromium SVG refraction.

Content is articulated in bold, confident typography that demands zero hesitation from the player. High-energy game events—score increments, streak multipliers, countdown urgency, and victory podiums—trigger physical springs, tactile audio feedback, and procedural 3D celebrations. Crucially, the player never waits for an animation: input latency is under 100ms, and state acknowledgments are instantaneous.

**Key Characteristics:**
- **Atmospheric Living Backdrop:** Pre-blurred radial orbs drifting in 40–60s CSS transform loops that softly pulse on correct answers and desaturate on errors.
- **Three-Tier Liquid Glass:** Specular pointer sheen and SVG noise grain on all modern browsers, chromatic SVG displacement refraction on Chromium, and solid fallback under `prefers-reduced-transparency`.
- **Typographic Gravity:** Wide geometric display headers paired with clean neutral body copy and tabular monospace numerals.
- **One Primary Action:** Focused thumb-zone decision making on mobile and desktop without visual noise.

## Colors

The palette is authored in perceptually uniform OKLCH color space across three themes, verified for WCAG AA compliance (≥ 4.5:1 body, ≥ 3:1 icons and large text) against worst-case glass backdrops.

### Primary
- **Amber Gold (Vinyl Theme)** (`oklch(0.82 0.17 75)`): The warm vacuum-tube amplifier glow used for the primary CTA, timer urgency highlights, and streak multiplier badges.
- **Hot Berry Pink (Rose Theme)** (`oklch(0.72 0.21 355)`): Dark berry listening room accent for high-energy social play.
- **Cobalt Blue (Light Theme)** (`oklch(0.55 0.22 262)`): Deep crisp daylight ink with white text contrast.

### Secondary
- **Electric Cyan (Vinyl Theme)** (`oklch(0.78 0.13 210)`): Used for secondary indicators, track waveforms, and dual-tone ambient orb counterpoint.
- **Warm Peach (Rose Theme)** (`oklch(0.86 0.10 55)`): Decorative warmth for avatars and ambient orb depth.
- **Tangerine Orange (Light Theme)** (`oklch(0.72 0.17 45)`): Decorative highlights and rank tags.

### Status
- **Mint Emerald** (`oklch(0.80 0.18 155)`): Crisp positive feedback for correct trivia guesses, room ready status, and online presence.
- **Crimson Coral** (`oklch(0.70 0.20 25)`): High-visibility warning for wrong guesses, expiring timers, and destructive actions.

### Neutral
- **Deep Vinyl Ground** (`oklch(0.10 0.005 270)`): Ultra-deep dark foundation simulating vinyl lacquer.
- **Translucent Glass Fill** (`oklch(1 0 0 / 0.06)`): Low-opacity substrate allowing ambient backdrop movement to shine through.
- **Glass Specular Border** (`oklch(1 0 0 / 0.14)`): 1px top-highlighted hairline giving physical glass thickness.

### Named Rules
**The Rarity Rule.** Primary amber or accent color is reserved for the single actionable target per viewport. It never coats passive cards or static banners.
**The No-Flash Rule.** Theme switches use the circular View Transitions API from the trigger element or instant inline script execution to eliminate white flashes on page reload.

## Typography

**Display Font:** Unbounded variable (`var(--font-display)`, cursive wide geometric)
**Body Font:** Inter variable (`var(--font-sans)`, neutral grotesque)
**Label/Mono Font:** JetBrains Mono (`var(--font-mono)`, tabular-nums monospace)

**Character:** Wide, confident display letterforms evoke vintage hi-fi typography and contemporary festival posters, grounded by ultra-readable body text and non-shifting tabular numerals.

### Hierarchy
- **Display** (Bold 700, clamp(2rem, 5vw, 3.5rem), line-height 1.1): Hero titles, round introductions, game over announcements.
- **Headline** (SemiBold 600, clamp(1.5rem, 3.5vw, 2.25rem), line-height 1.2): Trivia question prompts, setup wizard stage titles.
- **Title** (SemiBold 600, 1.25rem, line-height 1.3): Answer option text, dialog headers, podium placements.
- **Body** (Regular 400, 1rem, line-height 1.5): Track artists, album info, instructions, descriptions.
- **Label** (Medium 500, 0.875rem, letter-spacing 0.05em, font-variant-numeric: tabular-nums): Countdown timer seconds, score counters, keyboard shortcuts (1-4, A-D).

### Named Rules
**The Tabular Numerals Rule.** Every countdown timer, scoreboard score, and percentage must use monospace tabular figures (`font-variant-numeric: tabular-nums`) to prevent horizontal layout jank during ticking.

## Layout

- **Spatial Rhythm:** 4px baseline grid (`4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`).
- **Container Widths:** Main trivia stage centered at `max-w-2xl` for optimal reading saccade and thumb reach; setup and dashboards at `max-w-4xl`; wide canvas at `max-w-6xl`.
- **Navigation Dock:** Floating glass pill centered at top on desktop, docked floating bottom nav on mobile viewports (< 768px).
- **Touch Targets:** All primary buttons and trivia answer options guarantee a minimum height of 48px to 60px with 8px margin separation.

## Elevation & Depth

Depth is established through three tiers of physical glass surfaces over a living ambient background:

- **Tier 1 (Universal Base):** Translucent backdrop-filter blur (20-28px) with color saturation (150-180%), 1px inset highlight (`border-white/14`), subtle outer box-shadow (`0 16px 40px rgba(0,0,0,0.4)`), and overlay SVG micro-grain to prevent banding.
- **Tier 2 (Chromium Displacement):** Dynamic SVG `feDisplacementMap` filter on key hero surfaces (floating top nav, countdown timer pill, primary CTA) creating optical refraction at glass edges.
- **Tier 3 (Accessibility Solid Fallback):** Solid opaque backgrounds (`oklch(0.14 0.01 270)`) triggered automatically under `@media (prefers-reduced-transparency)` and `prefers-contrast: more`.

### Named Rules
**The Max-Three Glass Rule.** No more than 3 glass surfaces may ever be stacked vertically in a single viewport. Deep nested cards are prohibited.

## Shapes

- **Radius Scale:** Strictly calibrated to `12px` (inner chips, inputs), `20px` (cards, answer options, dialogs), `28px` (large containers, hero surfaces), and `9999px` (`rounded-full` for timer rings, pills, dock bars, avatars).
- **Physical Feel:** Continuous curvature aesthetic with 1px border framing and top specular highlight mimicking bevelled acrylic and polished glass.

## Components

### Buttons
- **Shape:** Rounded pill or 20px squircle (`rounded-2xl`), minimum 48px height.
- **Primary:** High-contrast amber/cobalt fill, bold text, scale spring `whileTap: { scale: 0.98 }`.
- **Glass:** Translucent backdrop blur, 1px highlight border, specular hover reflection.
- **Ghost:** Transparent background with subtle hover pill highlight.

### Answer Options
- **Shape:** 20px squircle, 60px height minimum, full-width card.
- **Keycap:** Tabular numeral badge (1-4 / A-D) with hotkey trigger support.
- **Feedback:** Spring-scale on click (<100ms), emerald green glow on correct, horizontal shake animation on wrong.

### Timer Ring
- **Shape:** Circular SVG ring (`rounded-full`) with smooth stroke-dashoffset transition.
- **Urgency Modes:** Calm (>5s) in primary tone, critical (≤5s) in pulse crimson with synthesized Web Audio tick.
- **Accessibility:** `role="timer"` with `aria-live="polite"` remaining second updates.

### Ambient Background
- **Layers:** Three independent drifting radial orbs (`30s`, `45s`, `60s` loops) reacting with soft color burst on correct answers, resting during hidden tab states.

### 3D Surfaces (Three.js)
- **Vinyl Hero:** Real-time procedural vinyl cylinder with grooves, gold center label, and pointer-tilt spring physics.
- **Celebration Trophy:** Real-time procedural gold trophy with rotating laurel star, particles, and reduced-motion fallback.

## Do's and Don'ts

### Do:
- **Do** maintain instant feedback (<100ms) on all trivia clicks before triggering socket transitions.
- **Do** support keyboard shortcuts 1–4 and A–D for all question screens.
- **Do** test every color against worst-case transparent backdrops for WCAG AA compliance.
- **Do** pause all 3D canvas requestAnimationFrame loops and ambient orb animations when `document.hidden` is true.

### Don't:
- **Don't** use colored side-tab borders (`border-l-4`), nested cards, or eyebrow chips.
- **Don't** use purple-to-pink generic gradients or neon cyan ink on dark grounds.
- **Don't** animate `backdrop-filter: blur()` values dynamically (causes heavy GPU frame drops).
- **Don't** use generic CTAs like "Get Started" or "Click Here"; use music-specific verbs like "Start a round", "Join room", "Submit guess".
