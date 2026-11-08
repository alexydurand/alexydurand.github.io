import { useEffect, useRef, type SyntheticEvent } from 'react';
import type { Project } from '../data/content';
import { prefersReducedMotion } from '../lib/motion';
import { lockScroll } from '../lib/scroll';
import ProjectFragment from './ProjectFragment';

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';

/** The panel grows out of its card, or shrinks back into it. Resolves when done. */
function morph(dialog: HTMLDialogElement, panel: HTMLElement, card: HTMLElement, closing: boolean) {
  if (prefersReducedMotion()) return Promise.resolve();
  const a = card.getBoundingClientRect();
  const b = panel.getBoundingClientRect();
  const small = `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`;
  const fade = closing ? [1, 0] : [0, 1];
  dialog.animate({ opacity: fade }, { pseudoElement: '::backdrop', duration: 300, fill: 'both' });
  panel.lastElementChild?.animate(
    { opacity: fade },
    { duration: closing ? 120 : 260, delay: closing ? 0 : 90, easing: 'ease-out', fill: 'both' },
  );
  return panel
    .animate(
      { transform: closing ? ['none', small] : [small, 'none'] },
      { duration: closing ? 300 : 500, easing: EASE, fill: 'both' },
    )
    .finished.then(() => undefined);
}

/** The details of a project, in a modal dialog that opens out of its card (`from`). */
export default function ProjectDetail({
  project: p,
  from,
  onClosed,
}: {
  project: Project;
  from: HTMLElement | null;
  onClosed: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const closing = useRef(false);

  useEffect(() => {
    if (!from || !dialog.current || !panel.current) return;
    dialog.current.showModal();
    lockScroll(true);
    morph(dialog.current, panel.current, from, false);
  }, [from]);

  const close = async () => {
    if (!from || !dialog.current || !panel.current || closing.current) return;
    closing.current = true;
    await morph(dialog.current, panel.current, from, true);
    dialog.current.close();
  };

  const onClose = (e: SyntheticEvent<HTMLDialogElement>) => {
    closing.current = false;
    e.currentTarget.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    lockScroll(false);
    onClosed();
  };

  return (
    <dialog
      ref={dialog}
      aria-labelledby="project-detail-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      className="backdrop:bg-ink/70 fixed inset-0 m-0 size-full max-h-none max-w-none place-items-center bg-transparent p-3 open:grid md:p-6"
    >
      <div
        ref={panel}
        className="bg-ink relative flex max-h-full w-full max-w-6xl origin-top-left overflow-hidden rounded-2xl text-white"
      >
        <div
          data-lenis-prevent
          className="grid w-full overflow-y-auto overscroll-contain lg:grid-cols-2"
        >
          <div aria-hidden className="h-56 sm:h-72 lg:h-auto lg:min-h-[32rem]">
            <ProjectFragment id={p.id} />
          </div>
          <div className="p-5 md:p-8">
            <p className="text-small flex flex-wrap items-center gap-x-3 gap-y-1 pr-10 text-white/70">
              {p.context}
              {p.status && (
                <span className="bg-sand text-ink rounded-full px-2.5 py-0.5 font-medium">{p.status}</span>
              )}
            </p>
            <h3
              id="project-detail-title"
              className="mt-2 text-[clamp(1.75rem,1.3rem+1.6vw,2.75rem)] leading-tight font-medium tracking-tight text-balance"
            >
              {p.title}
            </h3>
            <p className="mt-4 text-pretty">{p.summary}</p>
            <ul className="mt-5 space-y-2 text-white/85">
              {p.did.map((d) => (
                <li key={d} className="flex gap-3">
                  <span aria-hidden className="bg-sand mt-[0.6em] size-1.5 shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
            <p className="text-sand mt-5 font-medium">{p.stack.join('\u00a0· ')}</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Fermer le détail du projet"
          onClick={close}
          className="bg-ink hover:bg-accent-deep focus-visible:ring-sand absolute top-2 right-2 grid size-11 cursor-pointer place-items-center rounded-full transition-colors outline-none focus-visible:ring-2"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-2">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
      </div>
    </dialog>
  );
}
