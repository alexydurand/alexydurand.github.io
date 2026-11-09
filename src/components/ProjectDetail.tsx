import { useEffect, useRef, useState, type MouseEvent, type SyntheticEvent } from 'react';
import { flushSync } from 'react-dom';
import { butLinks, type Project } from '../data/content';
import { prefersReducedMotion } from '../lib/motion';
import { lockScroll } from '../lib/scroll';
import ProjectFragment from './ProjectFragment';

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
// Smallest text size in px: beside the picture, then once it has made room
const WITH_PICTURE = 14;
const WITHOUT_PICTURE = 13;

/** The text shrinks a step at a time until the box needs no scrolling. */
function shrink(box: HTMLElement, text: HTMLElement, smallest: number) {
  let size = parseFloat(getComputedStyle(document.body).fontSize);
  for (; size >= smallest; size -= 0.5) {
    text.style.fontSize = `${size}px`;
    if (box.scrollHeight <= box.clientHeight) return true;
  }
  return false;
}

/** Everything fits on screen, no scrolling: the text shrinks, and on small phones the picture goes. */
function fit(box: HTMLElement, text: HTMLElement, picture: HTMLElement) {
  picture.hidden = false;
  if (shrink(box, text, WITH_PICTURE)) return;
  picture.hidden = true;
  shrink(box, text, WITHOUT_PICTURE);
}

/** The skills card slides up over the project, or back down. Resolves when done. */
function slide(card: HTMLElement, closing: boolean) {
  if (prefersReducedMotion()) return Promise.resolve();
  const below = 'translateY(105%)';
  return card
    .animate(
      { transform: closing ? ['none', below] : [below, 'none'] },
      { duration: closing ? 300 : 500, easing: EASE, fill: 'both' },
    )
    .finished.then(() => undefined);
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
  const [skillsOpen, setSkillsOpen] = useState(false);
  const skills = useRef<HTMLDivElement>(null);
  const skillsText = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const back = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const [card, t] = [skills.current, skillsText.current];
    if (!skillsOpen || !card || !t) return;
    const refit = () => shrink(card, t, WITHOUT_PICTURE);
    refit();
    // Without scrolling: Safari scrolls late, once the card has been pushed below, and left it cut off at the top
    back.current?.focus({ preventScroll: true });
    slide(card, false);
    window.addEventListener('resize', refit);
    return () => window.removeEventListener('resize', refit);
  }, [skillsOpen]);

  // Back to the link only from the keyboard: on a touch screen its focus ring would show for nothing
  const closeSkills = async (fromKeyboard: boolean) => {
    if (skills.current) await slide(skills.current, true);
    // Now, not on the next render: the project is inert until then and could not take the focus back
    flushSync(() => setSkillsOpen(false));
    (fromKeyboard ? opener : dialog).current?.focus();
  };

  useEffect(() => {
    if (
      !from ||
      !dialog.current ||
      !panel.current ||
      !box.current ||
      !text.current ||
      !picture.current
    )
      return;
    const [b, t, pic] = [box.current, text.current, picture.current];
    dialog.current.showModal();
    // The dialog itself, rather than its first link, which would show its focus ring after a tap
    dialog.current.focus();
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

  // From a project to its place in the skills review
  const toSkill = async (e: MouseEvent<HTMLAnchorElement>, skill: string) => {
    e.preventDefault();
    await close();
    // Now, not when the dialog says it closed: while locked, the page ignores the jump
    lockScroll(false);
    window.dispatchEvent(new CustomEvent('show-skill', { detail: skill }));
  };

  const onClose = (e: SyntheticEvent<HTMLDialogElement>) => {
    closing.current = false;
    e.currentTarget.getAnimations({ subtree: true }).forEach((a) => a.cancel());
    setSkillsOpen(false);
    lockScroll(false);
    onClosed();
  };

  return (
    <dialog
      ref={dialog}
      tabIndex={-1}
      aria-labelledby="project-detail-title"
      onCancel={(e) => {
        e.preventDefault();
        if (skillsOpen) closeSkills(true);
        else close();
      }}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      className="backdrop:bg-ink/70 fixed inset-0 m-0 outline-none size-full max-h-none max-w-none place-items-center bg-transparent p-2 open:grid md:p-6"
    >
      <div
        ref={panel}
        className="bg-ink relative flex max-h-full w-full max-w-6xl min-h-0 origin-top-left overflow-clip rounded-2xl text-white"
      >
        {/* The scrollbar is only a safety net: fit() makes the text fit first */}
        <div
          ref={box}
          inert={skillsOpen}
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
            <button
              ref={opener}
              type="button"
              onClick={() => setSkillsOpen(true)}
              className="mt-[0.3em] min-h-11 cursor-pointer text-left text-[max(0.85em,13px)] underline decoration-1 underline-offset-4 hover:decoration-2"
            >
              {butLinks.open}
            </button>
          </div>
        </div>
        <button
          type="button"
          inert={skillsOpen}
          aria-label="Fermer le détail du projet"
          onClick={close}
          className="bg-ink hover:bg-accent-deep focus-visible:ring-sand absolute top-2 right-2 grid size-11 cursor-pointer place-items-center rounded-full transition-colors outline-none focus-visible:ring-2"
        >
          <svg aria-hidden viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-2">
            <path d="M5 5l14 14M19 5L5 19" />
          </svg>
        </button>
        {skillsOpen && (
          <div
            ref={skills}
            data-lenis-prevent
            className="bg-ink absolute inset-0 overflow-y-auto overscroll-contain rounded-2xl text-white"
          >
            {/* Sizes in em, as for the project: shrink() only has to change the font size of this block */}
            <div ref={skillsText} className="p-[1.5em] lg:p-[2.5em]">
              <button
                ref={back}
                type="button"
                // A click from the keyboard has no pointer, so detail is 0
                onClick={(e) => closeSkills(e.detail === 0)}
                className="-ml-[0.25em] flex min-h-11 cursor-pointer items-center gap-[0.4em] px-[0.25em] underline decoration-1 underline-offset-4 hover:decoration-2"
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="size-[1em] shrink-0 fill-none stroke-current stroke-2"
                >
                  <path d="M15 5l-7 7 7 7" />
                </svg>
                {butLinks.back}
              </button>
              <h4 className="mt-[0.5em] text-[2.1em] leading-[1.1] font-medium tracking-tight text-balance">
                {butLinks.title}
              </h4>
              <p className="mt-[0.3em] text-white/70">{p.title}</p>
              <p className="mt-[0.9em] max-w-[62ch] leading-[1.45] text-pretty">{butLinks.intro}</p>
              <dl className="mt-[1.4em] grid gap-[1.1em] lg:grid-cols-2 lg:gap-x-[2.5em]">
                {p.competences.map((c) => (
                  <div key={c.skill}>
                    <dt className="text-[1.25em] font-medium tracking-tight">
                      <a
                        href={`#bilan-${c.skill}`}
                        onClick={(e) => toSkill(e, c.skill)}
                        className="text-sand underline decoration-1 underline-offset-4 hover:decoration-2"
                      >
                        {c.skill}
                      </a>
                    </dt>
                    <dd className="mt-[0.2em] leading-[1.45] text-pretty">{c.how}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}
