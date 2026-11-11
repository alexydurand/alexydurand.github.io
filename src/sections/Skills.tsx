import { useEffect, useRef, type MouseEvent } from 'react';
import { skills, ui } from '../data/content';
import { scrollToHash } from '../lib/scroll';
import useReveal from '../hooks/useReveal';
import clsx from '../lib/clsx';
import LogoStack from '../components/LogoStack';
import { gsap } from '../lib/gsap';
import { prefersReducedMotion } from '../lib/motion';
import type { Skill } from '../data/content';

// European language levels, in order
const CEFR = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const LOGOS = import.meta.glob<string>('../assets/logos/*.svg', { eager: true, import: 'default' });
const logo = (name: string) => LOGOS[`../assets/logos/${name}.svg`];

export default function Skills() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  // Once a card is in, its content follows: the logos pop up one by one, the Vibe coding lines slide in,
  // the language levels fill up. Under the mouse, a card tilts towards the pointer.
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const follow = (selector: string, from: gsap.TweenVars, items = ':scope > *') =>
        el.querySelectorAll<HTMLElement>(selector).forEach((group) =>
          gsap.from(group.querySelectorAll(items), {
            duration: 0.8,
            delay: 0.25,
            ...from,
            scrollTrigger: { trigger: group, start: 'top 90%', once: true },
          }),
        );
      follow('[data-logos]', { scale: 0.4, y: 14, opacity: 0, stagger: 0.06, ease: 'back.out(2.2)' });
      follow('[data-lines]', { x: -28, opacity: 0, stagger: 0.1, ease: 'expo.out' });
      follow('[data-levels]', { scaleX: 0, stagger: 0.08, ease: 'expo.out' }, 'span > span');

      // GSAP owns the cards' transform (their entrance, useReveal), so it tilts them too
      const cleanups = [...el.querySelectorAll<HTMLElement>('[data-tilt]')].map((card) => {
        gsap.set(card, { transformPerspective: 1000 });
        const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'expo.out' });
        const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'expo.out' });
        const move = (e: PointerEvent) => {
          if (e.pointerType !== 'mouse') return;
          const r = card.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 8);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
        };
        const leave = () => (rx(0), ry(0));
        card.addEventListener('pointermove', move);
        card.addEventListener('pointerleave', leave);
        return () => {
          card.removeEventListener('pointermove', move);
          card.removeEventListener('pointerleave', leave);
        };
      });
      return () => cleanups.forEach((off) => off());
    }, el);
    return () => ctx.revert();
  }, []);

  const toProjects = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToHash('#projets');
  };

  return (
    <section
      id="outils"
      ref={root}
      tabIndex={-1}
      aria-labelledby="skills-title"
      className="bg-bg pb-24 outline-none md:pb-36"
    >
      <div className="frame pt-20 md:pt-28">
        <h2 id="skills-title" data-reveal="0" className="display title-xl">
          {skills.heading}
        </h2>

        <div className="mt-12 grid gap-6 md:mt-20 md:grid-cols-2 lg:grid-cols-12">
          {skills.groups.map((g, i) => (
            <article
              key={i}
              data-reveal={i}
              data-tilt
              className={clsx(
                'p-6 md:p-8',
                g.lead ? 'bg-surface-2 text-white' : 'bg-surface',
                i === 2 ? 'lg:col-span-5' : 'lg:col-span-6',
              )}
            >
              <h3 className="text-lead font-medium">{g.title}</h3>
              <LogoStack items={g.items} className="mt-6 lg:mt-8" />
              <ul className="text-lead mt-6 flex flex-wrap gap-x-5 gap-y-1">
                {g.items.map((s: Skill) => (
                  <li key={s.name}>
                    {s.name}
                    {s.learning && (
                      <span className="text-small ml-2 opacity-85">{ui.learning}</span>
                    )}
                  </li>
                ))}
              </ul>
              <p className={clsx('text-small mt-5', g.lead ? 'opacity-90' : 'text-muted')}>
                {g.note}
              </p>
            </article>
          ))}

          {/* AI-assisted development gets its own box */}
          <article
            data-reveal="1"
            data-tilt
            className="group bg-surface-2 grid text-white gap-6 p-6 md:col-span-2 md:p-8 lg:col-span-7 lg:grid-cols-[auto_1fr] lg:gap-10"
          >
            <div className="flex items-center gap-5 lg:flex-col lg:items-start">
              <span className="grid size-16 shrink-0 place-items-center lg:size-20">
                <img
                  src={logo(skills.vibe.tool.logo)}
                  alt=""
                  width={64}
                  height={64}
                  className="ease-out-expo size-full transition-transform duration-700 group-hover:rotate-90 motion-reduce:transition-none"
                />
              </span>
              <div>
                <h3 className="text-lead font-medium">{skills.vibe.title}</h3>
                <p className="text-body opacity-80">
                  {ui.with} {skills.vibe.tool.name}
                </p>
              </div>
            </div>
            <ul data-lines className="text-small space-y-4 self-center">
              {skills.vibe.items.map(([term, detail], i) => (
                <li key={i} className="flex gap-3">
                  <span aria-hidden className="bg-ink mt-[0.75em] size-1.5 shrink-0" />
                  <span>
                    <span className="text-lead block font-medium">{term}</span>
                    <span className="opacity-80">{detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </article>

          <div
            data-reveal="0"
            data-tilt
            className="bg-surface-2 p-6 text-white md:p-8 lg:col-span-8"
          >
            <h3 className="text-lead font-medium">{ui.soft}</h3>
            <ul className="mt-6 space-y-1">
              {skills.soft.map((s) => (
                <li
                  key={s}
                  className="group/soft ease-out-expo relative py-1 text-[clamp(1.375rem,1.1rem+1vw,2rem)] font-medium tracking-tight transition-transform duration-500 hover:translate-x-3 motion-reduce:hover:translate-x-0"
                >
                  <span
                    aria-hidden
                    className="absolute top-1/2 -left-4 size-2 -translate-y-1/2 scale-50 rounded-full bg-white opacity-0 transition-[scale,opacity] duration-300 group-hover/soft:scale-100 group-hover/soft:opacity-100"
                  />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          {/* Level on the European scale; hovering the card redraws the bar */}
          <div data-reveal="1" data-tilt className="group bg-surface p-6 md:p-8 lg:col-span-4">
            <h3 className="text-lead font-medium">{ui.languages}</h3>
            <ul data-levels className="mt-6 space-y-6">
              {skills.languages.map((l, i) => {
                const reached = CEFR.indexOf(l.level);
                return (
                  <li key={i}>
                    <p className="text-lead flex items-baseline justify-between">
                      {l.name} <span className="text-accent font-medium">{l.level}</span>
                    </p>
                    <div aria-hidden className="mt-4 grid grid-cols-6 gap-1">
                      {CEFR.map((lv, k) => (
                        <span key={lv} className="bg-surface-2 h-2.5 overflow-hidden">
                          {k <= reached && (
                            <span
                              style={{ animationDelay: `${k * 70}ms` }}
                              className="bg-accent block size-full origin-left group-hover:animate-[sweep_0.6s_var(--ease-out-expo)_both] motion-reduce:group-hover:animate-none"
                            />
                          )}
                        </span>
                      ))}
                    </div>
                    <div
                      aria-hidden
                      className="text-small text-muted tabular mt-2 grid grid-cols-6 gap-1"
                    >
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
          <span className="ease-out-expo transition-transform duration-500 group-hover:translate-x-[1vw] motion-reduce:group-hover:translate-x-0">
            {ui.toProjects}
          </span>
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="text-accent ease-out-expo size-7 shrink-0 transition-transform duration-500 group-hover:translate-y-1"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </a>
      </div>
    </section>
  );
}
