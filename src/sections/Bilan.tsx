import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { bilan, type BilanProof } from '../data/content';
import Ghost from '../components/Ghost';
import useMediaQuery from '../hooks/useMediaQuery';
import useReveal from '../hooks/useReveal';
import clsx from '../lib/clsx';
import { gsap } from '../lib/gsap';
import { ridgePath, type Point } from '../lib/ridge';
import { scrollToHash, scrollToStacked } from '../lib/scroll';

const W = 1440;
const H = 100;

// Far to near, from the sand of the home page sky down to its black ground. All low on the left and at
// the far right, where the name and arrow of the hill behind must stay visible once the hills are stacked.
// The first one is the crest of the home page hills, measured: only the sky stands behind it.
const LAYERS: { colors: string; arrow: string; theme: 'light' | 'dark'; ridge: Point[] }[] = [
  {
    colors: 'fill-dusk-1 text-ink',
    arrow: 'bg-ink text-white',
    theme: 'light',
    ridge: [
      [0, 69],
      [144, 86],
      [288, 82],
      [432, 83],
      [576, 91],
      [720, 88],
      [864, 66],
      [1008, 77],
      [1080, 74],
      [1152, 58],
      [1224, 37],
      [1296, 18],
      [1368, 8],
      [1440, 8],
    ],
  },
  {
    colors: 'fill-dusk-2 text-ink',
    arrow: 'bg-ink text-white',
    theme: 'light',
    ridge: [
      [0, 86],
      [240, 92],
      [480, 84],
      [760, 88],
      [980, 58],
      [1180, 26],
      [1320, 62],
      [1440, 82],
    ],
  },
  {
    colors: 'fill-dusk-3 text-ink',
    arrow: 'bg-ink text-white',
    theme: 'light',
    ridge: [
      [0, 90],
      [300, 84],
      [620, 90],
      [860, 68],
      [1060, 30],
      [1240, 48],
      [1340, 76],
      [1440, 84],
    ],
  },
  {
    colors: 'fill-dusk-4 text-white',
    arrow: 'bg-white text-ink',
    theme: 'dark',
    ridge: [
      [0, 84],
      [220, 90],
      [520, 82],
      [800, 86],
      [1020, 50],
      [1200, 20],
      [1340, 68],
      [1440, 80],
    ],
  },
  {
    colors: 'fill-dusk-5 text-white',
    arrow: 'bg-white text-ink',
    theme: 'dark',
    ridge: [
      [0, 92],
      [340, 84],
      [640, 90],
      [880, 58],
      [1080, 36],
      [1240, 18],
      [1350, 70],
      [1440, 86],
    ],
  },
  {
    colors: 'fill-dusk-6 text-white',
    arrow: 'bg-white text-ink',
    theme: 'dark',
    ridge: [
      [0, 86],
      [260, 92],
      [560, 84],
      [840, 76],
      [1060, 26],
      [1220, 38],
      [1340, 74],
      [1440, 82],
    ],
  },
];
const GROUND: Point[] = [
  [0, 90],
  [320, 84],
  [660, 92],
  [940, 66],
  [1180, 18],
  [1440, 34],
];
// The next section (Parcours) arrives as one more hill
const NEXT_HILL: Point[] = [
  [0, 88],
  [300, 92],
  [700, 78],
  [1000, 84],
  [1240, 30],
  [1440, 10],
];

function Ridge({ points, className }: { points: Point[]; className: string }) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className={clsx('absolute inset-x-0 block h-(--ridge-h) w-full', className)}
    >
      <path d={ridgePath(points, W, H)} />
    </svg>
  );
}

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
 * The review of my skills, as a landscape built by the scroll: each skill is a hill that slides over the
 * one before and stops just under its name (`.bilan-ridge`). Only the names show; each one unfolds its
 * story with an arrow, as in Loisirs.
 */
