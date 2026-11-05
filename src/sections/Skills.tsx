import { useEffect, useRef, type MouseEvent } from 'react';
import { gsap } from '../lib/gsap';
import { hero, person, skills } from '../data/content';
import { prefersReducedMotion } from '../lib/motion';
import { scrollToHash } from '../lib/scroll';
import useReveal from '../hooks/useReveal';
import clsx from '../lib/clsx';
import type { Skill } from '../data/content';

const LOGOS = import.meta.glob<string>('../assets/logos/*.svg', { eager: true, import: 'default' });
const logo = (name: string) => LOGOS[`../assets/logos/${name}.svg`];

/**
 * The tools of a card as a deck of tiles, the first one in front; the deck deals itself into a row when
 * the card is hovered (large screens). Smaller screens show the row directly. Names are listed below.
 */
function LogoStack({ items, ring }: { items: Skill[]; ring: string }) {
  return (
    <div aria-hidden className="mt-6 flex flex-wrap gap-2 lg:mt-8 lg:flex-nowrap lg:gap-0">
      {items.map((s, i) => (
        <span
          key={s.name}
          style={{ '--i': i, zIndex: items.length - i, transitionDelay: `${i * 30}ms` } as React.CSSProperties}
          className={clsx(
            'grid size-12 shrink-0 place-items-center bg-paper p-2.5 ring-4 lg:size-13 lg:p-3 lg:not-first:-ml-[2.625rem]',
            'origin-left transition-[translate,scale] duration-500 ease-out-expo motion-reduce:transition-none',
            'lg:scale-[calc(1-var(--i)*0.06)] lg:group-hover:translate-x-[calc(var(--i)*3rem)] lg:group-hover:scale-100',
            ring,
          )}
        >
          <img src={logo(s.logo)} alt="" width={32} height={32} className="size-full object-contain" />
        </span>
      ))}
    </div>
  );
}

