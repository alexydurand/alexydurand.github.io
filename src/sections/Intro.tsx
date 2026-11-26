import { useCallback, useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { hero, skills, ui } from '../data/content';
import { easeInOut, range } from '../lib/motion';
import Ghost from '../components/Ghost';
import useScrollProgress from '../hooks/useScrollProgress';
import useMediaQuery from '../hooks/useMediaQuery';
import clsx from '../lib/clsx';

function Strip({
  items,
  className,
  stripRef,
}: {
  items: string[];
  className: string;
  stripRef: React.Ref<HTMLDivElement>;
}) {
  return (
    <div aria-hidden className="overflow-hidden whitespace-nowrap">
      <div
        ref={stripRef}
        className={clsx(
          'display inline-block text-[clamp(2.25rem,5.2vw,5rem)] leading-[1.05]',
          className,
        )}
      >
        {[...items, ...items, ...items].map((s, i) => (
          <span key={i} className="mr-[0.6em]">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

// The outline of `.ghost-shape` (231 × 289), every point written as an "x y" pair so it can be scaled
const GHOST =
  'M230.809 115.385L230.809 249.411C230.809 269.923 214.985 287.282 194.495 288.411C184.544 288.949 175.364 285.718 168.26 280C159.746 273.154 147.769 273.461 139.178 280.23C132.638 285.384 124.381 288.462 115.379 288.462C106.377 288.462 98.1451 285.384 91.6055 280.23C82.912 273.385 70.9353 273.385 62.2415 280.23C55.7532 285.334 47.598 288.411 38.7246 288.462C17.4132 288.615 0 270.667 0 249.359L0 115.385C0 51.6667 51.6756 0 115.404 0C179.134 0 230.809 51.6667 230.809 115.385Z';
const ghostPath = (x: number, y: number, scale: number) =>
  GHOST.replace(
    /([\d.]+) ([\d.]+)/g,
    (_, a, b) => `${(a * scale + x).toFixed(1)} ${(b * scale + y).toFixed(1)}`,
  );

// Scroll progress at which the coloured ghost has faded out (Ghost.tsx) and its dark shape is whole
const GHOST_OUT = 0.1;
// Final width of the shape, in screen widths: so wide that its dome is nearly flat...
const COVER = 4;
// ...and rises only this far above the screen (in screen widths) to clear the corners
const DOME_SAG = 0.07;

/**
 * The ghost after the name on the home page, in place of a ® (Hero, `data-ghost`), grows with the scroll until it
 * fills the screen and becomes this dark band: the sentence, the CV, the moving strips of languages.
 * The band starts 100svh early, pinned over the hero and clipped to the ghost's shape until then.
 */
export default function Intro() {
  const wrapper = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLDivElement>(null);
  const ghost = useRef<HTMLDivElement>(null);
  const outline = useRef<SVGPathElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const dataStrip = useRef<HTMLDivElement>(null);
  const devStrip = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const onProgress = useCallback((p: number) => {
    progress.current = p;
  }, []);
  useScrollProgress(wrapper, onProgress, !reducedMotion);

  // Every frame, since the ghost also follows the title's entrance and parallax. As in PaperDrops,
  // it first drops below the name and its line, then its dark shape grows down and sideways while the
  // title scrolls away above it, until the shape is so large that the band fills the screen.
  useEffect(() => {
    const el = band.current;
    const box = content.current;
    const resident = ghost.current;
    const line = outline.current;
    // Two places for it (Hero.tsx), one shown at a time: after the last name, or after the first on two lines
    const slots = [...document.querySelectorAll<HTMLElement>('[data-ghost]')];
    const block = document.querySelector<HTMLElement>('[data-hero-title]');
    if (!el || !box || !resident || !line || !slots.length || !block || reducedMotion) return;
    let done = false;
    let last = '';
    // Until then the hero's entrance (Hero.tsx) moves the ghost's place by itself
    const settled = performance.now() + 2500;
    const tick = () => {
      const p = progress.current;
      if (p >= 1 && done) return;
      done = p >= 1;
      // At rest nothing moves: skip the layout reads below, they ran on every frame. The ghost's place moves
      // by itself during the hero's entrance and the ghost's intro (Hero.tsx)
      const key = `${p} ${window.scrollY} ${window.innerWidth} ${window.innerHeight} ${slots.map((s) => s.style.transform + s.style.opacity).join()}`;
      if (key === last && performance.now() > settled) return;
      last = key;
      const slot = slots.find((s) => s.offsetWidth) ?? slots[0];
      const s = slot.getBoundingClientRect();
      const b = el.getBoundingClientRect();
      const below = block.getBoundingClientRect().bottom + s.height * 0.25;
      const drop = 1 - (1 - range(p, 0, 0.12)) ** 3;
      const grow = easeInOut(range(p, 0.02, 0.92));
      // A steady zoom, so that it stays a ghost for most of the way
      const start = s.height / 289;
      const scale = start * ((COVER * b.width) / 231 / start) ** grow;
      const under = Math.max(b.top, s.top + (below - s.top) * drop);
      const top = under + (b.top - DOME_SAG * b.width - under) * range(p, 0.7, 0.92);
      const centre = s.left + s.width / 2 + (b.left + b.width / 2 - s.left - s.width / 2) * grow;
      const left = centre - (231 * scale) / 2;
      // The dark shape starts inside the ghost, out of sight even as it floats, and fills it as it fades
      const inner = scale * (0.85 + 0.15 * range(p, 0, GHOST_OUT));
      const shape = ghostPath(
        centre - (231 * inner) / 2 - b.left,
        top + 144.5 * (scale - inner) - b.top,
        inner,
      );
      el.style.clipPath = p >= 1 ? 'none' : p > 0 ? `path('${shape}')` : 'inset(50%)';
      // Dark on the dark home page: a white line shows its edge, once the coloured ghost has faded
      line.setAttribute('d', p > 0 && p < 1 ? shape : '');
      line.style.opacity = String(range(p, GHOST_OUT / 2, GHOST_OUT));
      resident.style.transform = `translate3d(${left - b.left}px, ${top - b.top}px, 0) scale(${scale})`;
      // Gone once faded: it is outside the clipped band, and at this scale it would widen the page
      resident.style.display = p < GHOST_OUT ? '' : 'none';
      // Pops up with its place on load (Hero.tsx)
      resident.style.opacity = p > 0 ? '1' : getComputedStyle(slot).opacity;
      const c = range(p, 0.7, 1);
      box.style.opacity = String(c);
      box.style.transform = `translate3d(0, ${(1 - c) * 40}px, 0)`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [reducedMotion]);

  // The two strips slide in opposite directions with the scroll
  useEffect(() => {
    const el = wrapper.current;
    if (!el || reducedMotion) return;
    const ctx = gsap.context(() => {
      const st = { trigger: el, start: 'top top', end: 'bottom top', scrub: true };
      gsap.fromTo(
        dataStrip.current,
        { xPercent: -2 },
        { xPercent: -30, ease: 'none', scrollTrigger: st },
      );
      gsap.fromTo(
        devStrip.current,
        { xPercent: -30 },
        { xPercent: -2, ease: 'none', scrollTrigger: st },
      );
    }, el);
    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section aria-label={ui.intro} className="pointer-events-none relative">
      {/* Laid over the hero: lets clicks through to its buttons, the band itself is hit only where its clip shows it */}
      <div ref={wrapper} className={reducedMotion ? undefined : '-mt-[100svh] h-[200svh]'}>
        {/* Pinned like the band but outside it: the band's clip must not cut the ghost */}
        {!reducedMotion && (
          <div className="pointer-events-none sticky top-0 z-10 h-0">
            <div
              ref={ghost}
              aria-hidden
              className="absolute top-0 left-0 h-[289px] w-[231px] origin-top-left"
            >
              <Ghost progress={progress} />
            </div>
            <svg aria-hidden className="absolute top-0 left-0 h-svh w-full overflow-visible">
              <path ref={outline} className="fill-none stroke-white stroke-[1.5]" />
            </svg>
          </div>
        )}
        {/* Low on a phone, centred above: either way little room under the strips, Mes outils follows close */}
        <div
          ref={band}
          data-theme="dark"
          style={reducedMotion ? undefined : { clipPath: 'inset(50%)' }}
          className="bg-coal pointer-events-auto sticky top-0 flex min-h-svh flex-col justify-end gap-16 overflow-hidden pt-24 pb-28 text-white md:justify-center md:gap-24 md:pb-0"
        >
          <div
            ref={content}
            style={reducedMotion ? undefined : { opacity: 0 }}
            className="frame grid md:grid-cols-12"
          >
            <p className="text-[clamp(1.5rem,1rem+1.6vw,2.75rem)] leading-snug text-pretty md:col-span-9">
              {hero.sentence}
            </p>
          </div>

          {/* Languages and tools, data first: that line in the green of the northern lights, the next in white */}
          <div className="space-y-1">
            <Strip items={skills.stripData} className="text-aurora" stripRef={dataStrip} />
            <Strip items={skills.stripDev} className="text-white" stripRef={devStrip} />
          </div>
        </div>
      </div>
    </section>
  );
}
