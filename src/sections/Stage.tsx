import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { skills, stage } from '../data/content';
import { prefersReducedMotion } from '../lib/motion';
import useReveal from '../hooks/useReveal';
import orangeLogo from '../assets/logos/orange.svg';

const LOGOS = import.meta.glob<string>('../assets/logos/*.svg', { eager: true, import: 'default' });
// Tool name → logo file, as listed in the skills cards
const LOGO_OF: Record<string, string> = Object.fromEntries(
  skills.groups.flatMap((g) => g.items).map((s) => [s.name, s.logo]),
);

export default function Stage() {
  const root = useRef<HTMLElement>(null);
  const square = useRef<HTMLDivElement>(null);
  useReveal(root);

  // The Orange logo grows as the section scrolls in; each mission card's top bar sweeps in
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
          scrollTrigger: {
            trigger: square.current,
            start: 'top bottom',
            end: 'center 45%',
            scrub: 0.6,
          },
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
    <section
      id="stage"
      ref={root}
      tabIndex={-1}
      aria-labelledby="stage-title"
      data-theme="dark"
      className="bg-stage py-section relative text-white outline-none"
    >
      <div className="frame">
        <h2 id="stage-title" className="display title-xl">
          <span data-reveal="0" className="block">
            {stage.heading[0]}
          </span>
          <span data-reveal="1" className="block md:pl-[3vw]">
            {stage.heading[1]} <span className="text-orange">{stage.heading[2]}</span>
          </span>
        </h2>

        <div className="mt-16 grid items-start gap-x-6 gap-y-12 md:mt-28 md:grid-cols-12">
          <div
            ref={square}
            className="relative aspect-square w-full p-6 text-black will-change-transform md:col-span-5 md:p-8"
          >
            <img
              src={orangeLogo}
              alt="Logo Orange"
              width={284}
              height={284}
              className="absolute inset-0 size-full"
            />
            <p className="display tabular relative text-[clamp(4rem,12vw,11rem)]">{stage.year}</p>
            <p className="text-lead relative mt-3 max-w-[22ch] font-medium text-balance">
              {stage.role}
            </p>
          </div>

          <div className="md:col-span-6 md:col-start-7 md:self-end">
            <p data-reveal="0" className="text-lead text-pretty">
              {stage.intro}
            </p>
            <p data-reveal="1" className="text-lead mt-10 bg-white/5 p-6 text-pretty md:p-8">
              {stage.takeaway}
            </p>
          </div>
        </div>

        <h3 data-reveal="0" className="text-head mt-24 font-medium tracking-tight md:mt-36">
          Mes missions
        </h3>
        {/* One card per mission, with its tools; hovering turns it Orange */}
        <ul className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stage.missions.map((m, i) => (
            <li
              key={m.title}
              data-mission
              data-reveal={i}
              className="group ease-out-expo hover:bg-orange relative flex flex-col bg-white/[0.05] p-6 transition-colors duration-500 hover:text-black md:p-8"
            >
              <span
                data-bar
                aria-hidden
                className="bg-orange absolute inset-x-0 top-0 h-1 origin-left"
              />
              <div aria-hidden className="flex flex-wrap gap-2">
                {m.tools
                  .filter((t) => LOGO_OF[t])
                  .map((t) => (
                    <span key={t} className="bg-paper grid size-11 place-items-center p-2">
                      <img
                        src={LOGOS[`../assets/logos/${LOGO_OF[t]}.svg`]}
                        alt=""
                        width={28}
                        height={28}
                        className="size-full object-contain"
                      />
                    </span>
                  ))}
              </div>
              <p className="text-lead mt-8 font-medium text-balance">{m.title}</p>
              <p className="text-body mt-3 text-pretty text-white/80 transition-colors duration-500 group-hover:text-black/80">
                {m.detail}
              </p>
              <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-2 pt-8">
                <p className="text-small text-orange transition-colors duration-500 group-hover:text-black">
                  {m.tools.join(' · ')}
                </p>
                {m.url && (
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-body decoration-orange font-medium underline decoration-2 underline-offset-4 group-hover:decoration-black"
                  >
                    Voir le site
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
