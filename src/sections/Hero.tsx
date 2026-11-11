import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { person, ui } from '../data/content';
import { prefersReducedMotion } from '../lib/motion';
import sky from '../assets/hero/sky.webp';
import foreground from '../assets/hero/foreground.webp';
import portrait from '../assets/hero/portrait.webp';

// How far each layer lags behind the scroll (yPercent over the hero): far layers lag most
const DEPTH = { sky: 70, title: 40, portrait: 25, foreground: 10 };

const layerImg =
  'pointer-events-none absolute top-[-17.5%] left-0 h-[117.5%] w-full max-w-none object-cover';

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-hero-title] > *, [data-hero-role]', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        stagger: 0.12,
      });
      // Rises from behind the hills
      gsap.from('.hero-portrait', { y: 80, duration: 1.4, ease: 'expo.out', delay: 0.15 });
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
    // Stays light on the dark page: its own light colours (keep-light), dark words in the bar
    <section
      id="top"
      ref={root}
      aria-labelledby="hero-title"
      data-theme="light"
      className="keep-light bg-bg relative"
    >
      <div className="relative h-svh min-h-[560px]">
        <div className="absolute inset-0 overflow-hidden">
          <img
            data-layer="sky"
            src={sky}
            alt=""
            width={2400}
            height={1361}
            fetchPriority="high"
            className={layerImg}
          />
          <div
            data-layer="title"
            className="absolute inset-0 flex items-center pb-[12svh] [@media(max-aspect-ratio:5/4)]:pb-[34svh]"
          >
            {/* --t: size of the name. On a tall screen it stands on two lines, and its line goes down on the hills */}
            <div
              data-hero-title
              className="frame text-ink [--t:clamp(2.75rem,10vw,10rem)] [@media(max-aspect-ratio:5/4)]:[--t:min(28vw,12.5svh)]"
            >
              <h1
                id="hero-title"
                className="display ml-[3vw] text-(length:--t) font-bold whitespace-nowrap [@media(max-aspect-ratio:5/4)]:ml-0"
              >
                {/* The ghost's place: the next band grows out of it (Intro.tsx); drawn here only without motion */}
                <span
                  aria-hidden
                  data-ghost
                  className="ghost-shape motion-reduce:bg-coal mr-[0.1em] inline-block aspect-[231/289] h-[0.72em]"
                />
                {person.firstName}{' '}
                <span className="[@media(max-aspect-ratio:5/4)]:block">{person.lastName}</span>
              </h1>
              {/* Lined up with the first name, not the ghost (its width and margin, in the name's em) */}
              <p className="text-lead mt-5 ml-[calc(3vw+var(--t)*0.675)] font-medium [@media(max-aspect-ratio:5/4)]:hidden">
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
              className="hero-portrait"
            />
          </div>
          <div data-layer="foreground" className={layerImg}>
            <img
              src={foreground}
              alt={ui.hills}
              width={2400}
              height={1361}
              className="size-full object-cover"
            />
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
