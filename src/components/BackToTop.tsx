import { useEffect, useState } from 'react';
import clsx from '../lib/clsx';
import { scrollToHash } from '../lib/scroll';
import { ui } from '../data/content';

/**
 * Round button that appears once the visitor has scrolled past the first screen. Not on phones, where it
 * covered the arrows of the rows and of the projects; the menu and the footer lead back up there.
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
      className={clsx(
        'group bg-accent text-accent-ink ease-out-expo hover:bg-accent-deep fixed right-[var(--spacing-gutter)] bottom-[var(--spacing-gutter)] z-40 grid size-14 place-items-center rounded-full shadow-lg transition-[opacity,translate,scale] duration-300 hover:scale-110 max-md:hidden md:size-16', // taste-skill-ignore: floating button
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
      )}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="ease-out-expo size-6 transition-transform duration-300 group-hover:-translate-y-0.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
