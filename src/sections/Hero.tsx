import { useLayoutEffect, useRef, type MouseEvent } from 'react';
import { gsap } from '../lib/gsap';
import { hero, person } from '../data/content';
import { prefersReducedMotion } from '../lib/motion';
import { scrollToHash } from '../lib/scroll';
import Aurora from '../components/Aurora';
import clsx from '../lib/clsx';

// Each word rises out of a line just under its letters (room for the descender of the y)
const mask = 'inline-block [clip-path:inset(-0.3em_-0.1em_-0.25em)]';
// The ghost in place of a ®: after the last name on one line, after the first name on two (tall screens), where
// it stands above the end of the last name. The next band grows out of the one shown (Intro.tsx)
const ghost =
  'ghost-shape motion-reduce:bg-ink relative -top-[0.38em] ml-[0.05em] aspect-[231/289] h-[0.34em]';

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  // Before the first paint, so that nothing shows in its final place for a frame
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      // Arrival, after the Velde site: the name rises in the middle of the black screen and its ghost
      // pops up in place of a ®; then the bar and the buttons appear
      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .from('[data-hero-word]', { yPercent: 140, duration: 1, stagger: 0.08 })
        .from('[data-aurora]', { opacity: 0, duration: 3, ease: 'power1.inOut' }, 0.3)
        .from('[data-ghost]', { scale: 0, opacity: 0, duration: 0.7, ease: 'back.out(2.5)' }, 0.45)
        .from(
          [document.querySelector('header'), '[data-hero-actions]'],
          { opacity: 0, duration: 0.9 },
          1.1,
        );

      // The name lags behind the scroll
      gsap.to('[data-layer="title"]', {
        yPercent: 40,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0 },
      });
    }, el);
    return () => ctx.revert();
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
        <div className="absolute inset-0 overflow-hidden">
          <Aurora />
          {/* In the middle of the screen, a little above for the eye; on a tall screen on two lines */}
          <div data-layer="title" className="absolute inset-0 grid place-items-center pb-[8svh]">
            {/* --t: size of the name */}
            <div
              data-hero-title
              className="frame text-ink text-center [--t:clamp(2.75rem,12.5vw,13rem)] [@media(max-aspect-ratio:5/4)]:[--t:min(28vw,12.5svh)]"
            >
              {/* Centred as a block, its two lines (tall screens) aligned on the left */}
              <h1
                id="hero-title"
                className="display inline-block text-left text-(length:--t) font-bold whitespace-nowrap"
              >
                <span className="sr-only">
                  {person.firstName} {person.lastName}
                </span>
                <span aria-hidden>
                  <span className={mask}>
                    <span data-hero-word className="inline-block">
                      {person.firstName}
                    </span>
                  </span>
                  <span
                    data-ghost
                    className={clsx(ghost, 'hidden [@media(max-aspect-ratio:5/4)]:inline-block')}
                  />{' '}
                  <span className="[@media(max-aspect-ratio:5/4)]:block">
                    <span className={mask}>
                      <span data-hero-word className="inline-block">
                        {person.lastName}
                      </span>
                    </span>
                    <span
                      data-ghost
                      className={clsx(ghost, 'inline-block [@media(max-aspect-ratio:5/4)]:hidden')}
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
