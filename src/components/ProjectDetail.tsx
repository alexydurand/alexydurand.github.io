import { useEffect, useRef, type SyntheticEvent } from 'react';
import type { Project } from '../data/content';
import { prefersReducedMotion } from '../lib/motion';
import { lockScroll } from '../lib/scroll';
import ProjectFragment from './ProjectFragment';

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
// Smallest text size in px: beside the picture, then once it has made room
const WITH_PICTURE = 14;
const WITHOUT_PICTURE = 13;

/** Everything fits on screen, no scrolling: the text shrinks a step at a time, and on small phones the picture goes. */
function fit(box: HTMLElement, text: HTMLElement, picture: HTMLElement) {
  const shrink = (smallest: number) => {
    let size = parseFloat(getComputedStyle(document.body).fontSize);
    for (; size >= smallest; size -= 0.5) {
      text.style.fontSize = `${size}px`;
      if (box.scrollHeight <= box.clientHeight) return true;
    }
    return false;
  };
  picture.hidden = false;
  if (shrink(WITH_PICTURE)) return;
  picture.hidden = true;
  shrink(WITHOUT_PICTURE);
}

/** The panel grows out of its card, or shrinks back into it. Resolves when done. */
function morph(
  dialog: HTMLDialogElement,
  panel: HTMLElement,
  text: HTMLElement,
  card: HTMLElement,
  closing: boolean,
) {
  if (prefersReducedMotion()) return Promise.resolve();
  const a = card.getBoundingClientRect();
  const b = panel.getBoundingClientRect();
  const small = `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(${a.width / b.width}, ${a.height / b.height})`;
  const fade = closing ? [1, 0] : [0, 1];
  dialog.animate({ opacity: fade }, { pseudoElement: '::backdrop', duration: 300, fill: 'both' });
  text.animate(
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
  const box = useRef<HTMLDivElement>(null);
  const text = useRef<HTMLDivElement>(null);
  const picture = useRef<HTMLDivElement>(null);
  const closing = useRef(false);

  useEffect(() => {
    if (!from || !dialog.current || !panel.current || !box.current || !text.current || !picture.current) return;
    const [b, t, pic] = [box.current, text.current, picture.current];
    dialog.current.showModal();
    lockScroll(true);
    const refit = () => fit(b, t, pic);
    refit();
    morph(dialog.current, panel.current, t, from, false);
    window.addEventListener('resize', refit);
    return () => window.removeEventListener('resize', refit);
  }, [from]);

  const close = async () => {
    if (!from || !dialog.current || !panel.current || !text.current || closing.current) return;
    closing.current = true;
    await morph(dialog.current, panel.current, text.current, from, true);
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
      className="backdrop:bg-ink/70 fixed inset-0 m-0 size-full max-h-none max-w-none place-items-center bg-transparent p-2 open:grid md:p-6"
    >
      <div
        ref={panel}
        className="bg-ink relative flex max-h-full w-full max-w-6xl origin-top-left overflow-hidden rounded-2xl text-white"
      >
        {/* The scrollbar is only a safety net: fit() makes the text fit first */}
        <div
          ref={box}
          data-lenis-prevent
          className="flex w-full flex-col overflow-y-auto overscroll-contain lg:flex-row"
        >
          <div
            ref={picture}
            aria-hidden
            className="relative min-h-28 flex-[1_1_13rem] lg:min-h-[min(30rem,75svh)] lg:flex-[1_1_50%]"
          >
            <div className="absolute inset-0">
              <ProjectFragment id={p.id} />
            </div>
          </div>
          {/* Sizes in em: fit() only has to change the font size of this block */}
          <div ref={text} className="shrink-0 p-[1.5em] lg:flex-[1_1_50%] lg:shrink">
            <p className="flex flex-wrap items-center gap-x-[0.7em] gap-y-1 pr-10 text-[max(0.8em,13px)] text-white/70">
              {p.context}
              {p.status && (
                <span className="bg-sand text-ink rounded-full px-[0.8em] py-[0.15em] font-medium">
                  {p.status}
                </span>
              )}
            </p>
            <h3
              id="project-detail-title"
              className="mt-[0.3em] pr-6 text-[2.1em] leading-[1.1] font-medium tracking-tight text-balance"
            >
              {p.title}
            </h3>
            <p className="mt-[0.8em] leading-[1.45] text-pretty">{p.summary}</p>
            <ul className="mt-[0.9em] space-y-[0.4em] leading-[1.45] text-white/85">
              {p.did.map((d) => (
                <li key={d} className="flex gap-[0.7em]">
                  <span aria-hidden className="bg-sand mt-[0.6em] size-[0.35em] shrink-0" />
                  {d}
                </li>
              ))}
            </ul>
            <p className="text-sand mt-[0.9em] font-medium">{p.stack.join(' · ')}</p>
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
