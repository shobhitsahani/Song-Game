/**
 * Centralized Motion System
 * Adheres to Phase 9 guidelines:
 * Durations: instant 100ms, fast 160ms, base 240ms, slow 400ms, hero 700ms.
 * Easings: out-expo, in-out.
 * Springs: snappy, soft, bouncy.
 */

export const DURATION = {
  instant: 0.1,
  fast: 0.16,
  base: 0.24,
  slow: 0.4,
  hero: 0.7,
} as const;

export const EASING = {
  outExpo: [0.22, 1, 0.36, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
};

export const SPRING = {
  snappy: { type: 'spring', stiffness: 500, damping: 32, mass: 0.8 } as const,
  soft: { type: 'spring', stiffness: 220, damping: 26 } as const,
  bouncy: { type: 'spring', stiffness: 380, damping: 18 } as const, // Celebrations only
  liquid: { type: 'spring', stiffness: 320, damping: 24, mass: 0.9 } as const,
};

export const liquidSpring = {
  type: 'spring',
  stiffness: 320,
  damping: 24,
  mass: 0.9,
} as const;

export const elasticPress = {
  whileTap: { scale: 0.96, transition: { type: 'spring', stiffness: 450, damping: 18 } },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
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
    y: -8,
    transition: {
      duration: DURATION.fast,
      ease: EASING.inOut,
    },
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: SPRING.soft,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: DURATION.fast },
  },
};

export const staggerContainer = (stagger = 0.05, delayChildren = 0) => ({
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
  whileTap: { scale: 0.97 },
};

export const hoverLift = {
  whileHover: { y: -2, transition: SPRING.snappy },
  whileTap: { scale: 0.97 },
};

export const shake = {
  animate: {
    x: [0, -4, 4, -4, 4, 0],
    transition: { duration: 0.24, ease: EASING.inOut },
  },
};
