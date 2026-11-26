import { useEffect, useState, type CSSProperties } from 'react';
import clsx from '../lib/clsx';
import { scrollToHash } from '../lib/scroll';
import { ui } from '../data/content';
import Keycap from './Keycap';

/**
 * A light key of the keyboard (Mes outils), turned a little, that appears once the visitor has scrolled past the
 * first screen and sinks under the pointer. Smaller on phones, where it can pass over the arrows of the rows.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 1.2);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => scrollToHash('#top')}
      aria-label={ui.backToTop}
      tabIndex={visible ? 0 : -1}
      style={{ '--key': 'var(--color-ink)' } as CSSProperties}
      className={clsx(
        'group ease-out-expo pointer-events-none fixed right-[var(--spacing-gutter)] bottom-[var(--spacing-gutter)] z-40 size-(--k) [transform:perspective(40rem)_rotateX(28deg)] cursor-pointer transition-[opacity,translate,visibility] duration-300 transform-3d [--k:3rem] md:[--k:3.75rem]', // taste-skill-ignore: floating button
        // Hidden, its key must not catch clicks either: invisible, not just transparent
        visible ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-4 opacity-0',
      )}
    >
      <Keycap
        light
        walls
        label={
          <svg
            viewBox="0 0 24 24"
            aria-hidden
            className="size-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        }
      />
    </button>
  );
}
