import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { prefersReducedMotion } from '../lib/motion';
import { setLenis } from '../lib/scroll';

/** Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync. */
export default function useSmoothScroll() {
  // Scroll animations measure positions once: measure again whenever the page height changes
  // (a Loisirs row opening, late images), or everything below would trigger at the wrong place
  useEffect(() => {
    let timer = 0;
    let height = document.body.offsetHeight;
    const ro = new ResizeObserver(() => {
      if (document.body.offsetHeight === height) return;
      height = document.body.offsetHeight;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    ro.observe(document.body);
    return () => {
      ro.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
    setLenis(lenis);
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);
}
