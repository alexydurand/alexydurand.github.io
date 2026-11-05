import { useEffect, type RefObject } from 'react';
import { ScrollTrigger } from '../lib/gsap';

/** Calls `onProgress` with 0→1 while `wrapper` scrolls from its top to its bottom edge. */
export default function useScrollProgress(
  wrapper: RefObject<HTMLElement | null>,
  onProgress: (p: number) => void,
  enabled = true,
) {
  useEffect(() => {
    const el = wrapper.current;
    if (!el || !enabled) return;
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => onProgress(self.progress),
      onRefresh: (self) => onProgress(self.progress),
    });
    return () => st.kill();
  }, [wrapper, onProgress, enabled]);
}
