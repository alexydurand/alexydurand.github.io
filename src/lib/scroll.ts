import type Lenis from 'lenis';

let lenis: Lenis | null = null;

export const setLenis = (instance: Lenis | null) => {
  lenis = instance;
};

/** Scrolls to an in-page anchor, through Lenis when smooth scrolling is on. */
export const scrollToHash = (hash: string) => {
  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return;
  if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
  else target.scrollIntoView();
  target.focus({ preventScroll: true });
};

/**
 * Scrolls to one hill of the skills review. Once stuck, a sticky element only reports where it is stuck,
 * so its real place comes from what stands before it. `onlyBack`: just far enough to uncover it, if needed.
 */
export const scrollToStacked = (id: string, onlyBack = false) => {
  const target = document.getElementById(id);
  if (!target?.parentElement) return;
  // Not stuck (small screens), nothing can cover it; and a scroll started here would fight the finger
  if (onlyBack && getComputedStyle(target).position !== 'sticky') return;
  let y = target.parentElement.getBoundingClientRect().top + window.scrollY;
  for (let el = target.previousElementSibling; el; el = el.previousElementSibling) {
    y += (el as HTMLElement).offsetHeight;
  }
  // Not sticky on small screens: leave room for the hill above it and the bar
  y -= parseFloat(getComputedStyle(target).top) || 96;
  if (onlyBack && window.scrollY <= y) return;
  if (lenis) lenis.scrollTo(y, { duration: onlyBack ? 0.8 : 1.4 });
  else window.scrollTo(0, y);
  if (!onlyBack) target.focus({ preventScroll: true });
};

/** Stops / restarts page scrolling (used while the mobile menu is open). */
export const lockScroll = (locked: boolean) => {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
  document.documentElement.style.overflow = locked ? 'hidden' : '';
};
