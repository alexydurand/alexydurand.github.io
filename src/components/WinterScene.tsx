import { MIDDLE, NEAR, TOP } from '../lib/hills';
import { crestPath, ridgePath } from '../lib/ridge';
import {
  BULBS,
  LIGHTS,
  SNOW_PATHS,
  SNOWMAN,
  SPRUCES,
  TEMPLATES,
  WIRES,
  type Plane,
} from '../lib/winter';

// Same box and cover as the hills picture (Hero.tsx), so everything stays where it stands on it
const frame = {
  'aria-hidden': true,
  viewBox: '0 0 2400 1361',
  preserveAspectRatio: 'xMidYMid slice',
} as const;
const bulb = (c: number) => `var(--color-bulb-${BULBS[c]})`;
// What hides a piece of path: its own hill's top behind it, the crest in front of it
const CLIP: Record<Plane, [string, string?]> = {
  near: ['clip-near'],
  middle: ['clip-middle', 'clip-above-near'],
  far: ['clip-far', 'clip-above-middle'],
};
const below = (pts: typeof NEAR) => ridgePath(pts, 2400, 1400);
const above = (pts: typeof NEAR) => `${crestPath(pts)} L2400 0 L0 0Z`;
// Three sets of lights glimmering out of step: each set is its own layer whose opacity the
// compositor animates, so the blinking repaints nothing
const PHASES = [
  { duration: '1.3s', delay: '0s' },
  { duration: '1.7s', delay: '-0.6s' },
  { duration: '2.1s', delay: '-1.3s' },
];

