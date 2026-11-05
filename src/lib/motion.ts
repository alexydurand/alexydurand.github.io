export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isCoarsePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

export const isSmallScreen = () => typeof window !== 'undefined' && window.innerWidth < 768;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Maps p from [a, b] to [0, 1], clamped. */
export const range = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Smooth 0→1→0 window: fades in over [a, a+f], out over [b-f, b]. */
export const windowed = (p: number, a: number, b: number, f = 0.06) =>
  Math.min(range(p, a, a + f), 1 - range(p, b - f, b));

export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
