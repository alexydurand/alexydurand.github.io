import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { person, ui } from '../data/content';
import { prefersReducedMotion } from '../lib/motion';
import { crestPath, type Point } from '../lib/ridge';
import foreground from '../assets/hero/foreground.webp';
import portrait from '../assets/hero/portrait.webp';

// How far each layer lags behind the scroll (yPercent over the hero): far layers lag most
const DEPTH = { title: 40, portrait: 25, foreground: 10 };

// The crests of the hills, measured on their picture (2400 × 1361), far to near: on the dark, a white line
// draws each one, brighter the farther it is. The middle hill shows on both sides of the far one.
const CRESTS: { pts: Point[]; className: string }[] = [
  {
    pts: [
      [0, 1006],
      [80, 1017],
      [160, 1028],
      [240, 1034],
      [320, 1036],
      [400, 1032],
      [480, 1028],
      [560, 1024],
      [640, 1024],
      [720, 1030],
      [760, 1033],
      [800, 1030],
      [840, 1029],
      [880, 1039],
      [960, 1044],
      [1040, 1045],
      [1120, 1042],
      [1200, 1038],
      [1280, 1022],
      [1360, 1009],
      [1440, 1002],
      [1520, 1000],
      [1560, 1006],
      [1600, 1015],
      [1680, 1019],
      [1760, 1018],
      [1840, 1009],
      [1920, 987],
      [2000, 963],
      [2080, 940],
      [2160, 919],
      [2240, 900],
      [2280, 895],
      [2400, 895],
    ],
    className: 'stroke-[2.5] opacity-90',
  },
  {
    pts: [
      [0, 1143],
      [120, 1150],
      [240, 1136],
      [300, 1124],
      [420, 1098],
      [480, 1088],
      [540, 1072],
      [600, 1060],
      [660, 1048],
      [740, 1034],
    ],
    className: 'stroke-2 opacity-55',
  },
  {
    pts: [
      [1580, 1012],
      [1680, 1036],
      [1800, 1042],
      [1920, 1045],
      [2040, 1041],
      [2160, 1042],
      [2280, 1047],
      [2400, 1056],
    ],
    className: 'stroke-2 opacity-55',
  },
  {
    pts: [
      [0, 1268],
      [240, 1282],
      [450, 1250],
      [700, 1274],
      [1000, 1268],
      [1300, 1230],
      [1550, 1250],
      [1800, 1236],
      [1950, 1188],
      [2100, 1140],
      [2220, 1116],
      [2400, 1160],
    ],
    className: 'stroke-2 opacity-35',
  },
];

const layerImg =
  'pointer-events-none absolute top-[-17.5%] left-0 h-[117.5%] w-full max-w-none object-cover';
