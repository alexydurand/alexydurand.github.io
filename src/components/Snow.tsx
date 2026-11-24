import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { prefersReducedMotion } from '../lib/motion';

type Flake = {
  x: number;
  y: number;
  r: number;
  v: number;
  a: number;
  sway: number;
  phase: number;
  spin: number;
};

/**
 * Snow falling over the home page, on a canvas drawn only while it is on screen. Off screen it also
 * pauses the endless animations around it (the firs' lights): `data-away` on its parent, see index.css.
 * Without motion, the flakes stay still.
 */
export default function Snow() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext('2d');
    if (!el || !ctx) return;
    const still = prefersReducedMotion();
    let flakes: Flake[] = [];
    let w = 0;
    let h = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const f of flakes) {
        ctx.globalAlpha = f.a;
        ctx.beginPath();
        ctx.arc(f.x + Math.sin(f.phase) * f.sway, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const tick = (_time: number, deltaMs: number) => {
      const s = Math.min(deltaMs, 50) / 1000;
      for (const f of flakes) {
        f.y += f.v * s;
        f.phase += f.spin * s;
        if (f.y > h + f.r) {
          f.y = -f.r;
          f.x = Math.random() * w;
        }
      }
      draw();
    };

    // Called once on observe too
    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      w = el.clientWidth;
      h = el.clientHeight;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = getComputedStyle(el).color;
      // About one flake per 9000 px²: mostly small and slow (far), a few big and fast (near)
      flakes = Array.from({ length: Math.round((w * h) / 9000) }, () => {
        const r = 0.6 + Math.random() ** 2 * 2.4;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r,
          v: 16 + r * 20,
          a: 0.3 + r * 0.22,
          sway: 6 + Math.random() * 16,
          phase: Math.random() * 6.3,
          spin: 0.6 + Math.random(),
        };
      });
      draw();
    };
    const sizes = new ResizeObserver(resize);
    sizes.observe(el);

    let on = false;
    const seen = new IntersectionObserver(([entry]) => {
      el.parentElement?.toggleAttribute('data-away', !entry.isIntersecting);
      if (still || entry.isIntersecting === on) return;
      on = entry.isIntersecting;
      if (on) gsap.ticker.add(tick);
      else gsap.ticker.remove(tick);
    });
    seen.observe(el);

    return () => {
      sizes.disconnect();
      seen.disconnect();
      gsap.ticker.remove(tick);
    };
  }, []);

  return (
    <canvas
      ref={canvas}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full text-white"
    />
  );
}
