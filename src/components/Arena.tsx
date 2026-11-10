import { useEffect, useState } from 'react';
import clsx from '../lib/clsx';

// The hall is wide (W × 400): phones crop its sides (slice), wide screens see all of it
const W = 960;
// A packed hall in front of the giant screen: rows of heads, back to front (y of the shoulders, head radius)
const ROWS = [
  { y: 300, r: 7, n: 33, fill: 'fill-hill-6' },
  { y: 326, r: 9, n: 26, fill: 'fill-coal' },
  { y: 360, r: 12, n: 20, fill: 'fill-night' },
];
// Same crowd on every render: a small seeded shuffle of each row
const jitter = (i: number) => (((Math.sin(i * 12.9898) * 43758.5453) % 1) + 1) % 1;
const CROWD = ROWS.flatMap((row, k) =>
  Array.from({ length: row.n }, (_, i) => {
    const x = ((i + 0.5 + (jitter(k * 40 + i) - 0.5) * 0.6) / row.n) * W;
    return { ...row, x, y: row.y + jitter(k * 90 + i) * 8 - 4, key: `${k}-${i}` };
  }),
);
// Phones held up in the back rows
const PHONES = CROWD.filter((_, i) => i % 5 === 2 && i < 60);

/**
 * The esports games, one after the other on the screen of a full hall. Each new game sends a wave
 * through the crowd. The names below put a game on the screen; it moves on by itself while `playing`.
 */
export default function Arena({
  games,
  playing,
  still,
}: {
  games: { name: string; src: string }[];
  playing: boolean;
  still: boolean;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!playing || still) return;
    const next = window.setTimeout(() => setCurrent((c) => (c + 1) % games.length), 3200);
    return () => window.clearTimeout(next);
  }, [current, playing, still, games.length]);

  return (
    <figure className="w-full">
      <div className="relative aspect-[8/5] lg:aspect-[12/5]">
        <svg
          aria-hidden
          viewBox={`0 0 ${W} 400`}
          preserveAspectRatio="xMidYMid slice"
          className={clsx(
            'absolute inset-0 size-full',
            !playing && '[&_*]:[animation-play-state:paused]',
          )}
        >
          <rect width={W} height="400" className="fill-hill-6" />
          {/* The screen lights the floor in front of it */}
          <path d={`M230 250 H730 L${W} 400 H0 Z`} className="fill-white/[0.07]" />
          <rect x="230" y="24" width="500" height="281" className="fill-paper" />
          {/* All four at once, already loaded: only the one on screen shows */}
          {games.map((g, i) => (
            <image
              key={g.name}
              href={g.src}
              x="310"
              y="60"
              width="340"
              height="150"
              preserveAspectRatio="xMidYMid meet"
              className={clsx(
                'transition-opacity duration-500',
                i === current ? 'opacity-100' : 'opacity-0',
              )}
            />
          ))}
          {/* Two spotlights sweep the hall */}
          {[120, 840].map((x, i) => (
            <path
              key={x}
              d={`M${x} 0 L${x - 50} 400 H${x + 50} Z`}
              style={{ transformOrigin: `${x}px 0px`, animationDelay: `${i * -2.4}s` }}
              className="fill-sand/10 animate-[beam_4.8s_ease-in-out_infinite_alternate] motion-reduce:animate-none"
            />
          ))}
          {/* The crowd, redrawn for each game so that its wave starts again, from left to right */}
          <g key={`crowd-${current}`}>
            {CROWD.map((p) => (
              <g
                key={p.key}
                style={{ animationDelay: `${(p.x / W) * 0.9}s` }}
                className={clsx(p.fill, !still && 'animate-[ola_0.7s_ease-out_both]')}
              >
                <circle cx={p.x} cy={p.y - p.r * 1.7} r={p.r} />
                <rect
                  x={p.x - p.r * 1.9}
                  y={p.y - p.r * 0.4}
                  width={p.r * 3.8}
                  height="80"
                  rx={p.r * 1.2}
                />
              </g>
            ))}
          </g>
          {PHONES.map((p, i) => (
            <circle
              key={p.key}
              cx={p.x + p.r * 1.4}
              cy={p.y - p.r * 3.6}
              r="2.2"
              style={{ animationDelay: `${(i * 0.37) % 1.6}s` }}
              className="fill-sand animate-[twinkle_1.6s_ease-in-out_infinite_alternate] motion-reduce:animate-none"
            />
          ))}
        </svg>
      </div>
      <figcaption>
        <ul className="mt-2 flex flex-wrap justify-center gap-x-4">
          {games.map((g, i) => (
            <li key={g.name}>
              <button
                type="button"
                aria-pressed={i === current}
                onClick={() => setCurrent(i)}
                onMouseEnter={() => setCurrent(i)}
                className={clsx(
                  'text-small min-h-11 cursor-pointer underline-offset-4 transition-colors hover:underline',
                  i === current ? 'text-ink underline decoration-2' : 'text-muted',
                )}
              >
                {g.name}
              </button>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