/** The hills in winter: snowy paths, woods of decorated spruces, light strings from tree to tree. */
export default function WinterScene() {
  return (
    <>
      <svg {...frame} className="absolute inset-0 size-full">
        <defs>
          <filter id="snow-soft" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
          <filter id="snow-haze" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" />
          </filter>
          {BULBS.map((c, i) => (
            <radialGradient key={c} id={`bauble-${c}`} cx="0.35" cy="0.3" r="0.75">
              <stop offset="0" style={{ stopColor: 'var(--color-snow)' }} />
              <stop offset="0.3" style={{ stopColor: bulb(i) }} />
              <stop
                offset="1"
                style={{ stopColor: `color-mix(in oklab, ${bulb(i)}, var(--color-coal) 65%)` }}
              />
            </radialGradient>
          ))}
          <clipPath id="clip-near">
            <path d={below(NEAR)} />
          </clipPath>
          <clipPath id="clip-middle">
            <path d={below(MIDDLE)} />
          </clipPath>
          <clipPath id="clip-far">
            <path d={below(TOP)} />
          </clipPath>
          <clipPath id="clip-above-near">
            <path d={above(NEAR)} />
          </clipPath>
          <clipPath id="clip-above-middle">
            <path d={above(MIDDLE)} />
          </clipPath>
          {/* Snow on the paths, dimmer far away */}
          <linearGradient
            id="path-fade"
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="900"
            x2="0"
            y2="1361"
          >
            <stop offset="0" style={{ stopColor: 'var(--color-snow)', stopOpacity: 0.16 }} />
            <stop offset="1" style={{ stopColor: 'var(--color-snow)', stopOpacity: 0.72 }} />
          </linearGradient>
          {/* Snow lit by the moon, from the top right; blue in the shadow */}
          <radialGradient id="snowball" cx="0.62" cy="0.3" r="0.8">
            <stop offset="0" style={{ stopColor: 'var(--color-snow)' }} />
            <stop
              offset="0.6"
              style={{
                stopColor: 'color-mix(in oklab, var(--color-snow), var(--color-night) 30%)',
              }}
            />
            <stop
              offset="1"
              style={{
                stopColor: 'color-mix(in oklab, var(--color-snow), var(--color-night) 65%)',
              }}
            />
          </radialGradient>
          {TEMPLATES.map((parts, i) => (
            <g key={i} id={`spruce-${i}`}>
              {parts.map(({ d, className }) => (
                <path key={d.slice(0, 40)} d={d} className={className} />
              ))}
            </g>
          ))}
        </defs>
        {SNOW_PATHS.map(({ plane, area, banks, trodden, steps, w }) => {
          const [hill, front] = CLIP[plane];
          return (
            <g key={area.slice(0, 24)} clipPath={`url(#${hill})`}>
              <g clipPath={front && `url(#${front})`}>
                <path d={area} filter="url(#snow-haze)" className="fill-snow opacity-10" />
                <path d={area} filter="url(#snow-soft)" fill="url(#path-fade)" />
                {/* Packed down in the middle, heaped up along the edges, footprints */}
                <path d={trodden} filter="url(#snow-soft)" className="fill-fir-deep opacity-10" />
                <path
                  d={banks}
                  filter="url(#snow-soft)"
                  strokeWidth={w * 0.1}
                  strokeLinecap="round"
                  className="stroke-snow fill-none opacity-20"
                />
                {steps.map((d, i) => (
                  <path
                    key={d.slice(0, 24)}
                    d={d}
                    filter="url(#snow-soft)"
                    strokeWidth={w * 0.045}
                    strokeDasharray={`${w * 0.05} ${w * 0.16} ${w * 0.04} ${w * 0.27} ${w * 0.06} ${w * 0.2}`}
                    strokeDashoffset={i * w * 0.11}
                    strokeLinecap="round"
                    className="stroke-fir-deep fill-none opacity-20"
                  />
                ))}
              </g>
            </g>
          );
        })}
        {SPRUCES.map((s) => (
          <g key={s.x}>
            {/* Snow piled at the foot of the bigger ones */}
            {s.h > 100 && (
              <ellipse
                cx={s.x}
                cy={s.y - 2}
                rx={s.h * 0.33}
                ry={s.h * 0.045}
                filter="url(#snow-haze)"
                className="fill-snow opacity-35"
              />
            )}
            <g transform={`translate(${s.x} ${s.y}) scale(${s.h / 100})`}>
              <use href={`#spruce-${s.template}`} />
              {s.baubles.map(([bx, by, c]) => (
                <circle
                  key={`${bx},${by}`}
                  cx={bx}
                  cy={by}
                  r={2.6}
                  fill={`url(#bauble-${BULBS[c]})`}
                />
              ))}
            </g>
          </g>
        ))}
        {/* A snowman, the nearest of all: scarf, carrot nose, coal eyes and buttons, twig arms, a hat */}
        <g transform={`translate(${SNOWMAN.x} ${SNOWMAN.y}) scale(${SNOWMAN.h / 100})`}>
          <ellipse
            cx={3}
            cy={0}
            rx={34}
            ry={5}
            filter="url(#snow-soft)"
            className="fill-snow opacity-40"
          />
          <path
            d="M-13 -57 L-34 -71 M-28 -67 L-31 -77 M-30 -68 L-39 -69 M13 -57 L33 -66 M27 -63 L30 -73 M29 -64 L38 -62"
            strokeWidth={1.6}
            strokeLinecap="round"
            className="stroke-twig fill-none"
          />
          <circle cy={-22} r={22} fill="url(#snowball)" />
          <circle cy={-55} r={16} fill="url(#snowball)" />
          <circle cy={-80} r={11.5} fill="url(#snowball)" />
          {[-61, -53, -45].map((y) => (
            <circle key={y} cy={y} r={1.5} className="fill-coal" />
          ))}
          <path d="M-11 -70 Q0 -64 11 -70 L11 -65 Q0 -59 -11 -65 Z" className="fill-bulb-red" />
          <path d="M4 -64 L9 -49 L4.5 -48 L1.5 -63 Z" className="fill-bulb-red" />
          {[-4, 4].map((x) => (
            <circle key={x} cx={x} cy={-83} r={1.3} className="fill-coal" />
          ))}
          {[-4, -2, 0, 2, 4].map((x) => (
            <circle key={x} cx={x} cy={-75.5 + (16 - x * x) * 0.06} r={0.7} className="fill-coal" />
          ))}
          <path d="M0.5 -80.6 L11 -78.6 L0.5 -77.6 Z" className="fill-carrot" />
          <rect x={-13} y={-91.5} width={26} height={2.5} rx={1} className="fill-coal" />
          <rect x={-8.5} y={-108} width={17} height={17} rx={1} className="fill-coal" />
          <rect x={-8.5} y={-95} width={17} height={3} className="fill-bulb-red" />
          <rect x={-8.5} y={-108.8} width={17} height={1.6} rx={0.8} className="fill-snow/80" />
        </g>
        <path
          d={WIRES}
          vectorEffect="non-scaling-stroke"
          className="fill-none stroke-white/15 stroke-1"
        />
      </svg>
      {PHASES.map(({ duration, delay }, p) => (
        <svg
          key={duration}
          {...frame}
          style={{ animationDuration: duration, animationDelay: delay }}
          className="absolute inset-0 size-full animate-[glimmer_1s_ease-in-out_infinite_alternate]"
        >
          {p === 0 && (
            <defs>
              {BULBS.map((c, i) => (
                <radialGradient key={c} id={`glow-${c}`}>
                  <stop offset="0" style={{ stopColor: bulb(i), stopOpacity: 0.75 }} />
                  <stop offset="0.35" style={{ stopColor: bulb(i), stopOpacity: 0.25 }} />
                  <stop offset="1" style={{ stopColor: bulb(i), stopOpacity: 0 }} />
                </radialGradient>
              ))}
            </defs>
          )}
          {SNOW_PATHS.map(({ plane, area, sparkles }) => {
            const [hill, front] = CLIP[plane];
            return (
              <g key={area.slice(0, 24)} clipPath={`url(#${hill})`}>
                <g clipPath={front && `url(#${front})`}>
                  {sparkles
                    .filter((s) => s.phase === p)
                    .map((s) => (
                      <circle
                        key={`${s.x},${s.y}`}
                        cx={s.x}
                        cy={s.y}
                        r={s.r}
                        className="fill-white"
                      />
                    ))}
                </g>
              </g>
            );
          })}
          {LIGHTS.filter((l) => l.phase === p).map((l) => (
            <g key={`${l.x},${l.y}`}>
              <circle cx={l.x} cy={l.y} r={l.r * 5} fill={`url(#glow-${BULBS[l.color]})`} />
              <circle cx={l.x} cy={l.y} r={l.r} style={{ fill: bulb(l.color) }} />
              <circle cx={l.x} cy={l.y} r={l.r * 0.45} className="fill-snow" />
            </g>
          ))}
        </svg>
      ))}
    </>
  );
}
