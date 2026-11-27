import { useLayoutEffect, useRef, type RefObject } from 'react';
import { gsap } from '../lib/gsap';
import { createAsciiRose } from '../lib/asciiRose';
import { prefersReducedMotion } from '../lib/motion';

// Turn speed (radians a second), slow as in the video
const SPIN = 0.45;
// Without motion, the open roses seen from this angle
const STILL = 0.6;

/**
 * The ASCII roses of the home page (lib/asciiRose.ts), turning while the home page is on screen. `grow` (0 to 1) is
 * how far their arrival has played (Hero.tsx), read every frame; `onBud` gets where the bud grows in the canvas.
 */
export default function Rose({
  grow,
  onBud,
}: {
  grow: RefObject<number>;
  onBud: (at: { x: number; y: number } | null) => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);

  // Before the hero's own (a parent's layout effects run after its children's): it needs the bud's place
  useLayoutEffect(() => {
    const el = canvas.current;
    const rose = el && createAsciiRose(el);
    if (!el || !rose) return;
    const still = prefersReducedMotion();
    // Like a terminal, not every frame: every other one while they bloom, every third once open (~5 ms an image,
    // 20 a second is smooth enough for a slow turn)
    const tick = (time: number, _: number, frame: number) => {
      if (frame % (grow.current < 1 ? 2 : 3) === 0) rose.draw(grow.current, time * SPIN);
    };

    const layout = () => {
      rose.resize();
      onBud(rose.bud());
      if (still) rose.draw(1, STILL);
    };
    layout();
    const resize = new ResizeObserver(layout);
    // The canvas is fixed (Hero.tsx), under the band that grows over it: it stops and hides with the home page, which
    // has left once the band covers the screen, and would show over the next sections otherwise
    const seen = new IntersectionObserver(([entry]) => {
      el.style.visibility = entry.isIntersecting ? '' : 'hidden';
      if (still) return;
      if (entry.isIntersecting) gsap.ticker.add(tick);
      else gsap.ticker.remove(tick);
    });
    resize.observe(el);
    seen.observe(el.closest('section') ?? el);
    return () => {
      resize.disconnect();
      seen.disconnect();
      gsap.ticker.remove(tick);
    };
  }, [grow, onBud]);

  return <canvas ref={canvas} aria-hidden className="size-full" />;
}
