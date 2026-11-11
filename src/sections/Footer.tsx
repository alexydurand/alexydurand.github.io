import { useEffect, useRef, type MouseEvent } from 'react';
import { gsap } from '../lib/gsap';
import { nav, person, ui } from '../data/content';
import { prefersReducedMotion } from '../lib/motion';
import { ridgePath, type Point } from '../lib/ridge';
import { scrollToHash } from '../lib/scroll';

const W = 1440;
const H = 520;

const ridge = (pts: Point[], jagged = false) => ridgePath(pts, W, H, jagged);

// Far to near. The second one is the Pic du Midi d'Ossau.
const HILLS = [
  {
    fill: 'fill-hill-1',
    d: ridge([
      [0, 250],
      [200, 212],
      [420, 236],
      [640, 196],
      [900, 226],
      [1150, 184],
      [W, 214],
    ]),
  },
  {
    fill: 'fill-hill-2',
    d: ridge(
      [
        [0, 300],
        [260, 278],
        [470, 262],
        [560, 214],
        [610, 150],
        [640, 118],
        [668, 160],
        [700, 104],
        [736, 146],
        [790, 214],
        [900, 252],
        [1120, 268],
        [1300, 246],
        [W, 270],
      ],
      true,
    ),
  },
  {
    fill: 'fill-hill-3',
    d: ridge([
      [0, 330],
      [260, 302],
      [520, 336],
      [800, 296],
      [1080, 330],
      [1300, 302],
      [W, 322],
    ]),
  },
  {
    fill: 'fill-hill-4',
    d: ridge([
      [0, 382],
      [300, 352],
      [600, 386],
      [900, 346],
      [1200, 376],
      [W, 352],
    ]),
  },
  {
    fill: 'fill-hill-5',
    d: ridge([
      [0, 428],
      [250, 406],
      [560, 440],
      [860, 402],
      [1150, 432],
      [W, 406],
    ]),
  },
  {
    fill: 'fill-hill-6',
    d: ridge([
      [0, 482],
      [360, 456],
      [720, 476],
      [1080, 452],
      [W, 470],
    ]),
  },
];

// Wildflowers on the near slopes
const FLOWERS: Point[] = [
  [120, 470],
  [210, 492],
  [330, 478],
  [460, 500],
  [980, 488],
  [1090, 470],
  [1210, 496],
  [1330, 480],
  [60, 505],
  [1390, 505],
  [520, 462],
  [900, 468],
];

const LINK = 'py-1 underline-offset-4 transition-colors hover:text-accent hover:underline';

export default function Footer() {
  const root = useRef<HTMLElement>(null);

  // The hills rise into place as the page ends, the nearest ones the most
  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<SVGElement>('[data-hill]').forEach((hill, i) => {
        gsap.fromTo(
          hill,
          { y: 24 + i * 26 },
          {
            y: 0,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom bottom', scrub: 0.6 },
          },
        );
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const go = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    scrollToHash(href);
  };

  const columns = [
    {
      title: ui.footer.site,
      links: nav.map((n) => ({
        label: n.label,
        href: n.href,
        onClick: (e: MouseEvent<HTMLAnchorElement>) => go(e, n.href),
      })),
    },
    {
      title: ui.footer.find,
      links: [
        { label: ui.email, href: `mailto:${person.email}` },
        { label: 'LinkedIn', href: person.linkedin, external: true },
        { label: 'GitHub', href: person.github, external: true },
      ],
    },
    {
      title: ui.footer.info,
      links: [
        { label: ui.footer.legal, href: 'mentions-legales.html' },
        {
          label: ui.footer.top,
          href: '#top',
          onClick: (e: MouseEvent<HTMLAnchorElement>) => go(e, '#top'),
        },
      ],
    },
  ];

  return (
    <footer ref={root} data-theme="dark" className="footer-land bg-sky text-ink overflow-hidden">
      {/* The viewBox starts just above the highest peak (y 104): no empty sky to scroll through */}
      <svg
        aria-hidden
        viewBox={`0 80 ${W} ${H - 80}`}
        preserveAspectRatio="none"
        className="mt-8 block h-[clamp(200px,28vw,400px)] w-full md:mt-12"
      >
        {HILLS.slice(0, -1).map((h) => (
          <path key={h.fill} data-hill d={h.d} className={h.fill} />
        ))}
        {/* Near hill with its flowers, rising together */}
        <g data-hill>
          <path d={HILLS[HILLS.length - 1].d} className="fill-hill-6" />
          {FLOWERS.map(([x, y], i) => (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={i % 3 ? 4 : 6}
              className={i % 2 ? 'fill-flower' : 'fill-paper'}
            />
          ))}
        </g>
      </svg>

      <div className="bg-hill-6 -mt-px pb-8">
        <div className="frame relative z-10 pt-2">
          <div className="bg-paper dark:bg-surface grid gap-10 rounded-2xl p-6 md:grid-cols-12 md:p-10">
            <div className="md:col-span-5">
              <p className="display text-[clamp(2.5rem,1rem+4vw,4.5rem)] leading-[0.95]">
                {person.firstName} {person.lastName}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a
                  href={person.cv}
                  download
                  className="bg-accent text-body text-accent-ink hover:bg-accent-deep inline-flex min-h-12 items-center rounded-full px-6 font-medium transition-colors"
                >
                  {ui.downloadCv}
                </a>
                <a
                  href={`mailto:${person.email}`}
                  className="text-body py-3 underline decoration-1 underline-offset-4 hover:decoration-2"
                >
                  {ui.footer.write}
                </a>
              </div>
            </div>
            <nav aria-label={ui.footer.label} className="grid gap-8 sm:grid-cols-3 md:col-span-7">
              {columns.map((c) => (
                <div key={c.title}>
                  <p className="text-small text-muted">{c.title}</p>
                  <ul className="text-body mt-3 flex flex-col items-start">
                    {c.links.map((l) => (
                      <li key={l.label}>
                        <a
                          href={l.href}
                          onClick={'onClick' in l ? l.onClick : undefined}
                          {...('external' in l ? { target: '_blank', rel: 'noreferrer' } : {})}
                          className={LINK}
                        >
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </div>
        <p data-theme="dark" className="frame text-small mt-6 text-white/70">
          © 2026 {person.firstName} {person.lastName} · Toulouse
        </p>
      </div>
    </footer>
  );
}
