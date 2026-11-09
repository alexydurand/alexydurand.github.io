import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { person } from '../data/content';
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
      gsap.from('[data-hero-title] > *', {
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
    <section id="top" ref={root} aria-labelledby="hero-title" className="bg-bg relative">
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
            <div data-hero-title className="frame text-ink">
              <h1
                id="hero-title"
                className="display text-[clamp(2.75rem,10vw,10rem)] font-bold whitespace-nowrap"
              >
                {/* The ghost's place: the next band grows out of it (Intro.tsx); drawn here only without motion */}
                <span
                  aria-hidden
                  data-ghost
                  className="ghost-shape motion-reduce:bg-ink mr-[0.1em] inline-block aspect-[231/289] h-[0.72em]"
                />
                {person.firstName} {person.lastName}
              </h1>
              <p className="text-lead mt-3 font-medium md:mt-5">{person.role}</p>
            </div>
          </div>
          <div
            data-layer="portrait"
            className="[container-type:size] pointer-events-none absolute inset-0"
          >
            <img
              src={portrait}
              alt={`Portrait de ${person.firstName} ${person.lastName}`}
              width={601}
              height={613}
              className="hero-portrait"
            />
          </div>
          <img
            data-layer="foreground"
            src={foreground}
            alt="Des collines sombres sous un ciel beige"
            width={2400}
            height={1361}
            className={layerImg}
          />
        </div>
        {/* Just below the fold: the dark ground of the hills dissolves into the page once it scrolls */}
        <div
          aria-hidden
          className="hero-fade pointer-events-none absolute inset-x-0 top-full h-[24%]"
        />
      </div>
    </section>
  );
}