export default function Bilan() {
  const root = useRef<HTMLElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const peek = useRef<HTMLDivElement>(null);
  // As in Intro: at 1 the ghost hides and stops drawing, which it must do off screen
  const away = useRef(1);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  useReveal(root);

  // The ghost rises from behind the first hill, as the portrait does on the home page
  useEffect(() => {
    const ghost = peek.current;
    if (!ghost || !head.current) return;
    const seen = new IntersectionObserver(([entry]) => {
      away.current = entry.isIntersecting ? 0 : 1;
    });
    seen.observe(ghost);
    const tween = gsap.fromTo(
      ghost,
      { yPercent: 75 },
      {
        yPercent: 0,
        ease: 'none',
        scrollTrigger: { trigger: head.current, start: 'top 70%', end: 'bottom 80%', scrub: 0.6 },
      },
    );
    return () => {
      seen.disconnect();
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [reducedMotion]);

  // A project's card leads here: its skill unfolds on arrival (ProjectDetail)
  useEffect(() => {
    const onShow = (e: Event) => {
      const { detail: name } = e as CustomEvent<string>;
      setOpen((o) => ({ ...o, [name]: true }));
      scrollToStacked(`bilan-${name}`);
    };
    window.addEventListener('show-skill', onShow);
    return () => window.removeEventListener('show-skill', onShow);
  }, []);

  const toggle = (name: string) => {
    setOpen((o) => ({ ...o, [name]: !o[name] }));
    // Opened while stacked, the hills in front would keep it covered: they slide back to uncover it
    if (!open[name]) scrollToStacked(`bilan-${name}`, true);
  };

  return (
    <section
      id="bilan"
      ref={root}
      tabIndex={-1}
      aria-labelledby="bilan-title"
      className="bilan bg-sand text-ink outline-none"
    >
      <div ref={head} className="frame relative pt-24 pb-[calc(var(--ridge-h)+6rem)] md:pt-36">
        <h2 id="bilan-title" className="display title-xl max-sm:text-[15vw]">
          <span data-reveal="0" className="block">
            {bilan.heading[0]}
          </span>
          <span data-reveal="1" className="block md:pl-[3vw]">
            {bilan.heading[1]}
          </span>
        </h2>
        <p data-reveal="2" className="text-lead mt-6 max-w-[42ch] text-pretty md:mt-10">
          {bilan.lead}
        </p>
        {!reducedMotion && (
          <div
            ref={peek}
            aria-hidden
            className="pointer-events-none absolute right-[9%] bottom-0 aspect-[231/289] h-[clamp(6rem,13vw,11rem)]"
          >
            <Ghost progress={away} />
          </div>
        )}
      </div>

      <ul>
        {bilan.skills.map((skill, i) => {
          const isOpen = !!open[skill.name];
          const panel = `bilan-${skill.name}-panel`;
          const opener = `bilan-${skill.name}-opener`;
          return (
            <li
              key={skill.name}
              id={`bilan-${skill.name}`}
              tabIndex={-1}
              data-theme={LAYERS[i].theme}
              style={
                {
                  '--i': i,
                  '--from': `var(--color-dusk-${i + 1})`,
                  '--to': i < LAYERS.length - 1 ? `var(--color-dusk-${i + 2})` : 'var(--color-ink)',
                } as CSSProperties
              }
              className={clsx('bilan-ridge outline-none', LAYERS[i].colors)}
            >
              <Ridge points={LAYERS[i].ridge} className="bottom-[calc(100%-1px)]" />
              <div className="frame pb-[calc(var(--ridge-h)+1.5rem)]">
                <h3>
                  <button
                    type="button"
                    id={opener}
                    aria-expanded={isOpen}
                    aria-controls={panel}
                    onClick={() => toggle(skill.name)}
                    className="group flex w-full cursor-pointer items-center justify-between gap-6 pt-3.5 text-left"
                  >
                    <span className="display ease-out-expo text-[clamp(2.25rem,3vw,2.75rem)] leading-none transition-transform duration-500 group-hover:translate-x-[1vw] motion-reduce:group-hover:translate-x-0">
                      {skill.name}
                    </span>
                    <span
                      aria-hidden
                      className={clsx(
                        'ease-out-expo grid size-11 shrink-0 place-items-center rounded-full transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none',
                        LAYERS[i].arrow,
                        isOpen && 'rotate-180',
                      )}
                    >
                      <svg
                        aria-hidden
                        viewBox="0 0 24 24"
                        className="size-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path d="M12 5v14M5 12l7 7 7-7" />
                      </svg>
                    </span>
                  </button>
                </h3>

                {/* As in Loisirs: grid rows 0fr → 1fr animates the height without measuring it */}
                <div
                  id={panel}
                  role="region"
                  aria-labelledby={opener}
                  inert={!isOpen}
                  className="ease-out-expo grid transition-[grid-template-rows] duration-500 motion-reduce:transition-none"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  {/* The padding keeps the focus ring of a link from being cut off by the clip */}
                  <div className="-mx-2 overflow-hidden px-2">
                    <div className="grid gap-6 pt-5 pb-2 lg:grid-cols-12 lg:gap-10">
                      <p className="text-lead font-medium text-balance lg:col-span-3">
                        {skill.promise}
                      </p>
                      {/* Each step stands higher than the one before: the column climbs towards today */}
                      <ol className="grid gap-8 lg:col-span-9 lg:auto-cols-fr lg:grid-flow-col lg:items-start lg:gap-10">
                        {skill.steps.map((step, k) => (
                          <li
                            key={step.when}
                            style={
                              {
                                '--drop': skill.steps.length - 1 - k,
                                transitionDelay: isOpen ? `${120 + k * 70}ms` : '0ms',
                              } as CSSProperties
                            }
                            className={clsx(
                              'ease-out-expo transition-[opacity,translate] duration-500 motion-reduce:transition-none lg:mt-[calc(var(--drop)*1.75rem)]',
                              isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
                            )}
                          >
                            <p className="text-lead font-medium">{step.when}</p>
                            <p className="mt-2 max-w-[46ch] text-pretty">{step.text}</p>
                            {'proofs' in step && (
                              <p className="mt-1 flex flex-wrap gap-x-5">
                                {step.proofs?.map((proof) => (
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
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div data-theme="dark" className="bg-ink fill-ink text-bg relative">
        <Ridge points={GROUND} className="bottom-[calc(100%-1px)]" />
        <div className="frame grid gap-14 pt-8 pb-[calc(var(--ridge-h)+5rem)] lg:grid-cols-12 lg:gap-10 lg:pb-[calc(var(--ridge-h)+7rem)]">
          <div className="lg:col-span-8">
            <h3 className="text-head font-medium tracking-tight text-balance">
              {bilan.beyond.title}
            </h3>
            <dl className="mt-8 grid gap-8 sm:grid-cols-2 lg:gap-10">
              {bilan.beyond.items.map((item) => (
                <div key={item.name}>
                  <dt className="text-lead font-medium">{item.name}</dt>
                  <dd className="mt-2 max-w-[46ch] text-pretty">{item.text}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="lg:col-span-4">
            <h3 className="text-head font-medium tracking-tight">{bilan.next.title}</h3>
            <p className="text-sand mt-8 text-pretty">{bilan.next.text}</p>
          </div>
        </div>
        <Ridge points={NEXT_HILL} className="fill-surface bottom-[-1px]" />
      </div>
    </section>
  );
}
