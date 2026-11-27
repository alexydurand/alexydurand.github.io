import { useState, type CSSProperties, type MouseEventHandler } from 'react';
import { projects, skills } from '../data/content';
import clsx from '../lib/clsx';
import { keyGlyph } from '../lib/keys';
import Keycap from './Keycap';

// Each tool's key: those of the keyboard (Mes outils), then those of the cards only
const KEYS = new Map(
  [...skills.groups.flatMap((g) => g.items), skills.vibe.tool, ...skills.extra].map((t) => [
    t.name,
    t.logo,
  ]),
);
if (import.meta.env.DEV) {
  for (const name of projects.flatMap((p) => p.stack))
    console.assert(KEYS.has(name), `Pas de touche pour ${name} (skills.extra)`);
}

/**
 * A project card's tools as keys on a small board turned like Mes outils' keyboard. As there, the key reached by
 * the pointer sinks and stays down until another one takes its place, and its name shows above the board. Laid
 * over the card's button, so a click here opens the card too (onOpen).
 */
export default function ProjectKeys({
  stack,
  walls,
  onOpen,
}: {
  stack: string[];
  walls: boolean;
  onOpen: MouseEventHandler<HTMLDivElement>;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const keys = stack.map((name) => {
    const logo = KEYS.get(name);
    // A name in place of a logo takes two keys' room
    return { name, logo, wide: !keyGlyph(logo) && name.length > 3 };
  });
  // No wider than its keys: one key gets a board of one
  const slots = keys.reduce((n, k) => n + (k.wide ? 2 : 1), 0);

  return (
    <>
      {/* In the black between the title and the keys; it may shrink to nothing, never pushing the keys out */}
      <div aria-hidden className="flex min-h-0 flex-1 items-center overflow-hidden">
        {picked && (
          <p
            key={picked}
            className="display text-[clamp(1.75rem,1rem+1.6vw,2.75rem)] leading-none text-balance motion-safe:animate-[menu-rise_0.4s_var(--ease-out-expo)]"
          >
            {picked}
          </p>
        )}
      </div>
      <div
        aria-hidden
        onClick={onOpen}
        className="relative z-10 flex cursor-pointer items-end justify-between gap-3 pt-3"
      >
        <div className="min-w-0 perspective-[40rem]">
          {/* Keys on a grid, so that they line up: 5 a row on a phone, 3 beside the picture, a two-key name
              filling a hole further back if need be. --k lets them fit the text column, whatever the width of
              the card. Turned so that their sides show, and less lit */}
          <div
            style={
              { '--cols': Math.min(slots, 5), '--cols-lg': Math.min(slots, 3) } as CSSProperties
            }
            className="bg-surface grid origin-bottom rotate-x-[34deg] -rotate-z-8 grid-flow-row-dense grid-cols-[repeat(var(--cols),var(--k))] gap-[calc(var(--k)*0.18)] rounded-[calc(var(--k)*0.32)] p-[calc(var(--k)*0.2)] text-[calc(var(--k)*0.28)] shadow-[0_1rem_2rem_rgb(0_0_0/0.6)] [--k:min(2.75rem,calc((var(--card-w)_-_4.75rem)/6.12))] [--shine:0.14] transform-3d lg:grid-cols-[repeat(var(--cols-lg),var(--k))] lg:[--k:min(2.75rem,calc((var(--card-w)*0.38_-_5.25rem)/3.76))]"
          >
            {keys.map(({ name, logo, wide }) => (
              <span
                key={name}
                onPointerEnter={() => setPicked(name)}
                className={clsx(
                  'pointer-events-none relative h-(--k) transform-3d',
                  wide && 'col-span-2',
                )}
              >
                <Keycap logo={logo} label={name} walls={walls} pressed={picked === name} />
              </span>
            ))}
          </div>
        </div>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="size-6 shrink-0 fill-none stroke-current stroke-2"
        >
          <path d="M12 4v16M4 12h16" />
        </svg>
      </div>
    </>
  );
}
