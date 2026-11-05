import { useCallback, useEffect, useRef, type RefObject } from 'react';

export type SceneOptions = { mobile: boolean; reducedMotion: boolean };

export interface SceneHandle {
  setProgress(p: number): void;
  setActive(active: boolean): void;
  resize(): void;
  dispose(): void;
}

export type SceneFactory<T extends SceneHandle> = (
  canvas: HTMLCanvasElement,
  options: SceneOptions,
) => T;

/**
 * Loads a Three.js scene module only when its section approaches the viewport,
 * and renders it only while the section is on screen.
 */
export default function useLazyScene<T extends SceneHandle>(
  host: RefObject<HTMLElement | null>,
  canvas: RefObject<HTMLCanvasElement | null>,
  load: () => Promise<SceneFactory<T>>,
  options: SceneOptions,
  // Shrinks the on-screen test, for a section that sits under another one before it shows
  activeMargin = '0px',
) {
  const scene = useRef<T | null>(null);
  const progress = useRef(0);
  const visible = useRef(false);
  const { mobile, reducedMotion } = options;

  useEffect(() => {
    const hostEl = host.current;
    const canvasEl = canvas.current;
    if (!hostEl || !canvasEl) return;
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;

    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        load().then((factory) => {
          if (cancelled) return;
          const instance = factory(canvasEl, { mobile, reducedMotion });
          instance.setProgress(progress.current);
          instance.setActive(visible.current);
          scene.current = instance;
          resizeObserver = new ResizeObserver(() => instance.resize());
          resizeObserver.observe(canvasEl);
        });
      },
      { rootMargin: '150% 0px' },
    );
    const onScreen = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        scene.current?.setActive(entry.isIntersecting);
      },
      { rootMargin: activeMargin },
    );
    near.observe(hostEl);
    onScreen.observe(hostEl);

    return () => {
      cancelled = true;
      near.disconnect();
      onScreen.disconnect();
      resizeObserver?.disconnect();
      scene.current?.dispose();
      scene.current = null;
    };
  }, [host, canvas, load, mobile, reducedMotion, activeMargin]);

  const setProgress = useCallback((p: number) => {
    progress.current = p;
    scene.current?.setProgress(p);
  }, []);

  return { scene, setProgress };
}
