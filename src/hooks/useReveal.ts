import { useEffect, type RefObject } from 'react';
import { gsap } from '../lib/gsap';
import { prefersReducedMotion } from '../lib/motion';

/**
 * Entrance for every [data-reveal] element inside `root`: rises 28px and fades in once,
 * staggered by its data-reveal value (0, 1, 2… → 0, 80, 160ms).
 */
export default function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>('[data-reveal]').forEach((item) => {
        const order = Number(item.dataset.reveal) || 0;
        gsap.to(item, {
          opacity: 1,
          y: 0,
          duration: 1.1,
          delay: order * 0.08,
          ease: 'expo.out',
          scrollTrigger: { trigger: item, start: 'top 90%', once: true },
        });
      });
    }, el);
    return () => ctx.revert();
  }, [root]);
}
