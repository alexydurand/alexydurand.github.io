import { useEffect, useRef } from 'react';
import { gsap } from '../lib/gsap';
import { parcours } from '../data/content';
import { prefersReducedMotion } from '../lib/motion';
import useReveal from '../hooks/useReveal';
import clsx from '../lib/clsx';

const { start, end, milestones } = parcours;
const DOT_RING = 'border-[3px] border-surface'; // taste-skill-ignore: gap ring around a timeline dot, not a box
const span = end - start;
const YEARS = Array.from({ length: span + 1 }, (_, i) => start + i);
const now = new Date();
// Where "today" sits on the axis, as a share of the current step (0..1)
const current = milestones.find((m) => m.current);
const todayShare = current
  ? Math.min(
      1,
      Math.max(
        0,
        (now.getFullYear() + now.getMonth() / 12 - current.from) / (current.to - current.from),
      ),
    )
  : 0;

export default function Parcours() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  // The axis draws itself, then each step fills in turn
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 60%', once: true } });
      tl.from('[data-axis]', { scaleX: 0, scaleY: 0, duration: 1.2, ease: 'expo.inOut' });
      tl.from(
        '[data-step]',
        { scaleX: 0, scaleY: 0, duration: 0.8, ease: 'expo.out', stagger: 0.25 },
        '-=0.5',
      );
      tl.from(
        '[data-today]',
        { scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(3)' },
        '-=0.2',
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="parcours"
      ref={root}
      tabIndex={-1}
      aria-labelledby="parcours-title"
      className="bg-surface py-section outline-none"
    >
      <div className="frame">
        <h2 id="parcours-title" data-reveal="0" className="display title-xl">
          {parcours.heading}
        </h2>

        {/* Desktop: horizontal timeline, one column per year */}
        <div className="relative mt-20 hidden md:block">
          <ol
            className="relative grid items-end"
            style={{ gridTemplateColumns: `repeat(${span}, minmax(0, 1fr))` }}
          >
            <span
              data-axis
              aria-hidden
              className="bg-ink/15 absolute inset-x-0 bottom-0 h-1 origin-left"
            />
            {milestones.map((m, i) => (
              <li
                key={m.title}
                data-reveal={i}
                className="group relative flex flex-col justify-end pr-6"
                style={{ gridColumn: `${m.from - start + 1} / ${m.to - start + 1}`, gridRow: 1 }}
              >
                <div className="ease-out-expo pb-8 transition-transform duration-500 group-hover:-translate-y-2 motion-reduce:group-hover:translate-y-0">
                  <p className="text-lead tabular text-accent font-medium">{m.years}</p>
                  <h3 className="text-head mt-2 leading-none font-medium tracking-tight text-balance">
                    {m.title}
                  </h3>
                  <p className="text-body text-muted mt-2">{m.place}</p>
                  <p className="text-body mt-3 max-w-[34ch] text-pretty">{m.text}</p>
                </div>
                {/* The bar thickens on hover inside space kept for it, so the page never moves */}
                <span aria-hidden className="relative block h-2">
                  <span className="absolute inset-x-0 bottom-0 h-1 transition-[height] duration-300 group-hover:h-2">
                    {m.current ? (
                      <>
                        <span className="bg-accent/25 absolute inset-0" />
                        <span
                          data-step
                          className="bg-accent absolute inset-y-0 left-0 origin-left"
                          style={{ width: `${todayShare * 100}%` }}
                        />
                        <span
                          data-today
                          className="absolute top-1/2 grid size-4 -translate-x-1/2 -translate-y-1/2 place-items-center"
                          style={{ left: `${todayShare * 100}%` }}
                        >
                          <span className="today-pulse bg-accent absolute inset-0 rounded-full" />
                          <span className={`bg-accent relative size-4 rounded-full ${DOT_RING}`} />
                        </span>
                      </>
                    ) : (
                      <span data-step className="bg-ink absolute inset-0 origin-left" />
                    )}
                  </span>
                </span>
              </li>
            ))}
          </ol>
          <div aria-hidden className="text-small text-muted tabular relative mt-4 h-6">
            {YEARS.map((y, i) => (
              <span
                key={y}
                className={clsx(
                  'absolute',
                  i === 0 ? '' : i === span ? '-translate-x-full' : '-translate-x-1/2',
                )}
                style={{ left: `${(i / span) * 100}%` }}
              >
                {y}
              </span>
            ))}
          </div>
          {current && (
            <p className="text-small text-accent mt-2 font-medium">
              Aujourd’hui : {current.title}, 3e année
            </p>
          )}
        </div>

        {/* Phone: vertical timeline */}
        <ol className="relative mt-14 space-y-12 pl-8 md:hidden">
          <span
            data-axis
            aria-hidden
            className="bg-ink/15 absolute top-2 bottom-2 left-[5px] w-1 origin-top"
          />
          {milestones.map((m, i) => (
            <li key={m.title} data-reveal={i} className="relative">
              <span
                aria-hidden
                className={clsx(
                  `absolute top-2 -left-8 size-3.5 rounded-full ${DOT_RING}`,
                  m.current ? 'today-dot bg-accent' : 'bg-ink',
                )}
              />
              <p className="text-lead tabular text-accent font-medium">
                {m.years}
                {m.current && <span className="text-small text-muted ml-2">en cours</span>}
              </p>
              <h3 className="text-head mt-1 leading-none font-medium tracking-tight">{m.title}</h3>
              <p className="text-body text-muted mt-1">{m.place}</p>
              <p className="text-body mt-2 text-pretty">{m.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
