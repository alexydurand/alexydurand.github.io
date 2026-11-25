import { useRef, useState, type CSSProperties } from 'react';
import { skills } from '../data/content';
import useNear from '../hooks/useNear';
import Keycap from './Keycap';

type Tool = { name: string; logo: string; group: string; note: string };
// Every tool, family after family, then the AI one
const TOOLS: Tool[] = [
  ...skills.groups.flatMap((g) => g.items.map((s) => ({ ...s, group: g.title, note: g.note }))),
  {
    ...skills.vibe.tool,
    group: skills.vibe.title,
    note: skills.vibe.items.map(([term]) => term).join(' · '),
  },
];
// Every name at the size of the longest one, so that it fits on one line
const LONGEST = Math.max(...TOOLS.map((t) => t.name.length));
const COLS = 5;

/**
 * The tools as a keyboard turned in 3D, after a Skills page seen on video: one key per tool in its brand's
 * colour (--color-key-*). On the left, the family and name of the key under the pointer (or focused, or
 * pressed). The key under the pointer sinks into the board.
 */
export default function Keyboard() {
  const [active, setActive] = useState<Tool | null>(null);
  // The walls only near the screen: even out of sight, their 3D layers cost a fifth of the processor
  const board = useRef<HTMLDivElement>(null);
  const near = useNear(board);

  return (
    <div className="grid items-center gap-4 lg:grid-cols-12 lg:gap-6">
      <div
        aria-live="polite"
        className="@container min-h-[12.75rem] md:px-[3vw] lg:col-span-5 lg:min-h-[20rem] lg:pl-[5vw]"
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
            <p className="text-lead text-muted mt-5 max-w-[30ch]">{active.note}</p>
          </>
        ) : (
          <p className="text-muted text-[clamp(1.375rem,1.1rem+1vw,2rem)]">{skills.hint}</p>
        )}
      </div>

      <div className="flex justify-center py-4 perspective-[1600px] lg:col-span-7 lg:py-12">
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
              onPointerDown={() => setActive(t)}
              className="group pointer-events-none relative size-(--k) cursor-pointer transform-3d"
            >
              <Keycap logo={t.logo} walls={near} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
