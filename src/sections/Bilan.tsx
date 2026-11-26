import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import { bilan, type BilanProof } from '../data/content';
import Ghost from '../components/Ghost';
import Keycap from '../components/Keycap';
import useMediaQuery from '../hooks/useMediaQuery';
import useNear from '../hooks/useNear';
import useReveal from '../hooks/useReveal';
import clsx from '../lib/clsx';
import { scrollToHash } from '../lib/scroll';

const SKILLS = bilan.skills;
// The colour a key takes once pressed (dark otherwise), from Mes outils' keyboard, and whether it needs dark letters
const COLORS: [string, boolean][] = [
  ['typescript', false],
  ['powerbi', true],
  ['sharepoint', false],
  ['java', true],
  ['powerapps', false],
  ['sqldeveloper', false],
];
const MOVE: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };

// A project opens right here, out of its link (ProjectStack listens); the stage is a section further down
function showProof(e: MouseEvent<HTMLAnchorElement>, proof: BilanProof) {
  e.preventDefault();
  if (proof.href) scrollToHash(proof.href);
  else {
    const detail = { id: proof.project, from: e.currentTarget };
    window.dispatchEvent(new CustomEvent('show-project', { detail }));
  }
}

/**
 * The review of my skills, as in Mes outils: one long key (a space bar) per skill on a board turned in 3D, and
 * on the right the story of the skill under the pointer, whose key stays down. Every story sits in the same
 * grid cell, so the section is as tall as the longest one and nothing moves when another shows.
 */
export default function Bilan() {
  const root = useRef<HTMLElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const keys = useRef<(HTMLButtonElement | null)[]>([]);
  const peek = useRef<HTMLDivElement>(null);
  // As in Intro: at 1 the ghost hides and stops drawing, which it must do off screen
  const away = useRef(1);
  const [active, setActive] = useState(0);
  const near = useNear(board);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  useReveal(root);

  useEffect(() => {
    const ghost = peek.current;
    if (!ghost) return;
    const seen = new IntersectionObserver(([entry]) => {
      away.current = entry.isIntersecting ? 0 : 1;
    });
    seen.observe(ghost);
    return () => seen.disconnect();
  }, [reducedMotion]);

  // A project's card leads here: its skill shows on arrival (ProjectDetail)
  useEffect(() => {
    const onShow = (e: Event) => {
      const { detail: name } = e as CustomEvent<string>;
      setActive(
        Math.max(
          0,
          SKILLS.findIndex((s) => s.name === name),
        ),
      );
      scrollToHash('#bilan-keys');
    };
    window.addEventListener('show-skill', onShow);
    return () => window.removeEventListener('show-skill', onShow);
  }, []);

  // Tabs: the arrows move from key to key, Tab goes on to the story
  const onKeyDown = (e: KeyboardEvent) => {
    if (!(e.key in MOVE)) return;
    e.preventDefault();
    const next = (active + MOVE[e.key] + SKILLS.length) % SKILLS.length;
    setActive(next);
    keys.current[next]?.focus();
  };

  return (
    <section
      id="bilan"
      ref={root}
      tabIndex={-1}
      aria-labelledby="bilan-title"
      className="bg-bg text-ink pb-16 outline-none"
    >
      <div className="frame relative pt-8 md:pt-12">
        <h2 id="bilan-title" className="display title-xl max-sm:text-[15vw]">
          <span data-reveal="0" className="block">
            {bilan.heading[0]}
          </span>
          <span data-reveal="1" className="block md:pl-[3vw]">
            {bilan.heading[1]}
          </span>
        </h2>
        {/* Beside the title: on a phone level with « Mes », where the long word below leaves room */}
        {!reducedMotion && (
          <div
            ref={peek}
            aria-hidden
            className="pointer-events-none absolute top-8 right-[9%] aspect-[231/289] h-[min(3.5rem,13vw)] sm:top-auto sm:bottom-0 sm:h-[clamp(5rem,12vw,10rem)]"
          >
            <Ghost progress={away} />
          </div>
        )}
      </div>

      <div
        id="bilan-keys"
        tabIndex={-1}
        data-reveal="2"
        className="frame mt-20 grid items-center gap-8 outline-none md:mt-40 lg:grid-cols-12 lg:gap-6"
      >
        <div className="flex justify-center py-4 perspective-[1600px] lg:col-span-5 lg:py-10">
          <div
            ref={board}
            role="tablist"
            aria-orientation="vertical"
            aria-labelledby="bilan-title"
            onKeyDown={onKeyDown}
            style={
              {
                '--k': 'clamp(2.75rem, 1.6rem + 2.6vw, 4.25rem)',
                // Less light on these long keys than on the tools' ones
                '--shine': 0.12,
                // Barely turned: the pointer leaving a key sideways for its story must not cross another key
                transform: 'rotateX(36deg) rotateZ(-8deg)',
              } as CSSProperties
            }
            className="bg-surface grid gap-[calc(var(--k)*0.16)] rounded-[calc(var(--k)*0.32)] p-[calc(var(--k)*0.2)] text-[calc(var(--k)*0.36)] shadow-[0_2rem_4rem_rgb(0_0_0/0.6)] transform-3d"
          >
            {SKILLS.map((s, i) => (
              <button
                key={s.name}
                ref={(el) => {
                  keys.current[i] = el;
                }}
                type="button"
                role="tab"
                id={`bilan-tab-${i}`}
                aria-selected={i === active}
                aria-controls={`bilan-panel-${i}`}
                tabIndex={i === active ? 0 : -1}
                // On a move, not on enter: a key scrolled under a still pointer (show-skill) must not take over
                onPointerMove={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                style={
                  {
                    '--key':
                      i === active ? `var(--color-key-${COLORS[i][0]})` : 'var(--color-surface-2)',
                  } as CSSProperties
                }
                className="group pointer-events-none relative h-(--k) w-[calc(var(--k)*4.6)] cursor-pointer transform-3d"
              >
                <Keycap
                  label={s.name}
                  light={i === active && COLORS[i][1]}
                  walls={near}
                  pressed={i === active}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:col-span-7">
          {SKILLS.map((s, i) => (
            <div
              key={s.name}
              id={`bilan-panel-${i}`}
              role="tabpanel"
              aria-labelledby={`bilan-tab-${i}`}
              className={clsx(
                'transition-[opacity,visibility] duration-300 [grid-area:1/1]',
                i === active ? 'visible opacity-100' : 'invisible opacity-0',
              )}
            >
              <h3 className="display text-[clamp(2.75rem,1.5rem+4vw,5.5rem)]">{s.name}</h3>
              <p className="text-lead text-muted mt-4 max-w-[36ch] text-balance">{s.promise}</p>
              <ol className="mt-8 grid gap-6 md:mt-10">
                {s.steps.map((step) => (
                  <li key={step.when} className="grid gap-1 md:grid-cols-[9rem_1fr] md:gap-6">
                    <p className="font-medium">{step.when}</p>
                    <div>
                      <p className="max-w-[52ch] text-pretty">{step.text}</p>
                      {step.proofs && (
                        <p className="flex flex-wrap gap-x-5">
                          {step.proofs.map((proof) => (
                            <a
                              key={proof.label}
                              href={proof.href ?? '#projets'}
                              onClick={(e) => showProof(e, proof)}
                              className="inline-flex min-h-11 items-center underline decoration-1 underline-offset-4 hover:decoration-2"
                            >
                              {proof.label}
                            </a>
                          ))}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