// Each word rises out of a line just under its letters (room for the descender of the y)
const mask = 'inline-block [clip-path:inset(-0.3em_-0.1em_-0.25em)]';

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  // Before the first paint, so that nothing shows in its final place for a frame
  useLayoutEffect(() => {
    const el = root.current;
    const name = el?.querySelector('h1');
    if (!el || !name || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      // Arrival, after the Velde site: the name rises in the middle of the dark screen and its ghost
      // pops up in place of a ®; then it goes up to its place while the hills, their white crests
      // already on them, and the portrait come up from below
      const r = name.getBoundingClientRect();
      gsap
        .timeline({ defaults: { ease: 'expo.out' } })
        .from('[data-hero-word]', { yPercent: 140, duration: 1, stagger: 0.08 })
        .from('[data-ghost]', { scale: 0, opacity: 0, duration: 0.7, ease: 'back.out(2.5)' }, 0.45)
        .from(
          '[data-hero-title]',
          { y: innerHeight / 2 - r.top - r.height / 2, duration: 1, ease: 'expo.inOut' },
          1.1,
        )
        .from('[data-layer="foreground"]', { y: innerHeight * 0.45, duration: 1.5 }, 1.3)
        .from('.hero-portrait', { y: innerHeight, duration: 1.5 }, 1.45)
        .from('[data-hero-title] p, [data-hero-role]', { y: 24, opacity: 0, duration: 0.9 }, 1.9)
        .from(document.querySelector('header'), { opacity: 0, duration: 0.9 }, 2);

      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0 },
      });
      (Object.keys(DEPTH) as (keyof typeof DEPTH)[]).forEach((layer) => {
        tl.to(`[data-layer="${layer}"]`, { yPercent: DEPTH[layer], ease: 'none' }, 0);
      });
    }, el);
    return () => ctx.revert();
  }, []);

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
          {/* A little above the middle, on the left; on a tall screen it stands on two lines, and its line goes down on the hills */}
          <div
            data-layer="title"
            className="absolute inset-0 flex items-start pt-[24svh] [@media(max-aspect-ratio:5/4)]:items-center [@media(max-aspect-ratio:5/4)]:pt-0 [@media(max-aspect-ratio:5/4)]:pb-[34svh]"
          >
            {/* --t: size of the name */}
            <div
              data-hero-title
              className="frame text-ink [--t:clamp(2.75rem,10vw,10rem)] [@media(max-aspect-ratio:5/4)]:[--t:min(28vw,12.5svh)]"
            >
              <h1
                id="hero-title"
                className="display ml-[3vw] text-(length:--t) font-bold whitespace-nowrap [@media(max-aspect-ratio:5/4)]:ml-0"
              >
                <span className="sr-only">
                  {person.firstName} {person.lastName}
                </span>
                <span aria-hidden>
                  <span className={mask}>
                    <span data-hero-word className="inline-block">
                      {person.firstName}
                    </span>
                  </span>{' '}
                  <span className="[@media(max-aspect-ratio:5/4)]:block">
                    <span className={mask}>
                      <span data-hero-word className="inline-block">
                        {person.lastName}
                      </span>
                    </span>
                    {/* In place of a ®: the next band grows out of it (Intro.tsx); drawn here only without motion */}
                    <span
                      data-ghost
                      className="ghost-shape motion-reduce:bg-ink relative -top-[0.38em] ml-[0.05em] inline-block aspect-[231/289] h-[0.34em]"
                    />
                  </span>
                </span>
              </h1>
              <p className="text-lead mt-5 ml-[3vw] font-medium [@media(max-aspect-ratio:5/4)]:hidden">
                {person.role}
              </p>
            </div>
          </div>
          <div
            data-layer="portrait"
            className="[container-type:size] pointer-events-none absolute inset-0"
          >
            <img
              src={portrait}
              alt={ui.portrait}
              width={601}
              height={613}
              fetchPriority="high"
              className="hero-portrait"
            />
          </div>
          <div data-layer="foreground" className={layerImg}>
            <img
              src={foreground}
              alt={ui.hills}
              width={2400}
              height={1361}
              className="size-full object-cover grayscale"
            />
            {/* Same box and cover as the picture, so each line stays on its crest */}
            <svg
              aria-hidden
              viewBox="0 0 2400 1361"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 size-full fill-none stroke-white"
            >
              {CRESTS.map(({ pts, className }) => (
                <path key={String(pts[0])} d={crestPath(pts)} className={className} />
              ))}
            </svg>
            {/* Tall screens: the line moves down onto the dark hills, which it fills */}
            <p
              data-hero-role
              className="frame absolute inset-x-0 bottom-[16svh] hidden text-[clamp(1.375rem,6.2vw,2.5rem)] leading-tight font-medium text-balance text-white [@media(max-aspect-ratio:5/4)]:block"
            >
              {person.role}
            </p>
          </div>
        </div>
        {/* Just below the fold: the dark ground of the hills dissolves into the page once it scrolls */}
        <div
          aria-hidden
          className="hero-fade pointer-events-none absolute inset-x-0 top-full h-[calc(24%+100lvh-100svh)]"
        />
      </div>
    </section>
  );
}
