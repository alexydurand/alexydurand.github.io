import { useEffect, useRef, useState, type MouseEvent } from 'react';
import clsx from '../lib/clsx';
import { nav, person } from '../data/content';
import { lockScroll, scrollToHash } from '../lib/scroll';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [dark, setDark] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  // Hide while scrolling down, show again when scrolling up.
  // The bar stays transparent; its text turns light over sections marked data-theme="dark".
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > last && y > 240);
      last = y;
      const below = document
        .elementsFromPoint(window.innerWidth / 2, (bar.current?.offsetHeight ?? 64) / 2)
        .find((el) => !bar.current?.parentElement?.contains(el));
      setDark(below?.closest('[data-theme]')?.getAttribute('data-theme') === 'dark');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('header-theme', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('header-theme', onScroll);
    };
  }, []);

  // Mobile menu: lock scroll, close on Escape, keep focus inside
  useEffect(() => {
    if (!open) return;
    lockScroll(true);
    const links = panel.current?.querySelectorAll<HTMLElement>('a, button');
    links?.[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
      if (e.key === 'Tab' && links?.length) {
        const first = links[0];
        const last = links[links.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          toggle.current?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          toggle.current?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      lockScroll(false);
    };
  }, [open]);

  const go = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setOpen(false);
    scrollToHash(href);
  };

  return (
    <header
      className={clsx(
        'fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-out-expo motion-reduce:transition-none',
        hidden && !open && '-translate-y-full',
      )}
    >
      <div
        ref={bar}
        className={clsx(
          'frame relative z-10 flex h-16 items-center justify-between transition-colors duration-300 md:h-20',
          open || dark ? 'text-bg' : 'text-ink',
        )}
      >
        <a
          href="#top"
          onClick={(e) => go(e, '#top')}
          className="-mx-2 px-2 py-3 text-body font-medium tracking-tight"
        >
          {person.firstName} {person.lastName}
        </a>

        <nav aria-label="Navigation principale" className="hidden md:block">
          <ul className="flex items-center gap-1 lg:gap-3">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={(e) => go(e, item.href)}
                  className="group relative block px-3 py-3 text-body"
                >
                  {item.label}
                  <span
                    aria-hidden
                    className="absolute inset-x-3 bottom-2 h-0.5 origin-right scale-x-0 bg-current transition-transform duration-300 ease-out-expo group-hover:origin-left group-hover:scale-x-100"
                  />
                </a>
              </li>
            ))}
            <li>
              <a
                href={person.cv}
                download
                className="ml-3 block rounded-full bg-accent px-5 py-3 text-body text-accent-ink transition-colors hover:bg-accent-deep focus-visible:bg-accent-deep"
              >
                CV
              </a>
            </li>
          </ul>
        </nav>

        <button
          ref={toggle}
          type="button"
          className="-mr-2 min-h-11 px-2 text-body font-medium md:hidden"
          aria-expanded={open}
          aria-controls="menu-mobile"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Fermer' : 'Menu'}
        </button>
      </div>

      <div
        id="menu-mobile"
        ref={panel}
        hidden={!open}
        className="fixed inset-0 bg-ink pt-24 text-bg md:hidden"
      >
        <nav aria-label="Menu" className="frame flex h-full flex-col justify-between pb-10">
          <ul>
            {nav.map((item, i) => (
              <li key={item.href} style={{ animationDelay: `${i * 60}ms` }} className="menu-item">
                <a
                  href={item.href}
                  onClick={(e) => go(e, item.href)}
                  className="display block py-2 text-[15vw] active:text-accent"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <a href={person.cv} download className="block rounded-full bg-accent px-5 py-4 text-center text-lead text-accent-ink">
            Télécharger mon CV
          </a>
        </nav>
      </div>
    </header>
  );
}
