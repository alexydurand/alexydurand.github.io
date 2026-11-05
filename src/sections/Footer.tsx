import { useEffect, useRef, type MouseEvent } from 'react';
import { gsap } from '../lib/gsap';
import { person } from '../data/content';
import { prefersReducedMotion } from '../lib/motion';
import { scrollToHash } from '../lib/scroll';

export default function Footer() {
  const root = useRef<HTMLElement>(null);
  const name = useRef<HTMLParagraphElement>(null);

  // The name grows into place as the page ends
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        name.current,
        { scale: 0.92, yPercent: 30 },
        {
          scale: 1,
          yPercent: 0,
          ease: 'none',
          transformOrigin: '50% 100%',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom bottom', scrub: true },
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  const toTop = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToHash('#top');
  };

  return (
    <footer ref={root} data-theme="dark" className="overflow-hidden bg-ink text-bg">
      <div className="frame flex flex-col gap-4 pt-16 text-small sm:flex-row sm:items-start sm:justify-between md:pt-24">
        <p>
          © 2026 {person.firstName} {person.lastName}
        </p>
        <a href="mentions-legales.html" className="-my-3 py-3 underline decoration-1 underline-offset-4 hover:decoration-2">
          Mentions légales et crédits
        </a>
        <a href="#top" onClick={toTop} className="-my-3 py-3 underline decoration-1 underline-offset-4 hover:decoration-2">
          Retour en haut
        </a>
      </div>
      <p
        ref={name}
        aria-hidden
        className="display mt-10 pb-[0.22em] text-center text-[12.2vw] leading-none whitespace-nowrap will-change-transform"
      >
        {person.firstName} {person.lastName}
      </p>
    </footer>
  );
}
