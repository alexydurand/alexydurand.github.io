import { useEffect, useState } from 'react';
import clsx from '../lib/clsx';

// Pieces by Cburnett (Wikimedia Commons, CC BY-SA 3.0): l = white, d = black
const PIECES = import.meta.glob<string>('../assets/chess/*.svg', { eager: true, import: 'default' });
const img = (kind: string) => PIECES[`../assets/chess/${kind}.svg`];

const FILES = 'abcdefgh';
const square = (s: string) => (8 - Number(s[1])) * 8 + FILES.indexOf(s[0]);

// Morphy against the Duke of Brunswick and Count Isouard, Paris 1858 ("the Opera game").
// Each step is one move; castling moves the king and the rook.
const GAME = [
  'e2e4', 'e7e5', 'g1f3', 'd7d6', 'd2d4', 'c8g4', 'd4e5', 'g4f3', 'd1f3', 'd6e5', 'f1c4', 'g8f6',
  'f3b3', 'd8e7', 'b1c3', 'c7c6', 'c1g5', 'b7b5', 'c3b5', 'c6b5', 'c4b5', 'b8d7', 'e1c1 a1d1', 'a8d8',
  'd1d7', 'd8d7', 'h1d1', 'e7e6', 'b5d7', 'f6d7', 'b3b8', 'd7b8', 'd1d8',
].map((step) => step.split(' ').map((m) => [square(m.slice(0, 2)), square(m.slice(2))]));

const BACK = 'rnbqkbnr';
const START = [
  ...[...BACK].map((p, i) => ({ kind: `d${p}`, sq: i })),
  ...[...BACK].map((_, i) => ({ kind: 'dp', sq: 8 + i })),
  ...[...BACK].map((_, i) => ({ kind: 'lp', sq: 48 + i })),
  ...[...BACK].map((p, i) => ({ kind: `l${p}`, sq: 56 + i })),
];

/** Position after `steps` moves: every piece keeps its index, captured ones are marked. */
function position(steps: number) {
  const pieces = START.map((p) => ({ ...p, alive: true }));
  for (const step of GAME.slice(0, steps)) {
    for (const [from, to] of step) {
      const victim = pieces.find((p) => p.alive && p.sq === to);
      if (victim) victim.alive = false;
      const mover = pieces.find((p) => p.alive && p.sq === from);
      if (mover) mover.sq = to;
    }
  }
  return pieces;
}

// A few beats on the final checkmate before starting over
const HOLD = 4;

export default function ChessBoard({ playing, still }: { playing: boolean; still: boolean }) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!playing || still) return;
    const id = window.setInterval(() => setTick((t) => (t + 1) % (GAME.length + HOLD + 1)), 900);
    return () => window.clearInterval(id);
  }, [playing, still]);

  const steps = still ? GAME.length : Math.min(tick, GAME.length);
  const pieces = position(steps);
  const last = steps > 0 ? GAME[steps - 1][0] : null;

  return (
    <div aria-hidden className="relative aspect-square w-full max-w-80 md:max-w-96">
      <div className="grid size-full grid-cols-8">
        {Array.from({ length: 64 }, (_, i) => (
          <span
            key={i}
            className={clsx(
              (Math.floor(i / 8) + i) % 2 ? 'bg-accent' : 'bg-sky',
              last && (i === last[0] || i === last[1]) && 'ring-4 ring-flower ring-inset',
            )}
          />
        ))}
      </div>
      {pieces.map((p, i) => (
        <img
          key={i}
          src={img(p.kind)}
          alt=""
          width={45}
          height={45}
          className={clsx(
            'absolute top-0 left-0 size-[12.5%] p-[1%] transition-[translate,opacity,scale] duration-500 ease-out-expo motion-reduce:transition-none',
            !p.alive && 'scale-75 opacity-0',
          )}
          style={{ translate: `${(p.sq % 8) * 100}% ${Math.floor(p.sq / 8) * 100}%` }}
        />
      ))}
    </div>
  );
}
