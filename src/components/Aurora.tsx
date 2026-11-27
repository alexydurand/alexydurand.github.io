import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { createAurora } from '../lib/aurora';
import { prefersReducedMotion } from '../lib/motion';

// Drawn at CSS pixels (not the screen's), at most this many: the shader is costly on a large screen
const MAX_PIXELS = 1_000_000;
// Without motion, the sky as it is at this moment
const STILL = 40;

/** Northern lights of the footer (lib/aurora.ts), drawn only while on screen. */
export default function Aurora() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const aurora = el && createAurora(el);
    if (!el || !aurora) return;
    const still = prefersReducedMotion();
    // Every other frame: the sky moves too slowly for 60 images a second to show
    const tick = (time: number, _: number, frame: number) => {
      if (frame % 2 === 0) aurora.draw(time);
    };

    const resize = new ResizeObserver(() => {
      const scale = Math.min(1, Math.sqrt(MAX_PIXELS / (el.clientWidth * el.clientHeight || 1)));
      el.width = Math.round(el.clientWidth * scale);
      el.height = Math.round(el.clientHeight * scale);
      // Resizing clears the canvas; when moving, the next frame repaints it
      if (still) aurora.draw(STILL);
    });
    const seen = new IntersectionObserver(([entry]) => {
      if (still) return;
      if (entry.isIntersecting) gsap.ticker.add(tick);
      else gsap.ticker.remove(tick);
    });
    resize.observe(el);
    seen.observe(el);
    return () => {
      resize.disconnect();
      seen.disconnect();
      gsap.ticker.remove(tick);
      aurora.dispose();
    };
  }, []);

  return <canvas ref={canvas} data-aurora aria-hidden className="absolute inset-0 size-full" />;
}
