/**
 * Centralized Motion System & Performance-Tuned Tokens
 *
 * Principle: Input-driven UI responds in one frame.
 * Motion is for orientation, not answering input.
 * Liquid springs are strictly for pointer-driven indicators (nav lens, segmented control indicator,
 * slider thumb, avatar halo ring) and decorative moments. Never for keyboard selection, filtering or typing.
 *
 * Motion Token Specification:
 * - instant: 0ms (keyboard selection, filtering, focus)
 * - snap: 80ms ease-out (hover color, press feedback)
 * - fast: 120-160ms (opening and closing popovers and dialogs)
 * - base: 240ms (route and section reveals)
 * - liquid spring: pointer-driven indicators only, with restDelta / restSpeed set
 */

export const MOTION_TOKENS = {
  /** 0ms: Keyboard selection, synchronous filtering, immediate focus */
  instant: {
    duration: 0,
    ms: 0,
    cssDuration: '0ms',
    usage: 'keyboard selection, filtering, focus',
  },
  /** 80ms ease-out: Button press feedback, hover colors, interactive chip states */
  snap: {
    duration: 0.08,
    ms: 80,
    cssDuration: '80ms',
    ease: [0, 0, 0.2, 1] as const,
    usage: 'hover color, press feedback',
  },
  /** 120-160ms: Dialogs, sheets, popovers opening (120ms) and closing (80-100ms) */
  fast: {
    duration: 0.14,
    ms: 140,
    openMs: 120,
    closeMs: 90,
    cssDuration: '140ms',
    ease: [0.22, 1, 0.36, 1] as const,
    usage: 'opening and closing popovers and dialogs',
  },
  /** 240ms: Page route transitions, major section entrance reveals */
  base: {
    duration: 0.24,
    ms: 240,
    cssDuration: '240ms',
    ease: [0.22, 1, 0.36, 1] as const,
    usage: 'route and section reveals',
  },
  /** Pointer-driven indicators only, with restDelta and restSpeed so springs fully settle */
  liquidSpring: {
    type: 'spring' as const,
    stiffness: 320,
    damping: 24,
    mass: 0.9,
    restDelta: 0.001,
    restSpeed: 0.001,
    usage: 'pointer-driven indicators only (nav lens, slider thumb, segmented control pill)',
  },
} as const;

export const DURATION = {
  instant: 0,
  snap: 0.08,
  fast: 0.14,
  base: 0.24,
  slow: 0.4,
  hero: 0.7,
} as const;

export const EASING = {
  outExpo: [0.22, 1, 0.36, 1] as const,
  snap: [0, 0, 0.2, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
};

export const SPRING = {
  snappy: { type: 'spring', stiffness: 500, damping: 32, mass: 0.8, restDelta: 0.001, restSpeed: 0.001 } as const,
  soft: { type: 'spring', stiffness: 220, damping: 26, restDelta: 0.001, restSpeed: 0.001 } as const,
  bouncy: { type: 'spring', stiffness: 380, damping: 18, restDelta: 0.001, restSpeed: 0.001 } as const,
  liquid: {
    type: 'spring',
    stiffness: 320,
    damping: 24,
    mass: 0.9,
    restDelta: 0.001,
    restSpeed: 0.001,
  } as const,
};

/** Pointer-driven indicators only, with restDelta and restSpeed set so spring fully stops */
export const liquidSpring = {
  type: 'spring',
  stiffness: 320,
  damping: 24,
  mass: 0.9,
  restDelta: 0.001,
  restSpeed: 0.001,
} as const;

export const elasticPress = {
  whileTap: { scale: 0.98, transition: { duration: DURATION.snap, ease: EASING.snap } },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.base,
      ease: EASING.outExpo,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: {
      duration: DURATION.snap,
      ease: EASING.inOut,
    },
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.fast, ease: EASING.outExpo },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: { duration: DURATION.snap, ease: EASING.inOut },
  },
};

export const staggerContainer = (stagger = 0.04, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
});

export const pressAnimation = {
  whileTap: { scale: 0.98 },
};

export const hoverLift = {
  whileHover: { y: -1, transition: { duration: DURATION.snap } },
  whileTap: { scale: 0.98 },
};

export const shake = {
  animate: {
    x: [0, -3, 3, -3, 3, 0],
    transition: { duration: 0.2, ease: EASING.inOut },
  },
};
