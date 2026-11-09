import { useEffect, useState } from 'react';
import clsx from '../lib/clsx';

// A packed hall in front of the giant screen: rows of heads, back to front (y of the shoulders, head radius)
const ROWS = [
  { y: 300, r: 7, n: 22, fill: 'fill-hill-6' },
  { y: 326, r: 9, n: 17, fill: 'fill-ink' },
  { y: 360, r: 12, n: 13, fill: 'fill-night' },
];
// Same crowd on every render: a small seeded shuffle of each row
const jitter = (i: number) => (((Math.sin(i * 12.9898) * 43758.5453) % 1) + 1) % 1;
const CROWD = ROWS.flatMap((row, k) =>
  Array.from({ length: row.n }, (_, i) => {
    const x = ((i + 0.5 + (jitter(k * 40 + i) - 0.5) * 0.6) / row.n) * 640;
    return { ...row, x, y: row.y + jitter(k * 90 + i) * 8 - 4, key: `${k}-${i}` };
  }),
);
// Phones held up in the back rows
const PHONES = CROWD.filter((_, i) => i % 5 === 2 && i < 40);

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
    <figure className="w-full max-w-lg">
      <svg
        aria-hidden
        viewBox="0 0 640 400"
        className={clsx('block w-full', !playing && '[&_*]:[animation-play-state:paused]')}
      >
        <rect width="640" height="400" className="fill-hill-6" />
        {/* The screen lights the floor in front of it */}
        <path d="M70 250 H570 L640 400 H0 Z" className="fill-white/[0.07]" />
        <rect x="70" y="24" width="500" height="281" className="fill-paper" />
        <image
          key={`logo-${current}`}
          href={games[current].src}
          x="150"
          y="60"
          width="340"
          height="150"
          preserveAspectRatio="xMidYMid meet"
          className="origin-center animate-[screen-in_0.6s_var(--ease-out-expo)_both] [transform-box:fill-box] motion-reduce:animate-none"
        />
        {/* Two spotlights sweep the hall */}
        {[60, 580].map((x, i) => (
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
              style={{ animationDelay: `${(p.x / 640) * 0.7}s` }}
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
