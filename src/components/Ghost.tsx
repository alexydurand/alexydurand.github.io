import { useEffect, useRef, type RefObject } from 'react';
import { gsap } from '../lib/gsap';
import { createMeshGradient } from '../lib/meshGradient';
import { range } from '../lib/motion';

// Scroll progress at which the ghost is gone
const OUT = 0.1;
// How far the eyes travel (SVG units), and the cursor distance (px) at which they get there
const TRAVEL = 22;
const REACH = 320;

/**
 * The ghost beside the name on the home page, after Shader Svg by reuno-ui (21st.dev): a moving
 * gradient cut to its shape (`.ghost-shape`), whose eyes watch the cursor. It fades out as the scroll
 * starts, leaving the dark shape that grows out of it (Intro.tsx).
 */
export default function Ghost({ progress }: { progress: RefObject<number> }) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const eyes = useRef<SVGGElement>(null);

  useEffect(() => {
    const box = root.current;
    const pair = eyes.current;
    if (!box || !canvas.current || !pair) return;
    const gradient = createMeshGradient(canvas.current);
    const toX = gsap.quickTo(pair, 'x', { duration: 0.4, ease: 'power3' });
    const toY = gsap.quickTo(pair, 'y', { duration: 0.4, ease: 'power3' });

    let shown = 1;
    const tick = (time: number) => {
      const glow = 1 - range(progress.current, 0, OUT);
      if (glow !== shown) {
        shown = glow;
        box.style.opacity = String(glow);
        box.style.visibility = glow > 0 ? '' : 'hidden';
      }
      if (glow > 0) gradient?.draw(time);
    };

    const onMove = (e: PointerEvent) => {
      if (progress.current >= OUT) return;
      const r = box.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const distance = Math.hypot(dx, dy) || 1;
      const k = (Math.min(distance / REACH, 1) * TRAVEL) / distance;
      toX(dx * k);
      toY(dy * k);
    };

    gsap.ticker.add(tick);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      gsap.ticker.remove(tick);
      window.removeEventListener('pointermove', onMove);
      gsap.killTweensOf(pair);
      gradient?.dispose();
    };
  }, [progress]);

  return (
    <div ref={root} className="relative size-full animate-[ghost-float_2.8s_ease-in-out_infinite]">
      <canvas
        ref={canvas}
        width={58}
        height={72}
        className="ghost-shape absolute inset-0 size-full"
      />
      <svg viewBox="0 0 231 289" className="absolute inset-0 size-full">
        <g ref={eyes} className="fill-ink">
          {[80, 150].map((cx) => (
            <ellipse
              key={cx}
              cx={cx}
              cy={120}
              rx={20}
              ry={30}
              className="origin-center animate-[eye-blink_3s_ease-in-out_infinite] [transform-box:fill-box]"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
