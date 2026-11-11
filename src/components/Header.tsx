import { useEffect, useRef, useState, type MouseEvent } from 'react';
import clsx from '../lib/clsx';
import { lang, nav, person, setLang, ui } from '../data/content';
import { lockScroll, scrollToHash } from '../lib/scroll';
import frFlag from '../assets/flags/fr.svg';
import gbFlag from '../assets/flags/gb.svg';

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
  // Over a stack of bands (the skills hills): the colour of the frontmost one, whatever lies under the bar
  const [stackBg, setStackBg] = useState<string | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  // Hide while scrolling down, show again when scrolling up.
  // The bar is transparent, its text dark over sections marked data-theme="light". While its words
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
      // Hidden: nothing to colour. The hit-testing below is most of what scrolling costs on this page
      if (down) return;
      // At most every 80 ms: the test hit-tests a few dozen points
      if (!pending) pending = window.setTimeout(check, 80);
      const below = document
        .elementsFromPoint(window.innerWidth / 2, (bar.current?.offsetHeight ?? 64) / 2)
        // The first one that belongs to a themed section: the intro's empty wrapper lies over the home page
        .find((el) => !bar.current?.parentElement?.contains(el) && el.closest('[data-theme]'));
      // The frontmost band of a stack is the last one that has come well into view
      const stack = below?.closest('[data-header-stack]');
      const front =
        stack &&
        ([...stack.querySelectorAll('[data-theme]')]
          .filter((el) => el.getBoundingClientRect().top < window.innerHeight * 0.7)
          .pop() ??
          stack);
      // Light words on the dark page, dark ones over what stays light (home page, skills review)
      lightText = (front || below?.closest('[data-theme]'))?.getAttribute('data-theme') !== 'light';
      setDark(lightText);
      setStackBg(front ? getComputedStyle(front).backgroundColor : null);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(pending);
      window.removeEventListener('scroll', onScroll);
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

  const fill = stackBg ? { bg: stackBg, light: dark } : band;

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
      style={fill && !open ? { backgroundColor: fill.bg } : undefined}
    >
      <div
        ref={bar}
        className={clsx(
          'frame relative z-10 flex h-16 items-center justify-between transition-colors duration-300 md:h-20',
          open || (fill ? fill.light : dark) ? 'text-white' : 'text-coal',
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
                  className="bg-coal text-body hover:bg-surface-2 focus-visible:bg-surface-2 ml-3 block rounded-lg px-5 py-3 text-white ring-1 ring-white/20 transition-colors ring-inset"
                >
                  CV
                </a>
              </li>
            </ul>
          </nav>

          {/* The flag of the language being read; a click switches to the other one */}
          <button
            type="button"
            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
            lang={ui.otherLang.lang}
            aria-label={ui.otherLang.label}
            title={ui.otherLang.label}
            className="group grid size-11 cursor-pointer place-items-center rounded-full transition-colors hover:bg-current/10"
          >
            <img
              src={lang === 'fr' ? frFlag : gbFlag}
              alt=""
              width={24}
              height={24}
              className="ease-out-expo size-6 rounded-full ring-1 ring-current/25 transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none"
            />
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