function Strip({ items, className, stripRef }: { items: string[]; className: string; stripRef: React.Ref<HTMLDivElement> }) {
  return (
    <div aria-hidden className="overflow-hidden whitespace-nowrap">
      <div ref={stripRef} className={clsx('display inline-block text-[clamp(2.25rem,5.2vw,5rem)] leading-[1.05]', className)}>
        {[...items, ...items, ...items].map((s, i) => (
          <span key={i} className="mr-[0.6em]">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Skills() {
  const root = useRef<HTMLElement>(null);
  const dataStrip = useRef<HTMLDivElement>(null);
  const devStrip = useRef<HTMLDivElement>(null);
  useReveal(root);

  // Two strips of languages slide in opposite directions with the scroll
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const st = { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true };
      gsap.fromTo(dataStrip.current, { xPercent: -2 }, { xPercent: -30, ease: 'none', scrollTrigger: st });
      gsap.fromTo(devStrip.current, { xPercent: -30 }, { xPercent: -2, ease: 'none', scrollTrigger: st });
    }, el);
    return () => ctx.revert();
  }, []);

  const toContact = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToHash('#contact');
  };
  const toProjects = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToHash('#projets');
  };

  return (
    <section id="competences" ref={root} tabIndex={-1} aria-labelledby="skills-title" className="bg-bg pb-24 outline-none md:pb-36">
      {/* Who I am, in one sentence */}
      <div className="frame grid gap-8 pt-6 md:grid-cols-12 md:pt-10">
        <p data-reveal="0" className="text-[clamp(1.25rem,1rem+1vw,2rem)] leading-snug text-pretty md:col-span-8">
          {hero.sentence}
        </p>
        <div data-reveal="1" className="flex flex-wrap items-center gap-x-6 gap-y-3 md:col-span-4 md:justify-end md:self-end">
          <a
            href={person.cv}
            download
            className="inline-flex min-h-12 items-center bg-accent px-6 text-body font-medium whitespace-nowrap text-accent-ink transition-colors duration-200 hover:bg-accent-deep active:translate-y-px"
          >
            {hero.action}
          </a>
          <a
            href="#contact"
            onClick={toContact}
            className="py-3 text-body underline decoration-1 underline-offset-4 hover:decoration-2"
          >
            {hero.secondary}
          </a>
        </div>
      </div>

      {/* Languages and tools, data first */}
      <div className="mt-20 space-y-1 md:mt-28">
        <Strip items={skills.stripData} className="text-accent" stripRef={dataStrip} />
        <Strip items={skills.stripDev} className="text-ink" stripRef={devStrip} />
      </div>

      <div className="frame mt-20 md:mt-28">
        <h2 id="skills-title" className="sr-only">
          {skills.heading}
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12">
          {skills.groups.map((g, i) => (
            <article
              key={g.title}
              data-reveal={i}
              className={clsx('group p-6 md:p-8', g.lead ? 'bg-accent text-accent-ink' : 'bg-surface', i === 2 ? 'lg:col-span-4' : 'lg:col-span-6')}
            >
              <h3 className="text-lead font-medium">{g.title}</h3>
              <LogoStack items={g.items} ring={g.lead ? 'ring-accent' : 'ring-surface'} />
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-1 text-lead">
                {g.items.map((s: Skill) => (
                  <li key={s.name}>
                    {s.name}
                    {s.learning && <span className="ml-2 text-small opacity-85">en cours d’apprentissage</span>}
                  </li>
                ))}
              </ul>
              <p className={clsx('mt-5 text-small', g.lead ? 'opacity-90' : 'text-muted')}>{g.note}</p>
            </article>
          ))}

          {/* AI-assisted development gets its own, darker box */}
          <article data-reveal="1" className="group grid gap-6 bg-ink p-6 text-bg md:col-span-2 md:p-8 lg:col-span-8 lg:grid-cols-[auto_1fr] lg:gap-10">
            <div className="flex items-center gap-5 lg:flex-col lg:items-start">
              <span className="grid size-16 shrink-0 place-items-center bg-paper p-3 lg:size-24 lg:p-5">
                <img
                  src={logo(skills.vibe.tool.logo)}
                  alt=""
                  width={64}
                  height={64}
                  className="size-full transition-transform duration-700 ease-out-expo group-hover:rotate-90 motion-reduce:transition-none"
                />
              </span>
              <div>
                <h3 className="text-lead font-medium">{skills.vibe.title}</h3>
                <p className="text-body opacity-80">avec {skills.vibe.tool.name}</p>
              </div>
            </div>
            <div>
              <p className="text-body text-pretty">{skills.vibe.note}</p>
              <ul className="mt-5 space-y-2 text-body">
                {skills.vibe.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 bg-bg" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <div data-reveal="0" className="bg-surface p-6 md:p-8 lg:col-span-8">
            <h3 className="text-lead font-medium">Savoir-être</h3>
            <ul className="mt-5 flex flex-wrap gap-x-10 gap-y-2 text-lead">
              {skills.soft.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <div data-reveal="1" className="bg-surface p-6 md:p-8 lg:col-span-4">
            <h3 className="text-lead font-medium">Langues</h3>
            <ul className="mt-5 text-lead">
              {skills.languages.map((l) => (
                <li key={l.name}>
                  {l.name} <span className="text-muted">{l.level}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <a
          href="#projets"
          onClick={toProjects}
          data-reveal="0"
          className="group mt-20 flex items-center gap-4 text-[clamp(1.375rem,1.1rem+1vw,2rem)] font-medium tracking-tight md:mt-28"
        >
          <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-[1vw] motion-reduce:group-hover:translate-x-0">
            Ces compétences, je les ai mises en pratique dans mes projets
          </span>
          <svg viewBox="0 0 24 24" aria-hidden className="size-7 shrink-0 text-accent transition-transform duration-500 ease-out-expo group-hover:translate-y-1" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </a>
      </div>
    </section>
  );
}
