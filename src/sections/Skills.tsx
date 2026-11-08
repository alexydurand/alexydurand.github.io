import { useRef, type MouseEvent } from 'react';
import { skills } from '../data/content';
import { scrollToHash } from '../lib/scroll';
import useReveal from '../hooks/useReveal';
import clsx from '../lib/clsx';
import LogoStack from '../components/LogoStack';
import type { Skill } from '../data/content';

// European language levels, in order
const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const LOGOS = import.meta.glob<string>('../assets/logos/*.svg', { eager: true, import: 'default' });
const logo = (name: string) => LOGOS[`../assets/logos/${name}.svg`];

export default function Skills() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  const toProjects = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToHash('#projets');
  };

  return (
    <section id="competences" ref={root} tabIndex={-1} aria-labelledby="skills-title" className="bg-bg pb-24 outline-none md:pb-36">
      <div className="frame pt-20 md:pt-28">
        <h2 id="skills-title" className="sr-only">
          {skills.heading}
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12">
          {skills.groups.map((g, i) => (
            <article
              key={g.title}
              data-reveal={i}
              className={clsx('group p-6 md:p-8', g.lead ? 'bg-accent text-accent-ink' : 'bg-surface', i === 2 ? 'lg:col-span-5' : 'lg:col-span-6')}
            >
              <h3 className="text-lead font-medium">{g.title}</h3>
              <LogoStack items={g.items} className="mt-6 lg:mt-8" />
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

          {/* AI-assisted development gets its own box, in the beige of the home page */}
          <article data-reveal="1" className="group grid gap-6 bg-sand p-6 text-ink md:col-span-2 md:p-8 lg:col-span-7 lg:grid-cols-[auto_1fr] lg:gap-10">
            <div className="flex items-center gap-5 lg:flex-col lg:items-start">
              <span className="grid size-16 shrink-0 place-items-center bg-paper p-3 lg:size-20 lg:p-4">
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
            <ul className="space-y-4 self-center text-small">
              {skills.vibe.items.map(([term, detail]) => (
                <li key={term} className="flex gap-3">
                  <span aria-hidden className="mt-[0.75em] size-1.5 shrink-0 bg-ink" />
                  <span>
                    <span className="block text-lead font-medium">{term}</span>
                    <span className="opacity-80">{detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </article>

          <div data-reveal="0" className="bg-accent p-6 text-accent-ink md:p-8 lg:col-span-8">
            <h3 className="text-lead font-medium">Savoir-être</h3>
            <ul className="mt-6 space-y-1">
              {skills.soft.map((s) => (
                <li
                  key={s}
                  className="group/soft relative py-1 text-[clamp(1.375rem,1.1rem+1vw,2rem)] font-medium tracking-tight transition-transform duration-500 ease-out-expo hover:translate-x-3 motion-reduce:hover:translate-x-0"
                >
                  <span aria-hidden className="absolute top-1/2 -left-4 size-2 -translate-y-1/2 scale-50 rounded-full bg-accent-ink opacity-0 transition-[scale,opacity] duration-300 group-hover/soft:scale-100 group-hover/soft:opacity-100" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          {/* Level on the European scale; hovering the card redraws the bar */}
          <div data-reveal="1" className="group bg-surface p-6 md:p-8 lg:col-span-4">
            <h3 className="text-lead font-medium">Langues</h3>
            <ul className="mt-6 space-y-6">
              {skills.languages.map((l) => {
                const reached = CEFR.indexOf(l.level);
                return (
                  <li key={l.name}>
                    <p className="flex items-baseline justify-between text-lead">
                      {l.name} <span className="font-medium text-accent">{l.level}</span>
                    </p>
                    <div aria-hidden className="mt-4 grid grid-cols-6 gap-1">
                      {CEFR.map((lv, k) => (
                        <span key={lv} className="h-2.5 overflow-hidden bg-surface-2">
                          {k <= reached && (
                            <span
                              style={{ animationDelay: `${k * 70}ms` }}
                              className="block size-full origin-left bg-accent group-hover:animate-[sweep_0.6s_var(--ease-out-expo)_both] motion-reduce:group-hover:animate-none"
                            />
                          )}
                        </span>
                      ))}
                    </div>
                    <div aria-hidden className="mt-2 grid grid-cols-6 gap-1 text-small text-muted tabular">
                      {CEFR.map((lv) => (
                        <span key={lv}>{lv}</span>
                      ))}
                    </div>
                  </li>
                );
              })}
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
