import { useRef } from 'react';
import useLazyScene from '../hooks/useLazyScene';
import useMediaQuery from '../hooks/useMediaQuery';
import clsx from '../lib/clsx';
import type { ChessScene } from '../three/chessScene';

const loadScene = () => import('../three/chessScene').then((m) => m.default);

/** Three 3D chess pieces floating beside the board; the scene loads and renders only while visible. */
export default function ChessPieces({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  useLazyScene<ChessScene>(host, canvas, loadScene, { mobile: false, reducedMotion });

  return (
    <div ref={host} aria-hidden className={clsx('relative', className)}>
      <canvas ref={canvas} className="absolute inset-0 size-full" />
    </div>
  );
}
