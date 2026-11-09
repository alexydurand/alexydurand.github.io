import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { skills, stage } from '../data/content';
import { prefersReducedMotion } from '../lib/motion';
import { scrollToHash } from '../lib/scroll';
import useReveal from '../hooks/useReveal';
import orangeLogo from '../assets/logos/orange.svg';
import LogoStack from '../components/LogoStack';
import clsx from '../lib/clsx';
import type { Skill } from '../data/content';

// Tool name → its logo, as listed in the skills cards
const SKILL: Record<string, Skill> = Object.fromEntries(
  skills.groups.flatMap((g) => g.items).map((s) => [s.name, s]),
);

// On hover the orange top bar runs on around the card, one side after the other, and unwinds on leaving
const EDGES = [
  'inset-y-0 right-0 w-1 origin-top scale-y-0 delay-[340ms] group-hover:scale-y-100 group-hover:delay-0',
  'inset-x-0 bottom-0 h-1 origin-right scale-x-0 delay-[170ms] group-hover:scale-x-100 group-hover:delay-[170ms]',
  'inset-y-0 left-0 w-1 origin-bottom scale-y-0 group-hover:scale-y-100 group-hover:delay-[340ms]',
];

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
          <div ref={square} className="aspect-square w-full will-change-transform md:col-span-5">
            <img
              src={orangeLogo}
              alt="Logo Orange"
              width={284}
              height={284}
              className="size-full"
            />
          </div>

          {/* Year and role at the top, aligned with the logo; the story at the bottom */}
          <div className="flex flex-col gap-12 md:col-span-6 md:col-start-7 md:self-stretch">
            <div>
              <p
                data-reveal="0"
                className="display tabular text-orange text-[clamp(4rem,10vw,9.5rem)]"
              >
                {stage.year}
              </p>
              <p data-reveal="1" className="text-lead mt-3 font-medium text-balance">
                {stage.role}
              </p>
            </div>
            <div className="md:mt-auto">
              <p data-reveal="0" className="text-lead text-pretty">
                {stage.intro}
              </p>
              <p data-reveal="1" className="text-lead mt-10 bg-white/5 p-6 text-pretty md:p-8">
                {stage.takeaway}
              </p>
            </div>
          </div>
        </div>

        <h3 data-reveal="0" className="text-head mt-24 font-medium tracking-tight md:mt-36">
          Mes missions
        </h3>
        {/* One card per mission. The reveal animates the li (GSAP pins its `scale`); the hover zoom is on the card inside */}
        <ul className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stage.missions.map((m, i) => (
            <li key={m.title} data-mission data-reveal={i} className="flex">
              <div className="group ease-out-expo relative flex w-full flex-col bg-white/[0.05] p-6 transition-[scale] duration-300 hover:scale-[1.03] motion-reduce:hover:scale-100 md:p-8">
                <span
                  data-bar
                  aria-hidden
                  className="bg-orange absolute inset-x-0 top-0 h-1 origin-left"
                />
                {EDGES.map((edge) => (
                  <span
                    key={edge}
                    aria-hidden
                    className={clsx(
                      'bg-orange absolute transition-[scale] duration-[170ms] ease-linear',
                      edge,
                    )}
                  />
                ))}
                <LogoStack items={m.tools.filter((t) => SKILL[t]).map((t) => SKILL[t])} dark />
                <p className="text-lead mt-8 font-medium text-balance">{m.title}</p>
                <p className="text-body mt-3 text-pretty text-white/80">{m.detail}</p>
                <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-2 pt-8">
                  <p className="text-small text-orange">{m.tools.join(' · ')}</p>
                  {m.url && (
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-body decoration-orange font-medium underline decoration-2 underline-offset-4 hover:decoration-white"
                    >
                      Voir le site
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
        <a
          href="#bilan"
          data-reveal="0"
          onClick={(e) => {
            e.preventDefault();
            scrollToHash('#bilan');
          }}
          className="text-lead decoration-orange mt-10 inline-flex min-h-11 items-center font-medium underline decoration-2 underline-offset-4 hover:decoration-white"
        >
          {stage.skillsLink}
        </a>
      </div>
    </section>
  );
}
