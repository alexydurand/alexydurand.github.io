import { useEffect, useRef, useState, type MouseEvent } from 'react';
import clsx from '../lib/clsx';
import { nav, person } from '../data/content';
import { lockScroll, scrollToHash } from '../lib/scroll';

/** True when a line of page text lies under one of the bar's own words (name, links, "Menu"). */
function textUnder(header: HTMLElement) {
  for (const word of header.querySelectorAll<HTMLElement>('[data-word]')) {
    const box = word.getBoundingClientRect();
    if (!box.width) continue;
    for (let x = box.left + 4; x < box.right; x += 20) {
      for (const y of [box.top + box.height * 0.3, box.top + box.height * 0.7]) {
        const el = document.elementsFromPoint(x, y).find((e) => !header.contains(e));
        if (!el) continue;
        // Hit-testing gives the element; its own text lines decide, not its whole box
        for (const node of el.childNodes) {
          if (node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim()) continue;
          const range = document.createRange();
          range.selectNodeContents(node);
          for (const r of range.getClientRects()) {
            if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return true;
          }
        }
      }
    }
  }
  return false;
}

/**
 * Colour of the full-width band under the bar (a section, a Loisirs row), not of a card inside it,
 * and whether it is dark enough to need light text.
 */
function bandUnder(header: HTMLElement) {
  const y = (header.firstElementChild?.getBoundingClientRect().height ?? 64) / 2;
  let el: Element | null = document.elementsFromPoint(window.innerWidth / 2, y).find((e) => !header.contains(e)) ?? null;
  for (; el; el = el.parentElement) {
    const bg = getComputedStyle(el).backgroundColor;
    const [r, g, b, a = 1] = bg.match(/[\d.]+/g)?.map(Number) ?? [];
    if (a > 0 && r !== undefined && el.getBoundingClientRect().width >= window.innerWidth - 1) {
      return { bg, light: 0.2126 * r + 0.7152 * g + 0.0722 * b < 110 };
    }
  }
  return null;
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [dark, setDark] = useState(false);
  // Background taken from the band under the bar, while page text sits under its words
  const [band, setBand] = useState<{ bg: string; light: boolean } | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  // Hide while scrolling down, show again when scrolling up.
  // The bar is transparent, its text light over sections marked data-theme="dark". While page text
  // sits under its own words it takes the colour of the band below (white, grey or black), so both
  // stay readable and the bar still blends in.
  useEffect(() => {
    let last = window.scrollY;
    let down = false;
    let pending = 0;
    const check = () => {
      pending = 0;
      const header = bar.current?.parentElement;
      // Hidden while scrolling down: nothing to read, skip the hit-testing
      if (header && !down) setBand(textUnder(header) ? bandUnder(header) : null);
    };
    const onScroll = () => {
      const y = window.scrollY;
      down = y > last && y > 240;
      setHidden(down);
      last = y;
      // At most every 80 ms: the test hit-tests a few dozen points
      if (!pending) pending = window.setTimeout(check, 80);
      const below = document
        .elementsFromPoint(window.innerWidth / 2, (bar.current?.offsetHeight ?? 64) / 2)
        .find((el) => !bar.current?.parentElement?.contains(el));
      setDark(below?.closest('[data-theme]')?.getAttribute('data-theme') === 'dark');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('header-theme', onScroll);
    return () => {
      window.clearTimeout(pending);
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
    // Restart scrolling first: while the menu is open it is stopped and would ignore the jump
    lockScroll(false);
    scrollToHash(href);
  };

  return (
    <header
      className={clsx(
        'fixed inset-x-0 top-0 z-50 transition-[translate,background-color] duration-500 ease-out-expo motion-reduce:transition-none',
        hidden && !open && '-translate-y-full',
      )}
      style={band && !open ? { backgroundColor: band.bg } : undefined}
    >
      <div
        ref={bar}
        className={clsx(
          'frame relative z-10 flex h-16 items-center justify-between transition-colors duration-300 md:h-20',
          open || (band ? band.light : dark) ? 'text-bg' : 'text-ink',
        )}
      >
        <a
          href="#top"
          onClick={(e) => go(e, '#top')}
          className="-mx-2 px-2 py-3 text-body font-medium tracking-tight"
        >
          <span data-word>
            {person.firstName} {person.lastName}
          </span>
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
                  <span data-word>{item.label}</span>
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
                className="ml-3 block rounded-lg bg-accent px-5 py-3 text-body text-accent-ink transition-colors hover:bg-accent-deep focus-visible:bg-accent-deep"
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
          <span data-word>{open ? 'Fermer' : 'Menu'}</span>
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
          <a href={person.cv} download className="block rounded-lg bg-accent px-5 py-4 text-center text-lead text-accent-ink">
            Télécharger mon CV
          </a>
        </nav>
      </div>
    </header>
  );
}
