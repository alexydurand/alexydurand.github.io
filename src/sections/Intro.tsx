import { useCallback, useEffect, useRef, type MouseEvent } from 'react';
import { gsap } from '../lib/gsap';
import { hero, person, skills } from '../data/content';
import { easeInOut, range } from '../lib/motion';
import { scrollToHash } from '../lib/scroll';
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

/**
 * The square beside the name on the home page (Hero, `data-square`) grows with the scroll until it
 * fills the screen and becomes this dark band: the sentence, the CV, the moving strips of languages.
 * The band starts 100svh early, pinned over the hero and clipped to the square until then.
 */
export default function Intro() {
  const wrapper = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const dataStrip = useRef<HTMLDivElement>(null);
  const devStrip = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const onProgress = useCallback((p: number) => {
    progress.current = p;
  }, []);
  useScrollProgress(wrapper, onProgress, !reducedMotion);

  // Every frame, since the square also follows the title's entrance and parallax. As in PaperDrops,
  // the square first drops below the name and its line, then grows down and sideways while the title
  // scrolls away above it, never under it, until the band fills the screen.
  useEffect(() => {
    const el = band.current;
    const box = content.current;
    const slot = document.querySelector<HTMLElement>('[data-square]');
    const title = slot?.parentElement;
    const block = document.querySelector<HTMLElement>('[data-hero-title]');
    if (!el || !box || !slot || !title || !block || reducedMotion) return;
    let done = false;
    const tick = () => {
      const p = progress.current;
      if (p >= 1 && done) return;
      done = p >= 1;
      const s = slot.getBoundingClientRect();
      const b = el.getBoundingClientRect();
      const below = block.getBoundingClientRect().bottom + s.height * 0.25;
      const drop = 1 - (1 - range(p, 0, 0.12)) ** 3;
      const grow = easeInOut(range(p, 0.02, 0.92));
      const top = Math.max(b.top, s.top + (below - s.top) * drop);
      const left = s.left + (b.left - s.left) * grow;
      const right = left + s.width + (b.width - s.width) * grow;
      const bottom = top + s.height + (b.height - s.height) * grow;
      const px = (v: number) => `${Math.max(0, v)}px`;
      el.style.clipPath = `inset(${px(top - b.top)} ${px(b.right - right)} ${px(b.bottom - bottom)} ${px(left - b.left)})`;
      // Fades in with the title on load
      el.style.opacity = p > 0 ? '1' : getComputedStyle(title).opacity;
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

  const toContact = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToHash('#contact');
  };

  return (
    <section aria-label="Présentation" className="relative">
      <div ref={wrapper} className={reducedMotion ? undefined : '-mt-[100svh] h-[200svh]'}>
        <div
          ref={band}
          data-theme="dark"
          style={reducedMotion ? undefined : { clipPath: 'inset(50%)' }}
          className="bg-ink text-bg sticky top-0 flex min-h-svh flex-col justify-center gap-16 overflow-hidden py-24 md:gap-24"
        >
          <div
            ref={content}
            style={reducedMotion ? undefined : { opacity: 0 }}
            className="frame grid gap-8 md:grid-cols-12"
          >
            <p className="text-[clamp(1.5rem,1rem+1.6vw,2.75rem)] leading-snug text-pretty md:col-span-9">
              {hero.sentence}
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:col-span-12">
              <a
                href={person.cv}
                download
                className="bg-accent text-body text-accent-ink hover:bg-accent-deep inline-flex min-h-12 items-center px-6 font-medium whitespace-nowrap transition-colors duration-200 active:translate-y-px"
              >
                {hero.action}
              </a>
              <a
                href="#contact"
                onClick={toContact}
                className="text-body py-3 underline decoration-1 underline-offset-4 hover:decoration-2"
              >
                {hero.secondary}
              </a>
            </div>
          </div>

          {/* Languages and tools, data first */}
          <div className="space-y-1">
            <Strip items={skills.stripData} className="text-sand" stripRef={dataStrip} />
            <Strip items={skills.stripDev} className="text-bg" stripRef={devStrip} />
          </div>
        </div>
      </div>
    </section>
  );
}
