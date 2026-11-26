import { useLayoutEffect, useRef, type MouseEvent } from 'react';
import { gsap } from '../lib/gsap';
import { hero, person } from '../data/content';
import { easeInOut, prefersReducedMotion, range } from '../lib/motion';
import { scrollToHash } from '../lib/scroll';
import Aurora from '../components/Aurora';
import clsx from '../lib/clsx';

// Each word rises out of a line just under its letters (room for the descender of the y)
const mask = 'inline-block [clip-path:inset(-0.3em_-0.1em_-0.25em)]';
// The ghost in place of a ®: after the last name on one line, after the first name on two (tall screens), where
// it stands a little bigger above the final d of the last name. The next band grows out of the one shown (Intro.tsx)
const ghost = 'ghost-shape motion-reduce:bg-ink relative ml-[0.05em] aspect-[231/289]';

// When the name starts to rise after the ghost's intro (s): while the ghost comes back up to its place
const INTRO_END = 1.6;
const INTRO_SEEN = 'intro-fantome';
let introSeen: boolean | undefined;
/** The ghost's intro plays once per visit (per tab). Read once per page load: StrictMode runs effects twice. */
function firstIntro() {
  if (introSeen === undefined) {
    try {
      // Not either when the page comes back scrolled down: the hero is out of sight
      introSeen = !!sessionStorage.getItem(INTRO_SEEN) || window.scrollY > 0;
      sessionStorage.setItem(INTRO_SEEN, '1');
    } catch {
      introSeen = true;
    }
  }
  return !introSeen;
}

/**
 * On the black screen the ghost pops up big in the middle, then flies one loop, half a figure of eight: down to
 * the left, back up, and on to its place after the name, shrinking as it lands while the name rises (from
 * INTRO_END on the timeline). Intro.tsx draws it where its place is.
 */
function ghostIntro(tl: gsap.core.Timeline, slots: HTMLElement[]) {
  const slot = slots.find((s) => s.offsetWidth) ?? slots[0];
  // Scaled to 0 about its centre, which is still the centre of its place: x/y from there to the screen's centre
  const r = slot.getBoundingClientRect();
  const cx = innerWidth / 2 - (r.left + r.width / 2);
  const cy = innerHeight / 2 - (r.top + r.height / 2);
  const big = Math.min(innerWidth * 0.3, 150) / slot.offsetHeight;
  const w = Math.min(innerWidth * 0.32, 320);
  const setX = gsap.quickSetter(slot, 'x', 'px');
  const setY = gsap.quickSetter(slot, 'y', 'px');
  // Not 'scale', which a quick setter does not take
  const setScaleX = gsap.quickSetter(slot, 'scaleX');
  const setScaleY = gsap.quickSetter(slot, 'scaleY');
  const loop = { u: 0 };
  gsap.set(slot, { x: cx, y: cy });
  tl.to(slots, { scale: big, opacity: 1, duration: 0.5, ease: 'back.out(2)' }, 0)
    .to(
      loop,
      {
        u: 1,
        duration: 1.8,
        ease: 'sine.inOut',
        onUpdate: () => {
          // The left half of the figure of eight (x = w sin a, y = w/2 sin 2a), its end drawn from the
          // centre of the screen to the ghost's place over the last two thirds
          const a = Math.PI * (1 + loop.u);
          const k = easeInOut(range(loop.u, 0.3, 1));
          setX(cx * (1 - k) + w * Math.sin(a));
          setY(cy * (1 - k) + (w / 2) * Math.sin(2 * a));
          if (k > 0) {
            setScaleX(big + (1 - big) * k);
            setScaleY(big + (1 - big) * k);
          }
        },
      },
      0.35,
    )
    // The other place too, out of sight, in case the layout switches
    .set(slots, { scale: 1, opacity: 1 }, '>')
    .play();
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  // Before the first paint, so that nothing shows in its final place for a frame
  useLayoutEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const intro = firstIntro();
    const slots = gsap.utils.toArray<HTMLElement>('[data-ghost]', el);
    let cancelled = false;
    let stopSkip = () => {};
    const ctx = gsap.context(() => {
      // Arrival, after the Velde site: the name rises in the middle of the black screen and its ghost
      // pops up in place of a ®; then the bar and the buttons appear. After the ghost's intro, if it plays
      const at = intro ? INTRO_END : 0;
      const tl = gsap
        .timeline({ defaults: { ease: 'expo.out' }, paused: intro })
        .from('[data-hero-word]', { yPercent: 140, duration: 1, stagger: 0.08 }, at)
        .from('[data-aurora]', { opacity: 0, duration: 3, ease: 'power1.inOut' }, at + 0.3)
        .from(
          [document.querySelector('header'), '[data-hero-actions]'],
          { opacity: 0, duration: 0.9 },
          at + 1.1,
        );
      if (!intro)
        tl.from(slots, { scale: 0, opacity: 0, duration: 0.7, ease: 'back.out(2.5)' }, 0.45);
      else {
        gsap.set(slots, { scale: 0, opacity: 0 });
        // Once the font is there (a second at most), so that the place the ghost flies to does not move
        Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1000))]).then(() => {
          if (cancelled) return;
          ctx.add(() => ghostIntro(tl, slots));
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

      // The name lags behind the scroll
      gsap.to('[data-layer="title"]', {
        yPercent: 40,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0 },
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
                    className={clsx(
                      ghost,
                      // Shifted by `left`, not a margin: the first line must stay narrower than the last name
                      '-top-[0.32em] left-[0.25em] hidden h-[0.44em] [@media(max-aspect-ratio:5/4)]:inline-block',
                    )}
                  />{' '}
                  <span className="[@media(max-aspect-ratio:5/4)]:block">
                    <span className={mask}>
                      <span data-hero-word className="inline-block">
                        {person.lastName}
                      </span>
                    </span>
                    <span
                      data-ghost
                      className={clsx(
                        ghost,
                        '-top-[0.38em] inline-block h-[0.34em] [@media(max-aspect-ratio:5/4)]:hidden',
                      )}
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
