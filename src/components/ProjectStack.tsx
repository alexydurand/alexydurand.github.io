import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { projects, type Project } from '../data/content';
import clsx from '../lib/clsx';
import ProjectDetail from './ProjectDetail';
import ProjectFragment from './ProjectFragment';

const COUNT = projects.length;
const wrap = (i: number) => ((i % COUNT) + COUNT) % COUNT;
// Signed distance to the active card, the short way round: the fan has no ends
const offset = (i: number, active: number) => {
  const half = Math.floor(COUNT / 2);
  return wrap(i - active + half) - half;
};

const ARROW =
  'grid size-11 cursor-pointer place-items-center rounded-full transition-colors hover:bg-ink/10';

/** The projects as a fan of cards: drag, arrows or a side card to browse, the middle card opens its details. */
export default function ProjectStack() {
  const [active, setActive] = useState(0);
  const [expanded, setExpanded] = useState<HTMLElement | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; step: number; moved: boolean } | null>(null);
  // Set by a drag, so that the click ending it opens nothing
  const dragged = useRef(false);

  const go = (i: number) => setActive(wrap(i));

  // The skills review opens a project out of its own link, without coming back up here
  useEffect(() => {
    const onShow = (e: Event) => {
      const { id, from } = (e as CustomEvent<{ id: Project['id']; from: HTMLElement }>).detail;
      setActive(projects.findIndex((p) => p.id === id));
      setExpanded(from);
    };
    window.addEventListener('show-project', onShow);
    return () => window.removeEventListener('show-project', onShow);
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    dragged.current = false;
    if (e.button !== 0) return;
    const card = e.currentTarget.firstElementChild as HTMLElement;
    drag.current = { x: e.clientX, step: card.offsetWidth * 0.5, moved: false };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved) {
      if (Math.abs(dx) < 8) return;
      d.moved = dragged.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      e.currentTarget.dataset.dragging = '';
    }
    e.currentTarget.style.setProperty('--drag', String(dx / d.step));
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>, apply: boolean) => {
    const d = drag.current;
    drag.current = null;
    if (!d?.moved) return;
    delete e.currentTarget.dataset.dragging;
    e.currentTarget.style.removeProperty('--drag');
    if (!apply) return;
    const dx = e.clientX - d.x;
    // A short flick counts as one card
    const steps = Math.round(dx / d.step) || (Math.abs(dx) > 40 ? Math.sign(dx) : 0);
    go(active - Math.max(-2, Math.min(2, steps)));
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') go(active - 1);
    if (e.key === 'ArrowRight') go(active + 1);
  };

  return (
    <>
      <div
        role="group"
        aria-roledescription="carrousel"
        aria-label="Mes projets"
        onKeyDown={onKeyDown}
      >
        <div
          ref={stage}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => endDrag(e, true)}
          onPointerCancel={(e) => endDrag(e, false)}
          className="stack relative h-[calc(var(--card-h)+7rem)] overflow-hidden select-none"
        >
          {projects.map((p, i) => {
            const off = offset(i, active);
            return (
              <article
                key={p.id}
                aria-hidden={off !== 0 || undefined}
                style={{ '--off': off, zIndex: 10 - Math.abs(off) } as CSSProperties}
                className={clsx(
                  'stack-card border-bg bg-ink absolute inset-0 m-auto flex h-(--card-h) w-(--card-w) flex-col overflow-hidden rounded-2xl border-2 text-white',
                  // Not invisible: the button keeps the focus, which the dialog gives back when it closes
                  off === 0 && expanded && 'opacity-0',
                )}
              >
                <div aria-hidden className="min-h-0 flex-1">
                  <ProjectFragment id={p.id} />
                </div>
                <div className="flex items-end justify-between gap-4 p-4 md:p-5">
                  <div className="min-w-0">
                    <h3 className="text-lead font-medium tracking-tight text-balance">{p.title}</h3>
                    <p className="text-small text-sand mt-1">{p.stack.join('\u00a0· ')}</p>
                  </div>
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="size-6 shrink-0 fill-none stroke-current stroke-2"
                  >
                    <path d="M12 4v16M4 12h16" />
                  </svg>
                </div>
                <button
                  type="button"
                  tabIndex={off === 0 ? 0 : -1}
                  aria-haspopup={off === 0 ? 'dialog' : undefined}
                  aria-label={`Voir le détail : ${p.title}`}
                  onClick={(e) => {
                    if (dragged.current) return;
                    if (off === 0) setExpanded(e.currentTarget.parentElement);
                    else go(i);
                  }}
                  className="focus-visible:ring-sand absolute inset-0 cursor-pointer rounded-2xl outline-none focus-visible:ring-4 focus-visible:ring-inset"
                />
              </article>
            );
          })}
        </div>

        <div className="mt-2 flex justify-center">
          <button
            type="button"
            aria-label="Projet précédent"
            onClick={() => go(active - 1)}
            className={ARROW}
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-5 fill-none stroke-current stroke-2"
            >
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          {projects.map((p, i) => (
            <button
              key={p.id}
              type="button"
              aria-label={`Projet ${i + 1} : ${p.title}`}
              aria-current={i === active || undefined}
              onClick={() => go(i)}
              className="group grid size-11 cursor-pointer place-items-center"
            >
              <span
                className={clsx(
                  'size-2.5 rounded-full transition-colors',
                  i === active ? 'bg-ink' : 'bg-ink/25 group-hover:bg-ink/60',
                )}
              />
            </button>
          ))}
          <button
            type="button"
            aria-label="Projet suivant"
            onClick={() => go(active + 1)}
            className={ARROW}
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className="size-5 fill-none stroke-current stroke-2"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <p aria-live="polite" className="sr-only">
          Projet {active + 1} sur {COUNT} : {projects[active].title}
        </p>
      </div>

      <ProjectDetail
        project={projects[active]}
        from={expanded}
        onClosed={() => setExpanded(null)}
      />
    </>
  );
}
