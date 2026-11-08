import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { person } from '../data/content';
import { prefersReducedMotion } from '../lib/motion';
import sky from '../assets/hero/sky.webp';
import mountain from '../assets/hero/mountain.webp';
import foreground from '../assets/hero/foreground.webp';

// How far each layer lags behind the scroll (yPercent over the hero): far layers lag most
const DEPTH = { sky: 70, mountain: 55, title: 40, foreground: 10 };

const layerImg = 'pointer-events-none absolute top-[-17.5%] left-0 h-[117.5%] w-full max-w-none object-cover';

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from('[data-hero-title] > *', { y: 40, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.12 });
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
    <section id="top" ref={root} aria-labelledby="hero-title" className="relative overflow-hidden bg-bg">
      <div className="relative h-svh min-h-[560px]">
        <div className="absolute inset-0 overflow-hidden">
          <img data-layer="sky" src={sky} alt="" width={2000} height={1250} fetchPriority="high" className={layerImg} />
          <img data-layer="mountain" src={mountain} alt="" width={2000} height={1250} className={layerImg} />
          <div data-layer="title" className="absolute inset-0 flex items-center justify-center pb-[12svh]">
            <div data-hero-title className="frame text-center text-ink">
              <h1 id="hero-title" className="display text-[clamp(2.75rem,10vw,10rem)] font-bold whitespace-nowrap">
                {/* The square that grows into the next band (Intro.tsx); drawn here only without motion */}
                <span aria-hidden data-square className="motion-reduce:bg-ink mr-[0.1em] inline-block size-[0.72em]" />
                {person.firstName} {person.lastName}
              </h1>
              <p className="mt-3 text-lead font-medium md:mt-5">{person.role}</p>
            </div>
          </div>
          <img
            data-layer="foreground"
            src={foreground}
            alt="Le pic du Midi d’Ossau, dans les Pyrénées, au-dessus d’un lac"
            width={2000}
            height={1250}
            className={layerImg}
          />
        </div>
        {/* The photo dissolves into the page ground */}
        <div aria-hidden className="hero-fade pointer-events-none absolute inset-x-0 bottom-0 h-[24%]" />
      </div>
    </section>
  );
}
