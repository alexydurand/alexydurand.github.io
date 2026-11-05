import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { stage } from '../data/content';
import { prefersReducedMotion } from '../lib/motion';
import useReveal from '../hooks/useReveal';

export default function Stage() {
  const root = useRef<HTMLElement>(null);
  const square = useRef<HTMLDivElement>(null);
  useReveal(root);

  // The orange square grows as the section scrolls in; each mission's bar sweeps in
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        square.current,
        { scale: 0.3, rotate: -8 },
        {
          scale: 1,
          rotate: 0,
          ease: 'none',
          scrollTrigger: { trigger: square.current, start: 'top bottom', end: 'center 45%', scrub: 0.6 },
        },
      );
      gsap.utils.toArray<HTMLElement>('[data-mission]').forEach((row) => {
        gsap.from(row.querySelector('[data-bar]'), {
          scaleX: 0,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: { trigger: row, start: 'top 85%', once: true },
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section id="stage" ref={root} tabIndex={-1} aria-labelledby="stage-title" data-theme="dark"
      className="relative bg-stage py-section text-white outline-none">
      <div className="frame">
        <h2 id="stage-title" className="display title-xl">
          <span data-reveal="0" className="block">
            {stage.heading[0]}
          </span>
          <span data-reveal="1" className="block md:pl-[3vw]">
            {stage.heading[1]} <span className="text-orange">{stage.heading[2]}</span>
          </span>
        </h2>

        <div className="mt-16 grid gap-x-6 gap-y-16 md:mt-28 md:grid-cols-12">
          <div className="md:sticky md:top-28 md:col-span-5 md:self-start">
            <div ref={square} className="flex aspect-square w-full flex-col justify-between bg-orange p-6 text-black will-change-transform md:p-8">
              <p className="display text-[clamp(4rem,12vw,11rem)] tabular">{stage.year}</p>
              <div>
                <p className="text-lead font-medium text-balance">{stage.role}</p>
                <p className="mt-1 text-body">{stage.place}</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-6 md:col-start-7">
            <p data-reveal="0" className="text-lead text-pretty">
              {stage.intro}
            </p>

            <h3 data-reveal="1" className="mt-16 text-head font-medium tracking-tight">
              Mes missions
            </h3>
            <ul className="mt-6">
              {stage.missions.map((m) => (
                <li
                  key={m.title}
                  data-mission
                  className="group relative py-6 transition-transform duration-300 ease-out-expo hover:translate-x-2 motion-reduce:hover:translate-x-0"
                >
                  <span
                    data-bar
                    aria-hidden
                    className="absolute top-0 left-0 h-1 w-16 origin-left bg-orange transition-[width] duration-500 ease-out-expo group-hover:w-full"
                  />
                  <p className="text-lead font-medium">{m.title}</p>
                  <p className="mt-2 text-body text-pretty">
                    {m.detail}
                    {m.url && (
                      <>
                        {' '}
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline decoration-orange decoration-2 underline-offset-4 transition-colors hover:text-orange"
                        >
                          Voir le site
                        </a>
                      </>
                    )}
                  </p>
                  <p className="mt-2 text-small text-orange">{m.tools.join(' · ')}</p>
                </li>
              ))}
            </ul>

            <p data-reveal="0" className="mt-16 bg-white/5 p-6 text-lead text-pretty md:p-8">
              {stage.takeaway}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
