import { useLayoutEffect, useRef, type MouseEvent } from 'react';
import { gsap } from '../lib/gsap';
import { hero, person } from '../data/content';
import { prefersReducedMotion } from '../lib/motion';
import { scrollToHash } from '../lib/scroll';
import Rose from '../components/Rose';

// Each word rises out of a line just under its letters (room for the descender of the y)
const mask = 'inline-block [clip-path:inset(-0.3em_-0.1em_-0.25em)]';

// How long the roses take to bloom in the middle of the screen (s), before they move aside
const BLOOM = 2.4;
// Share of the scroll the roses follow while the home page leaves (their box reaches 35svh below the screen)
const RISE = 0.35;

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const rise = useRef<HTMLDivElement>(null);
  const roseBox = useRef<HTMLDivElement>(null);
  // How far the roses' arrival has played, 0 to 1 (Rose.tsx reads it every frame)
  const grow = useRef(1);

  // Before the first paint, so that nothing shows in its final place for a frame
  useLayoutEffect(() => {
    const el = root.current;
    const box = roseBox.current;
    if (!el || !box || prefersReducedMotion()) return;
    // On every load, unless the page comes back scrolled down: the hero is out of sight
    const intro = window.scrollY === 0;
    let cancelled = false;
    let stopSkip = () => {};
    const ctx = gsap.context(() => {
      // Arrival, after the Velde site: the name rises out of its line and its ghost pops up in place of a ®;
      // then the bar and the buttons appear. Once the roses have bloomed and move aside
      const at = intro ? BLOOM : 0;
      const tl = gsap
        .timeline({ defaults: { ease: 'expo.out' }, paused: intro })
        .from('[data-hero-word]', { yPercent: 140, duration: 1, stagger: 0.08 }, at)
        .from(
          '[data-ghost]',
          { scale: 0, opacity: 0, duration: 0.7, ease: 'back.out(2.5)' },
          at + 0.45,
        )
        .from(
          [document.querySelector('header'), '[data-hero-actions]'],
          { opacity: 0, duration: 0.8 },
          at + 0.8,
        );
      if (!intro) tl.from(box, { opacity: 0, duration: 1.2, ease: 'power1.inOut' }, 0.2);
      else {
        // On the black screen the word "alexy" appears in the middle and blooms into the roses (Rose.tsx), which
        // then glide to their place beside the name
        grow.current = 0;
        // Once the font is there (a second at most), so that their place does not move under them
        Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1000))]).then(() => {
          if (cancelled) return;
          ctx.add(() => {
            const r = box.getBoundingClientRect();
            gsap.set(box, {
              x: innerWidth / 2 - (r.left + r.width / 2),
              y: innerHeight / 2 - (r.top + r.height / 2),
            });
            tl.to(grow, { current: 1, duration: BLOOM, ease: 'none' }, 0)
              .to(box, { x: 0, y: 0, duration: 1.2, ease: 'power3.inOut' }, BLOOM - 0.4)
              .play();
          });
          // A click, a scroll or a key skips to the end
          const events = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
          const skip = () => {
            stopSkip();
            tl.progress(1);
          };
          stopSkip = () => events.forEach((e) => window.removeEventListener(e, skip));
          events.forEach((e) => window.addEventListener(e, skip, { passive: true }));
          tl.eventCallback('onComplete', stopSkip);
        });
      }

      // The name lags behind the scroll; the roses, fixed, rise slower still (see below)
      const scrollTrigger = { trigger: el, start: 'top top', end: 'bottom top', scrub: 0 };
      gsap.to('[data-layer="title"]', { yPercent: 40, ease: 'none', scrollTrigger });
      gsap.to(rise.current, {
        y: () => -RISE * el.offsetHeight,
        ease: 'none',
        scrollTrigger: { ...scrollTrigger, invalidateOnRefresh: true },
      });
    }, el);
    return () => {
      cancelled = true;
      stopSkip();
      ctx.revert();
    };
  }, []);

  const toContact = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToHash('#contact');
  };

  return (
    <section
      id="top"
      ref={root}
      aria-labelledby="hero-title"
      data-theme="dark"
      className="bg-coal relative"
    >
      <div className="relative h-svh min-h-[560px]">
        {/* The roses on the right, under the bar, the red one and the stem running out at the bottom; on a tall
            screen across, the flowers above the name, the rest behind it. Fixed, rising only RISE of the scroll (their
            canvas reaches as far below the screen) to show the red one, until the band grown from the ghost
            (Intro.tsx), painted over them, covers them; Rose.tsx hides them once the home page has left. lvh: the
            size does not change with a phone's address bar. Before the clipped box below, which paints over them */}
        <div
          ref={rise}
          className="fixed top-20 right-0 h-[calc(100lvh-5rem+35svh)] w-[60%] motion-reduce:absolute [@media(max-aspect-ratio:5/4)]:w-full"
        >
          <div ref={roseBox} className="size-full">
            <Rose grow={grow} />
          </div>
        </div>
        <div className="absolute inset-0 overflow-hidden">
          {/* The name on the left; on a tall screen under the flowers. A little above the middle for the eye, clear
              of the buttons below */}
          <div
            data-layer="title"
            className="frame absolute inset-0 grid grid-cols-2 items-center pb-[8svh] md:pl-[calc(var(--spacing-gutter)+3vw)] [@media(max-aspect-ratio:5/4)]:grid-cols-1 [@media(max-aspect-ratio:5/4)]:grid-rows-[1fr_auto] [@media(max-aspect-ratio:5/4)]:gap-[3svh] [@media(max-aspect-ratio:5/4)]:pt-[14svh] [@media(max-aspect-ratio:5/4)]:pb-[26svh]"
          >
            {/* --t: size of the name */}
            <div
              data-hero-title
              className="text-ink [--t:min(13vw,24svh)] [@media(max-aspect-ratio:5/4)]:row-start-2 [@media(max-aspect-ratio:5/4)]:[--t:min(24vw,11svh)]"
            >
              <h1 id="hero-title" className="display text-(length:--t) font-bold whitespace-nowrap">
                <span className="sr-only">
                  {person.firstName} {person.lastName}
                </span>
                <span aria-hidden>
                  <span className="block">
                    <span className={mask}>
                      <span data-hero-word className="inline-block">
                        {person.firstName}
                      </span>
                    </span>
                  </span>
                  <span className="block">
                    <span className={mask}>
                      <span data-hero-word className="inline-block">
                        {person.lastName}
                      </span>
                    </span>
                    {/* The ghost in place of a ®: the next band grows out of it (Intro.tsx) */}
                    <span
                      data-ghost
                      className="ghost-shape motion-reduce:bg-ink relative -top-[0.38em] ml-[0.05em] inline-block aspect-[231/289] h-[0.34em]"
                    />
                  </span>
                </span>
              </h1>
            </div>
          </div>
          {/* The CV and contact, down on the left */}
          <div
            data-hero-actions
            className="frame absolute inset-x-0 bottom-[max(2.5rem,7svh)] flex flex-wrap items-center gap-x-6 gap-y-3 md:px-[calc(var(--spacing-gutter)+3vw)]"
          >
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
      </div>
    </section>
  );
}
