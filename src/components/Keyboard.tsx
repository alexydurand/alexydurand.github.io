import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { skills, ui } from '../data/content';
import { clack } from '../lib/clack';
import clsx from '../lib/clsx';

const GLYPHS = import.meta.glob<string>('../assets/keys/*.svg', { eager: true, import: 'default' });
const LOGOS = import.meta.glob<string>('../assets/logos/*.svg', { eager: true, import: 'default' });
// Tool logo (Devicon name) → its one-colour Simple Icons glyph, where one exists; else the Devicon
// logo's silhouette (the mask only keeps its shape)
const SIMPLE: Record<string, string> = {
  sqldeveloper: 'oracle',
  vue: 'vuedotjs',
  nodejs: 'nodedotjs',
  godot: 'godotengine',
};
// Light keys get a dark glyph
const LIGHT = new Set(['powerbi', 'javascript', 'react']);

type Tool = { name: string; logo: string; group: string; note: string; learning?: boolean };
// Every tool, family after family, then the AI one
const TOOLS: Tool[] = [
  ...skills.groups.flatMap((g) =>
    g.items.map((s) => ({ ...s, group: g.title, note: g.note }) as Tool),
  ),
  {
    ...skills.vibe.tool,
    group: skills.vibe.title,
    note: skills.vibe.items.map(([term]) => term).join(' · '),
  },
];
// Every name at the size of the longest one, so that it fits on one line
const LONGEST = Math.max(...TOOLS.map((t) => t.name.length));
const COLS = 5;
// A key's walls, bottom to top: each layer a little smaller and lighter, for sloped, rounded sides
// Few layers: each one is a 3D layer the compositor redraws on every frame
const WALLS = 6;
const STEP = 0.06;
const TAPER = 0.025;

// One key cap standing on the board: its walls, then its dished top with the tool's logo in white
function cap(logo: string | undefined, walls: boolean) {
  const glyph =
    logo &&
    (GLYPHS[`../assets/keys/${SIMPLE[logo] ?? logo}.svg`] ?? LOGOS[`../assets/logos/${logo}.svg`]);
  const mask = glyph && `url("${glyph}") center / contain no-repeat`;
  const at = (i: number) => `translateZ(calc(var(--k) * ${i * STEP})) scale(${1 - i * TAPER})`;
  return (
    <span className="ease-out-expo absolute inset-0 transition-transform duration-150 transform-3d group-hover:-translate-z-[calc(var(--k)*0.17)] group-focus-visible:-translate-z-[calc(var(--k)*0.17)] group-active:-translate-z-[calc(var(--k)*0.21)] group-active:duration-75">
      {walls &&
        Array.from({ length: WALLS }, (_, i) => (
          <span
            key={i}
            style={{
              transform: at(i),
              background: `color-mix(in oklab, var(--key), black ${48 - i * 5}%)`,
            }}
            className="absolute inset-0 rounded-[26%]"
          />
        ))}
      <span
        style={{
          transform: at(WALLS),
          background:
            'radial-gradient(85% 75% at 38% 28%, rgb(255 255 255 / 0.3), rgb(255 255 255 / 0) 62%), var(--key)',
          boxShadow:
            'inset 0 calc(var(--k) * -0.05) calc(var(--k) * 0.1) rgb(0 0 0 / 0.2), inset 0 calc(var(--k) * 0.03) calc(var(--k) * 0.05) rgb(255 255 255 / 0.3)',
        }}
        className="absolute inset-0 grid place-items-center rounded-[26%]"
      >
        {mask && (
          <span
            style={{ mask, WebkitMask: mask }}
            className={clsx('size-[46%]', LIGHT.has(logo) ? 'bg-coal' : 'bg-white')}
          />
        )}
      </span>
    </span>
  );
}

/**
 * The tools as a keyboard turned in 3D, after a Skills page seen on video: one key per tool in its brand's
 * colour (--color-key-*). On the left, the family and name of the key under the pointer (or focused, or
 * pressed). The key under the pointer sinks into the board; pressing it clicks.
 */
export default function Keyboard() {
  const [active, setActive] = useState<Tool | null>(null);
  // The walls only near the screen: even out of sight, their 3D layers cost a fifth of the processor
  const board = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = board.current;
    if (!el) return;
    const seen = new IntersectionObserver(([e]) => setNear(e.isIntersecting), {
      rootMargin: '50% 0px',
    });
    seen.observe(el);
    return () => seen.disconnect();
  }, []);
  const blanks = (COLS - (TOOLS.length % COLS)) % COLS;

  return (
    <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-6">
      <div
        aria-live="polite"
        className="@container min-h-[13rem] md:px-[3vw] lg:col-span-5 lg:min-h-[20rem] lg:pl-[5vw]"
      >
        {active ? (
          <>
            <p className="text-muted text-[clamp(1.375rem,1.1rem+1vw,2rem)]">{active.group}</p>
            {/* The same size for every tool: a letter is about 0.55em wide in this face */}
            <p
              style={{ fontSize: `min(7rem, 100cqw / ${(LONGEST * 0.55).toFixed(2)})` }}
              className="display mt-3 whitespace-nowrap"
            >
              {active.name}
            </p>
            {active.learning && <p className="text-body text-muted mt-3">{ui.learning}</p>}
            <p className="text-lead text-muted mt-5 max-w-[30ch]">{active.note}</p>
          </>
        ) : (
          <p className="text-muted text-[clamp(1.375rem,1.1rem+1vw,2rem)]">{skills.hint}</p>
        )}
      </div>

      <div className="flex justify-center py-6 perspective-[1600px] lg:col-span-7 lg:py-12">
        <div
          style={
            {
              // Smaller on the narrowest phones (320 px), where the turned board would overflow
              '--k': 'clamp(min(3rem, 13vw), 1.25rem + 4.2vw, 5rem)',
              gridTemplateColumns: `repeat(${COLS}, var(--k))`,
              transform: 'rotateX(38deg) rotateZ(-24deg)',
            } as CSSProperties
          }
          ref={board}
          className="bg-surface grid gap-[calc(var(--k)*0.1)] rounded-[calc(var(--k)*0.32)] p-[calc(var(--k)*0.2)] shadow-[0_2rem_4rem_rgb(0_0_0/0.6)] transform-3d"
        >
          {TOOLS.map((t) => (
            <button
              key={t.name}
              type="button"
              aria-label={`${t.group} : ${t.name}`}
              onPointerEnter={() => setActive(t)}
              onFocus={() => setActive(t)}
              onPointerDown={() => {
                setActive(t);
                clack();
              }}
              style={{ '--key': `var(--color-key-${t.logo})` } as CSSProperties}
              className="group relative size-(--k) cursor-pointer transform-3d"
            >
              {cap(t.logo, near)}
            </button>
          ))}
          {Array.from({ length: blanks }, (_, i) => (
            <span
              key={i}
              aria-hidden
              style={{ '--key': 'var(--color-key-express)' } as CSSProperties}
              className="relative size-(--k) transform-3d"
            >
              {cap(undefined, near)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
