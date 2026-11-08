import { useCallback, useEffect, useRef, type PointerEvent } from 'react';
import { voyages } from '../data/content';
import useLazyScene from '../hooks/useLazyScene';
import useScrollProgress from '../hooks/useScrollProgress';
import useMediaQuery from '../hooks/useMediaQuery';
import { range } from '../lib/motion';
import createHongKongFlight, { type HongKongFlight } from '../lib/hongKongFlight';

const loadFlight = () => Promise.resolve(createHongKongFlight);

// The section starts 132svh early, pinned under the travel collage (Voyages.tsx): its last 32svh fade
// the Hong Kong picture, this flight's first image, out over it. The flight starts halfway through the fade.
const HEIGHT_SVH = 280;
const HIDDEN_SVH = 16;

export default function HongKong() {
  const host = useRef<HTMLElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const mobile = useMediaQuery('(max-width: 767px)');

  // Render only once the section reaches the top of the screen: before that it is hidden under the collage
  const { scene, setProgress } = useLazyScene<HongKongFlight>(
    host,
    canvas,
    loadFlight,
    { mobile, reducedMotion },
    '0px 0px -99% 0px',
  );

  const onProgress = useCallback(
    (raw: number) => {
      const hidden = HIDDEN_SVH / (HEIGHT_SVH - 100);
      const p = range(raw, hidden, 1);
      setProgress(p);
      if (end.current) {
        const v = range(p, 0.88, 0.97);
        end.current.style.opacity = String(v);
        end.current.style.transform = `translate3d(0, ${(1 - v) * 50}px, 0) scale(${0.92 + v * 0.08})`;
      }
    },
    [setProgress],
  );
  useScrollProgress(wrapper, onProgress, !reducedMotion);

  useEffect(() => {
    if (reducedMotion) setProgress(1);
  }, [reducedMotion, setProgress]);

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    scene.current?.look(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -(((e.clientY - r.top) / r.height) * 2 - 1),
    );
  };

  return (
    <section
      ref={host}
      aria-labelledby="hk-title"
      onPointerMove={onPointerMove}
      data-theme="dark"
      className={
        reducedMotion ? 'bg-night relative text-white' : 'bg-night relative -mt-[132svh] text-white'
      }
    >
      <div ref={wrapper} style={reducedMotion ? undefined : { height: `${HEIGHT_SVH}svh` }}>
        <div className="sticky top-0 h-svh overflow-hidden">
          <canvas ref={canvas} aria-hidden className="absolute inset-0 size-full" />
          <div
            ref={end}
            className={
              reducedMotion ? 'relative h-full' : 'relative h-full opacity-0 will-change-transform'
            }
          >
            <div aria-hidden className="hk-scrim pointer-events-none absolute inset-0" />
            <div className="frame relative flex h-full items-end pb-[12svh]">
              <h2
                id="hk-title"
                className="display text-[clamp(3.5rem,1.5rem+10vw,11rem)] leading-[0.85]"
              >
                {voyages.final}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
