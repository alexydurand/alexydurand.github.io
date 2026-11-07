import { useRef, useState } from 'react';
import { loisirs } from '../data/content';
import useReveal from '../hooks/useReveal';
import Vinyl from '../components/Vinyl';
import ChessBoard from '../components/ChessBoard';
import ChessPieces from '../components/ChessPieces';
import Circuit from '../components/Circuit';
import useMediaQuery from '../hooks/useMediaQuery';
import clsx from '../lib/clsx';

const LOGOS = import.meta.glob<string>('../assets/logos/*.svg', { eager: true, import: 'default' });
const COVERS = import.meta.glob<string>('../assets/music/*.jpg', {
  eager: true,
  import: 'default',
});

export default function Loisirs() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  useReveal(root);

  return (
    <section
      id="loisirs"
      ref={root}
      tabIndex={-1}
      aria-labelledby="loisirs-title"
      className="bg-bg pt-[calc(var(--spacing-section)*0.5)] outline-none"
    >
      <div className="frame">
        <h2 id="loisirs-title" data-reveal="0" className="display title-xl">
          {loisirs.heading}
        </h2>
      </div>

      <ul className="mt-12 md:mt-20">
        {loisirs.hobbies.map((h, i) => {
          const isOpen = !!open[h.id];
          return (
            <li key={h.id} className={i % 2 ? 'bg-bg' : 'bg-surface'}>
              <div className="frame">
                {!h.text && !h.records ? (
                  <h3
                    data-reveal={0}
                    className="flex min-h-[120px] items-end pt-8 pb-6 md:min-h-[170px]"
                  >
                    <span className="display text-accent text-[clamp(2.75rem,7vw,6.5rem)] leading-none">
                      {h.title}
                    </span>
                  </h3>
                ) : (
                  <>
                    <h3 data-reveal={0}>
                      <button
                        type="button"
                        id={`loisir-${h.id}`}
                        aria-expanded={isOpen}
                        aria-controls={`loisir-${h.id}-panel`}
                        onClick={() => setOpen((o) => ({ ...o, [h.id]: !o[h.id] }))}
                        className="group flex min-h-[120px] w-full items-end justify-between gap-6 pt-8 pb-6 text-left md:min-h-[170px]"
                      >
                        <span className="display text-accent ease-out-expo text-[clamp(2.75rem,7vw,6.5rem)] leading-none transition-transform duration-500 group-hover:translate-x-[2vw] motion-reduce:group-hover:translate-x-0">
                          {h.title}
                        </span>
                        <span
                          aria-hidden
                          className={clsx(
                            'bg-accent text-accent-ink ease-out-expo mb-2 grid size-12 shrink-0 place-items-center rounded-full transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none md:size-14',
                            isOpen && 'rotate-180',
                          )}
                        >
                          <svg
                            aria-hidden
                            viewBox="0 0 24 24"
                            className="size-6"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path d="M12 5v14M5 12l7 7 7-7" />
                          </svg>
                        </span>
                      </button>
                    </h3>

                    {/* Grid rows 0fr → 1fr animates the height without measuring it */}
                    <div
                      id={`loisir-${h.id}-panel`}
                      role="region"
                      aria-labelledby={`loisir-${h.id}`}
                      inert={!isOpen}
                      className="ease-out-expo grid transition-[grid-template-rows] duration-500 motion-reduce:transition-none"
                      style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                    >
                      <div className="overflow-hidden">
                        <div className="grid items-center gap-8 pt-2 pb-10 md:grid-cols-12 md:gap-6 md:pb-14">
                          {h.text && (
                            <div className="md:col-span-5">
                              {h.logo && (
                                <img
                                  src={LOGOS[`../assets/logos/${h.logo.file}.svg`]}
                                  alt={h.logo.name}
                                  width={120}
                                  height={30}
                                  loading="lazy"
                                  className="mb-6 h-7 w-auto md:h-9"
                                />
                              )}
                              <p className="text-lead max-w-[42ch] text-pretty">{h.text}</p>
                            </div>
                          )}

                          {h.games && (
                            // Hovering a logo lifts it and dims the others
                            <ul className="group/games grid grid-cols-2 items-center gap-6 sm:grid-cols-4 md:col-span-7 md:col-start-6 md:gap-10">
                              {h.games.map((g, k) => (
                                <li
                                  key={g.name}
                                  style={{ transitionDelay: isOpen ? `${150 + k * 70}ms` : '0ms' }}
                                  className={clsx(
                                    'group/game ease-out-expo grid h-16 place-items-center transition-[opacity,translate] duration-500 motion-reduce:transition-none sm:h-20 lg:h-24',
                                    isOpen
                                      ? 'translate-y-0 opacity-100'
                                      : 'translate-y-4 opacity-0',
                                  )}
                                >
                                  <img
                                    src={LOGOS[`../assets/logos/${g.logo}.svg`]}
                                    alt={g.name}
                                    width={160}
                                    height={60}
                                    loading="lazy"
                                    className="ease-out-expo max-h-full w-full object-contain transition-[opacity,scale,translate,filter] duration-500 group-hover/game:-translate-y-1.5 group-hover/game:scale-110 group-hover/game:opacity-100! group-hover/games:opacity-35 motion-reduce:group-hover/game:translate-y-0 motion-reduce:group-hover/game:scale-100"
                                  />
                                </li>
                              ))}
                            </ul>
                          )}

                          {h.records && (
                            <ul className="grid gap-10 sm:grid-cols-3 sm:gap-8 md:col-span-12">
                              {h.records.map((r, k) => (
                                <li key={r.cover} className="max-w-xs sm:max-w-none">
                                  <Vinyl
                                    cover={COVERS[`../assets/music/${r.cover}.jpg`]}
                                    out={isOpen}
                                    delay={k * 120}
                                  />
                                  <p className="text-lead mt-4 font-medium">
                                    {r.album || r.artist}
                                  </p>
                                  {r.album && <p className="text-body text-muted">{r.artist}</p>}
                                </li>
                              ))}
                            </ul>
                          )}

                          {h.id === 'f1' && (
                            <div className="md:col-span-7 md:flex md:justify-end">
                              <Circuit playing={isOpen} still={reducedMotion} />
                            </div>
                          )}

                          {h.id === 'echecs' && (
                            <div className="md:col-span-7 md:flex md:items-center md:gap-6">
                              {/* The pieces of Morphy's mate fill the space between the text and the board */}
                              {isOpen && <ChessPieces className="hidden h-96 flex-1 lg:block" />}
                              <div className="w-full max-w-80 shrink-0 md:max-w-96">
                                <ChessBoard playing={isOpen} still={reducedMotion} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
