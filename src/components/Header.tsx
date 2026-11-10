import { useEffect, useRef, useState, type MouseEvent } from 'react';
import clsx from '../lib/clsx';
import { nav, person, setLang, ui } from '../data/content';

const TOGGLE =
  'text-body grid size-11 cursor-pointer place-items-center rounded-full font-medium transition-colors hover:bg-current/10';
import { lockScroll, scrollToHash } from '../lib/scroll';

/** True when a line of this element's own text passes through the point. */
function textAt(el: Element, x: number, y: number) {
  for (const node of el.childNodes) {
    if (node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim()) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const r of range.getClientRects()) {
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return true;
    }
  }
  return false;
}

/**
 * True when one of the bar's own words (name, links, "Menu") can't be read where it is: page text
 * lies under it, or a picture, or a card too close to the colour of the words (black card, dark text).
 */
function unreadable(header: HTMLElement, lightText: boolean) {
  // Still sliding back in after hiding: test the words where they are about to rest
  const slide = header.getBoundingClientRect().top;
  for (const word of header.querySelectorAll<HTMLElement>('[data-word]')) {
    const box = word.getBoundingClientRect();
    if (!box.width) continue;
    for (let x = box.left + 4; x < box.right; x += 20) {
      for (const y of [box.top - slide + box.height * 0.3, box.top - slide + box.height * 0.7]) {
        // From the top down, as far as the first thing that hides the rest
        for (const el of document.elementsFromPoint(x, y)) {
          if (header.contains(el)) continue;
          if (textAt(el, x, y)) return true;
          const wide = el.getBoundingClientRect().width >= window.innerWidth - 1;
          if (el.matches('img, canvas, video')) {
            if (wide) break;
            return true;
          }
          const [r, g, b, a = 1] =
            getComputedStyle(el)
              .backgroundColor.match(/[\d.]+/g)
              ?.map(Number) ?? [];
          if (r === undefined || a < 0.5) continue;
          // A full-width band is what the colour of the words already follows
          if (!wide && 0.2126 * r + 0.7152 * g + 0.0722 * b < 110 !== lightText) return true;
          break;
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
  let el: Element | null =
    document.elementsFromPoint(window.innerWidth / 2, y).find((e) => !header.contains(e)) ?? null;
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
  // Background taken from the band under the bar, while its words can't be read
  const [band, setBand] = useState<{ bg: string; light: boolean } | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [darkMode, setDarkMode] = useState(() =>
    document.documentElement.classList.contains('dark'),
  );

  const switchTheme = () => {
    const next = !darkMode;
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // Storage blocked: dark for this visit only
    }
    setDarkMode(next);
    window.dispatchEvent(new Event('header-theme'));
  };

  // Hide while scrolling down, show again when scrolling up.
  // The bar is transparent, its text light over sections marked data-theme="dark". While its words
  // can't be read (see unreadable) it takes the colour of the band below, so it still blends in.
  useEffect(() => {
    let last = window.scrollY;
    let down = false;
    let lightText = false;
    let pending = 0;
    const check = () => {
      pending = 0;
      const header = bar.current?.parentElement;
      // Hidden while scrolling down: nothing to read, skip the hit-testing
      if (header && !down) setBand(unreadable(header, lightText) ? bandUnder(header) : null);
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
        // The first one that belongs to a themed section: the intro's empty wrapper lies over the home page
        .find((el) => !bar.current?.parentElement?.contains(el) && el.closest('[data-theme]'));
      // Light words over sections marked dark, and everywhere once the page itself is dark,
      // except over what stays light (the home page)
      const theme = below?.closest('[data-theme]')?.getAttribute('data-theme');
      lightText =
        theme === 'dark' ||
        (document.documentElement.classList.contains('dark') && theme !== 'always-light');
      setDark(lightText);
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
        'ease-out-expo fixed inset-x-0 top-0 z-50 transition-[translate,background-color] duration-500 motion-reduce:transition-none',
        hidden && !open && '-translate-y-full',
      )}
      style={band && !open ? { backgroundColor: band.bg } : undefined}
    >
      <div
        ref={bar}
        className={clsx(
          'frame relative z-10 flex h-16 items-center justify-between transition-colors duration-300 md:h-20',
          open || (band ? band.light : dark) ? 'text-white' : 'text-coal',
        )}
      >
        <a
          href="#top"
          onClick={(e) => go(e, '#top')}
          className="text-body -mx-2 px-2 py-3 font-medium tracking-tight"
        >
          <span data-word>
            {person.firstName} {person.lastName}
          </span>
        </a>

        <div className="-mr-2 flex items-center gap-1 lg:mr-0">
          <nav aria-label={ui.mainNav} className="hidden lg:mr-3 lg:block">
            <ul className="flex items-center gap-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => go(e, item.href)}
                    className="group text-body relative block px-3 py-3"
                  >
                    <span data-word>{item.label}</span>
                    <span
                      aria-hidden
                      className="ease-out-expo absolute inset-x-3 bottom-2 h-0.5 origin-right scale-x-0 bg-current transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100"
                    />
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={person.cv}
                  download
                  className="bg-accent text-body text-accent-ink hover:bg-accent-deep focus-visible:bg-accent-deep ml-3 block rounded-lg px-5 py-3 transition-colors"
                >
                  CV
                </a>
              </li>
            </ul>
          </nav>

          <button
            type="button"
            onClick={() => setLang(ui.otherLang.lang === 'en' ? 'en' : 'fr')}
            lang={ui.otherLang.lang}
            aria-label={ui.otherLang.label}
            className={TOGGLE}
          >
            <span data-word aria-hidden>
              {ui.otherLang.short}
            </span>
          </button>
          <button
            type="button"
            onClick={switchTheme}
            aria-label={darkMode ? ui.toLight : ui.toDark}
            className={TOGGLE}
          >
            <svg
              data-word
              aria-hidden
              viewBox="0 0 24 24"
              className="size-5 fill-none stroke-current stroke-2"
              strokeLinecap="round"
            >
              {darkMode ? (
                <>
                  <circle cx="12" cy="12" r="4.5" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </>
              ) : (
                <path d="M20.5 14.5A8.5 8.5 0 1 1 9.5 3.5a7 7 0 0 0 11 11Z" />
              )}
            </svg>
          </button>

          <button
            ref={toggle}
            type="button"
            className="text-body min-h-11 px-2 font-medium lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            <span data-word>{open ? ui.close : ui.menu}</span>
          </button>
        </div>
      </div>

      <div
        id="menu-mobile"
        ref={panel}
        hidden={!open}
        className="bg-coal fixed inset-0 pt-24 text-white lg:hidden"
      >
        <nav aria-label={ui.menu} className="frame flex h-full flex-col justify-between pb-10">
          <ul>
            {nav.map((item, i) => (
              <li key={item.href} style={{ animationDelay: `${i * 60}ms` }} className="menu-item">
                <a
                  href={item.href}
                  onClick={(e) => go(e, item.href)}
                  className="display active:text-sand block py-1.5 text-[min(11vw,6.5svh)]"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={person.cv}
            download
            className="text-lead text-coal block rounded-lg bg-white px-5 py-4 text-center"
          >
            {ui.downloadCv}
          </a>
        </nav>
      </div>
    </header>
  );
}
