import { useRef, type PointerEvent } from 'react';
import { projects, person } from '../data/content';
import useReveal from '../hooks/useReveal';
import ProjectFragment from '../components/ProjectFragment';
import clsx from '../lib/clsx';

function tilt(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== 'mouse') return;
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 8}deg`);
  el.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 8}deg`);
}

function untilt(e: PointerEvent<HTMLElement>) {
  e.currentTarget.style.setProperty('--ry', '0deg');
  e.currentTarget.style.setProperty('--rx', '0deg');
}

export default function Projects() {
  const root = useRef<HTMLElement>(null);
  useReveal(root);

  return (
    <section id="projets" ref={root} tabIndex={-1} aria-labelledby="projets-title" className="bg-bg pb-section outline-none">
      <div className="frame">
        <div className="flex flex-col items-start gap-2 md:flex-row md:items-end md:justify-between md:gap-6">
          <h2 id="projets-title" data-reveal="0" className="display title-xl">
            Projets
          </h2>
          <a
            data-reveal="1"
            href={person.github}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 py-2 text-body underline decoration-1 underline-offset-4 hover:decoration-2 md:mb-[0.8em]"
          >
            Mon GitHub
          </a>
        </div>

        <ol className="mt-16 space-y-24 md:mt-24 md:space-y-36">
          {projects.map((p, i) => {
            const flip = i % 2 === 1;
            return (
              <li key={p.id} className="grid items-center gap-8 md:grid-cols-12 md:gap-6">
                <div className={clsx('md:col-span-5', flip && 'md:order-2 md:col-start-8')}>
                  <p data-reveal="0" className="text-small text-muted">
                    {p.context}
                  </p>
                  <h3 data-reveal="0" className="mt-2 text-head font-medium tracking-tight text-balance">
                    {p.title}
                  </h3>
                  <p data-reveal="1" className="mt-5 text-lead text-pretty">
                    {p.summary}
                  </p>
                  <ul data-reveal="2" className="mt-6 space-y-2 text-body">
                    {p.did.map((d) => (
                      <li key={d} className="flex gap-3">
                        <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 bg-accent" />
                        {d}
                      </li>
                    ))}
                  </ul>
                  <p data-reveal="3" className="mt-6 text-body font-medium text-accent">
                    {p.stack.join(' · ')}
                  </p>
                </div>
                <div data-reveal="1" className={clsx('md:col-span-7', flip ? 'md:order-1 md:col-start-1' : 'md:col-start-6')}>
                  <div onPointerMove={tilt} onPointerLeave={untilt} className="tilt h-72 sm:h-96 md:h-[440px]">
                    <ProjectFragment id={p.id} />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
