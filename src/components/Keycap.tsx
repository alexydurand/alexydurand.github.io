import type { CSSProperties, ReactNode } from 'react';
import clsx from '../lib/clsx';
import { keyGlyph, LIGHT_KEYS } from '../lib/keys';

// A key's walls, bottom to top: each layer a little smaller, for sloped sides. Few layers, each one a 3D layer the
// compositor redraws, all painted alike: a shade per layer showed every layer as a band
const WALLS = 6;
const WALL =
  'linear-gradient(color-mix(in oklab, var(--key), black 30%), color-mix(in oklab, var(--key), black 40%))';
const STEP = 0.06;
const TAPER = 0.0125;
const at = (i: number): CSSProperties => ({
  transform: `translateZ(calc(var(--k) * ${i * STEP}))`,
  inset: `calc(var(--k) * ${i * TAPER})`,
});

/**
 * One key cap standing on a board turned in 3D: its walls, then its dished top with the tool's logo (or a label).
 * The parent gives its size and --k (the side of a square key), sets `pointer-events-none` and the `group`
 * class: only the top at rest catches the pointer, so a key sinking under it stays hovered (it flickered).
 * `pressed` keeps it down; else it sinks while hovered, focused or pressed.
 */
export default function Keycap({
  logo,
  label,
  light = !!logo && LIGHT_KEYS.has(logo),
  walls,
  pressed,
}: {
  logo?: string;
  label?: ReactNode;
  light?: boolean;
  walls: boolean;
  pressed?: boolean;
}) {
  const glyph = keyGlyph(logo);
  const mask = glyph && `url("${glyph}") center / contain no-repeat`;
  return (
    <>
      <span
        aria-hidden
        style={logo ? ({ '--key': `var(--color-key-${logo})` } as CSSProperties) : undefined}
        // Pressed by squashing the walls toward the board (scale Z from z = 0), never through it: walls sunk under
        // the board came back only once the animation was over, the key rose in two steps. The top goes down
        // 0.17 of a key (0.21 while clicked) out of its 0.36. Down quick (expo), back up smooth (quart): a
        // transition takes the timing of the state it goes to
        className={clsx(
          'ease-out-quart pointer-events-none absolute inset-0 transition-transform duration-300 transform-3d',
          pressed
            ? 'ease-out-expo scale-z-[0.53] duration-150'
            : 'group-hover:ease-out-expo group-focus-visible:ease-out-expo group-hover:scale-z-[0.53] group-hover:duration-150 group-focus-visible:scale-z-[0.53] group-focus-visible:duration-150 group-active:scale-z-[0.42] group-active:duration-75',
        )}
      >
        {walls &&
          Array.from({ length: WALLS }, (_, i) => (
            <span
              key={i}
              style={{ ...at(i), background: WALL }}
              className="absolute rounded-[calc(var(--k)*0.26)]"
            />
          ))}
        <span
          style={{
            ...at(WALLS),
            background:
              'radial-gradient(85% 75% at 38% 28%, rgb(255 255 255 / var(--shine, 0.3)), rgb(255 255 255 / 0) 62%), var(--key)',
            boxShadow:
              'inset 0 calc(var(--k) * -0.05) calc(var(--k) * 0.1) rgb(0 0 0 / 0.2), inset 0 calc(var(--k) * 0.03) calc(var(--k) * 0.05) rgb(255 255 255 / 0.3)',
          }}
          className={clsx(
            'absolute grid place-items-center rounded-[calc(var(--k)*0.26)] leading-none font-medium whitespace-nowrap',
            light ? 'text-coal' : 'text-white',
          )}
        >
          {mask ? (
            <span
              style={{ mask, WebkitMask: mask }}
              className={clsx('size-[46%]', light ? 'bg-coal' : 'bg-white')}
            />
          ) : (
            label
          )}
        </span>
      </span>
      {/* Where the top stands at rest: it catches the pointer, and never moves */}
      <span style={at(WALLS)} className="pointer-events-auto absolute" />
    </>
  );
}
